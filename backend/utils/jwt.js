import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dopeguard_secret";
const EXPIRY = "7d";

export const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, SECRET, {
    expiresIn: EXPIRY,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
};
