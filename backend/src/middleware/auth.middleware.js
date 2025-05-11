import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
  try {
    let token;

    // 1. Check for token in cookies
    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }
    // 2. Check for token in Authorization header (Bearer token)
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If no token is found, send an Unauthorized response
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // Verify the token using JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // If the token is invalid, send an Unauthorized response
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // Find the user by the decoded userId and exclude password field
    const user = await User.findById(decoded.userId).select("-password");
    
    // If user is not found, send a not found response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach the user object to the request for further processing in the route
    req.user = user;
    
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Log the error and send an Internal Server Error response
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};