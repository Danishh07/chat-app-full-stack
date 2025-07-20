import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};