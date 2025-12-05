import { verifyToken as verifyJwt } from "../utils/jwt.js";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    res.setHeader("Cache-Control", "no-store");

    // Accept both:
    // 1) Web session → req.cookies.token
    // 2) Chrome extension → Authorization: Bearer TOKEN
    const tokenFromCookie = req.cookies?.token;
    const header = req.headers?.authorization;
    const tokenFromHeader =
      header && header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided.",
      });
    }

    // Decode JWT
    const decoded = verifyJwt(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    // Fetch user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Attach to request
    req.user = user;
    req.userId = user._id;

    return next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};
