import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      status: "sent", // ✅ Default to sent
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      // Deliver the message
      io.to(receiverSocketId).emit("newMessage", newMessage);

      // ✅ Update status to delivered
      newMessage.status = "delivered";
      await newMessage.save();

      // ✅ Notify sender about delivery
      const senderSocketId = getReceiverSocketId(senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdated", {
          _id: newMessage._id,
          status: "delivered",
        });
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessagesSeen = async (req, res) => {
  try {
    const { id: senderId } = req.params; // person I'm chatting with
    const receiverId = req.user._id;

    const unseenMessages = await Message.find({
      senderId,
      receiverId,
      status: { $ne: "seen" },
    });

    // Update all unseen messages
    await Message.updateMany(
      { senderId, receiverId, status: { $ne: "seen" } },
      { $set: { status: "seen" } }
    );

    // Notify sender about seen messages
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      unseenMessages.forEach((msg) => {
        io.to(senderSocketId).emit("messageStatusUpdated", {
          _id: msg._id,
          status: "seen",
        });
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in markMessagesSeen: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};