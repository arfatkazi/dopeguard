import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dopeguard_secret_key"; // fallback for local
const EXPIRY = process.env.JWT_EXPIRY || "7d";

/**
 * 🪙 Generate JWT Token
 * @param {Object} user - User object with _id and email
 * @returns {string} Signed JWT token
 */
export const generateToken = (user) => {
  if (!user || !user._id) {
    throw new Error("Cannot generate token: invalid user data");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
    },
    SECRET,
    { expiresIn: EXPIRY }
  );
};

/**
 * 🧠 Verify JWT Token
 * @param {string} token - JWT token string
 * @returns {object|null} Decoded payload if valid, null if invalid
 */
export const verifyToken = (token) => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded;
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    return null;
  }
};
