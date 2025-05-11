import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://whisp-opal.vercel.app"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ Read Receipt Events
  socket.on("messageDelivered", async ({ messageId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { status: "delivered" });
      io.emit("messageStatusUpdated", { messageId, status: "delivered" });
    } catch (error) {
      console.error("Error marking message as delivered:", error);
    }
  });

  socket.on("messageSeen", async ({ chatId, userId }) => {
    try {
      await Message.updateMany(
        { chatId, receiverId: userId, status: { $ne: "seen" } },
        { $set: { status: "seen" } }
      );
      io.emit("chatSeen", { chatId, userId });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
