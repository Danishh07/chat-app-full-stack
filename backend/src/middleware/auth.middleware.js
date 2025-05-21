import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token = null;

    // 1. First check cookies (using the correct cookie name 'token')
    if (req.cookies?.token) {
      token = req.cookies.token;
      console.log('Token found in cookies');
    }
    // 2. Fallback to Authorization header
    else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      console.log('Token found in Authorization header');
    }

    if (!token) {
      console.log('No token found in request. Cookies:', req.cookies);
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // 3. Verify token with enhanced error handling
    const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT Verification Error:', err.name);
        throw new Error('Invalid token');
      }
      return decoded;
    });

    // 4. Find user - REMOVE .cache() method
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log('User not found for ID:', decoded.userId);
      return res.status(404).json({ message: "User not found" });
    }

    // 5. Attach user and token to request
    req.user = user;
    req.token = token;
    console.log('Authenticated user:', user._id);

    next();
  } catch (error) {
    console.error("ProtectRoute Error:", {
      message: error.message,
      stack: error.stack,
      cookies: req.cookies,
      headers: req.headers
    });

    const status = error.message.includes('token') ? 401 : 500;
    res.status(status).json({ 
      message: error.message.includes('token') 
        ? "Unauthorized - Invalid Token" 
        : "Authentication failed",
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};