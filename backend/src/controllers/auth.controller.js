import { generateToken, setTokenCookie } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";

// Enhanced error logger
const logError = (context, error) => {
  console.error(`\n[ERROR in ${context}]`);
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  if (error.response) console.error('Response:', error.response.data);
};

// Signup Controller
export const signup = async (req, res) => {
  console.log('\n[Signup Request] Body:', req.body);
  
  const { fullName, email, password } = req.body;
  try {
    // Validation
    if (!fullName || !email || !password) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      console.log('Validation failed: Password too short');
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check existing user
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: "Email already exists" });
    }

    // Password hashing
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    console.log('Saving user to database...');
    await newUser.save();
    console.log('User saved successfully:', newUser._id);

    // Generate token
    const token = generateToken(newUser._id);
    console.log('Token generated successfully');

    // Set cookie
    setTokenCookie(res, token);

    // Response
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      token: token // Include token in response
    });

  } catch (error) {
    logError('signup controller', error);
    res.status(500).json({ 
      message: "Internal Server Error",
      ...(process.env.NODE_ENV === 'development' && { debug: error.message })
    });
  }
};

// Login Controller
export const login = async (req, res) => {
  console.log('\n[Login Request] Body:', req.body);
  
  const { email, password } = req.body;
  try {
    // Verify database connection first
    console.log('Database connection state:', mongoose.connection.readyState);
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    // Find user
    console.log('Searching for user:', email);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Password check
    console.log('Comparing passwords...');
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Token generation
    console.log('Generating token...');
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing in environment variables');
    }
    const token = generateToken(user._id);
    console.log('Token generated successfully');

    // Set cookie
    setTokenCookie(res, token);

    // Response
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      token: token // Include token in response
    };

    console.log('Login successful for user:', user._id);
    res.status(200).json(userData);

  } catch (error) {
    console.error('\n[LOGIN ERROR DETAILS]');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      message: "Internal Server Error",
      ...(process.env.NODE_ENV === 'development' && { 
        debug: error.message,
        stack: error.stack
      })
    });
  }
};

// Logout Controller
export const logout = (req, res) => {
  console.log('\n[Logout Request]');
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    logError('logout controller', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Profile Picture Controller
export const updateProfile = async (req, res) => {
  console.log('\n[Update Profile Request] User:', req.user._id);
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      console.log('No profile picture provided');
      return res.status(400).json({ message: "Profile pic is required" });
    }

    console.log('Uploading to Cloudinary...');
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    console.log('Cloudinary upload successful:', uploadResponse.secure_url);

    console.log('Updating user profile...');
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    logError('updateProfile controller', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Check Authentication Controller
export const checkAuth = (req, res) => {
  console.log('\n[Check Auth Request] User:', req.user?._id);
  try {
    if (!req.user) {
      console.log('No authenticated user found');
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.status(200).json(req.user);
  } catch (error) {
    logError('checkAuth controller', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};