import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// backend base URL in production
const BASE_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5001"
  : "https://whisp-50wo.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      
      // Save token to localStorage
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      set({ authUser: res.data });
      toast.success("Account created successfully");
      
      // Add a delay before connecting socket
      setTimeout(() => {
        get().connectSocket();
      }, 500);
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed!";
      toast.error(message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      
      // Save token to localStorage
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      
      // Add a small delay to allow token to be set
      setTimeout(() => {
        get().connectSocket();
      }, 500);
    } catch (error) {
      const message = error.response?.data?.message || "Login failed!";
      toast.error(message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      // Clear token from localStorage
      localStorage.removeItem('token');
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      const message = error.response?.data?.message || "Logout failed!";
      toast.error(message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      const message = error.response?.data?.message || "Update failed!";
      toast.error(message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    // Get token for socket auth
    const token = localStorage.getItem('token');

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
      auth: {
        token: token // Include token for socket authentication
      },
      transports: ["websocket"],
      withCredentials: true
    });

    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));