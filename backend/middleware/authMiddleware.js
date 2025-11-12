import { verifyToken as verifyJwt } from "../utils/jwt.js";
import User from "../models/User.js";

/**
 * 🔒 Auth Middleware
 * Validates JWT from cookies or Authorization header.
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // try cookie first, then Authorization header
    const tokenFromCookie = req.cookies?.token;
    const authHeader = req.headers?.authorization;
    const tokenFromHeader =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      console.log("AuthMiddleware: no token provided (cookies, headers):", {
        cookies: req.cookies,
        authorization: authHeader,
      });
      return res.status(401).json({
        success: false,
        message: "No token provided. Please log in again.",
      });
    }

    // verify token using jwt util
    const decoded = verifyJwt(token);
    if (!decoded || !decoded.id) {
      console.log("AuthMiddleware: token invalid or missing id:", decoded);
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token." });
    }

    // load user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("AuthMiddleware: user not found for id:", decoded.id);
      return res
        .status(401)
        .json({ success: false, message: "User not found or deleted." });
    }

    // attach user (full doc without password) to req
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err?.message || err);
    // if token expired the verifyJwt already returned null, but also guard
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};
