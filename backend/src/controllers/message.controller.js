import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Get the list of users for the sidebar (excluding the logged-in user)
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // Get the logged-in user's ID
    // Find all users excluding the logged-in user and return them
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all messages between the logged-in user and another user
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; // Get the user we want to chat with
    const myId = req.user._id; // Get the logged-in user's ID

    // Find all messages between the two users
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

// Send a new message to another user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body; // Extract message text and image (if any)
    const { id: receiverId } = req.params; // Get the receiver's user ID
    const senderId = req.user._id; // Get the logged-in user's ID

    let imageUrl;
    // If an image is provided, upload it to Cloudinary and get the URL
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url; // Store the image URL
    }

    // Create a new message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      status: "sent", // Default status is "sent"
    });

    // Save the message to the database
    await newMessage.save();

    // Get the socket ID of the receiver
    const receiverSocketId = getReceiverSocketId(receiverId);

    // If the receiver is online (connected via WebSocket)
    if (receiverSocketId) {
      // Emit the "newMessage" event to the receiver
      io.to(receiverSocketId).emit("newMessage", newMessage);

      // Update the message status to "delivered"
      newMessage.status = "delivered";
      await newMessage.save();

      // Notify the sender that the message has been delivered
      const senderSocketId = getReceiverSocketId(senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdated", {
          _id: newMessage._id,
          status: "delivered",
        });
      }
    }

    // Respond with the created message
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark messages as "seen" when the receiver views them
export const markMessagesSeen = async (req, res) => {
  try {
    const { id: senderId } = req.params; // Get the sender's ID (the person I'm chatting with)
    const receiverId = req.user._id; // Get the logged-in user's ID (receiver)

    // Find all unseen messages between the sender and receiver
    const unseenMessages = await Message.find({
      senderId,
      receiverId,
      status: { $ne: "seen" }, // Only get messages that are not marked as "seen"
    });

    // Update all unseen messages to "seen" status
    await Message.updateMany(
      { senderId, receiverId, status: { $ne: "seen" } },
      { $set: { status: "seen" } }
    );

    // Notify the sender that their messages have been seen
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      unseenMessages.forEach((msg) => {
        io.to(senderSocketId).emit("messageStatusUpdated", {
          _id: msg._id,
          status: "seen",
        });
      });
    }

    // Respond with success
    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in markMessagesSeen: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};