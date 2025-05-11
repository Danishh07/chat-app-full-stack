import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Setting the token in the cookie
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true, // Protect from XSS
    sameSite: "strict", // Prevent CSRF attacks
    secure: process.env.NODE_ENV !== "development", // Ensure cookies are sent over HTTPS in production
  });

  return token;
};
