import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.offlineAdmin && process.env.ALLOW_OFFLINE_ADMIN_LOGIN === "true") {
      req.user = {
        _id: decoded.id,
        name: process.env.DEFAULT_ADMIN_NAME || "Offline Admin",
        phone: process.env.DEFAULT_ADMIN_PHONE || "9999999999",
        email: process.env.DEFAULT_ADMIN_EMAIL,
        role: "admin",
        isActive: true,
        offline: true
      };
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Not authorized, user unavailable" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
}

export async function optionalProtect(req, res, next) {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.offlineAdmin && process.env.ALLOW_OFFLINE_ADMIN_LOGIN === "true") {
      req.user = {
        _id: decoded.id,
        name: process.env.DEFAULT_ADMIN_NAME || "Offline Admin",
        phone: process.env.DEFAULT_ADMIN_PHONE || "9999999999",
        email: process.env.DEFAULT_ADMIN_EMAIL,
        role: "admin",
        isActive: true,
        offline: true
      };
      return next();
    }

    req.user = await User.findById(decoded.id).select("-password");
  } catch (error) {
    req.user = null;
  }

  return next();
}
