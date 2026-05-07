const jwt = require("jsonwebtoken");
const Token = require("../models/Token");
const Usage = require("../models/Usage");
const User = require("../models/User");
const Blacklist = require("../models/Blacklist");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const apiToken = await Token.findOne({ token, isActive: true });

    if (apiToken) {
      await Usage.create({
        token: apiToken._id,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      apiToken.lastUsed = new Date();
      apiToken.usageCount += 1;
      await apiToken.save();

      req.apiToken = apiToken;
      return next();
    }

    const blacklistedToken = await Blacklist.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({ message: "Invalid or revoked token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const checkPermission = (permission) => async (req, res, next) => {
  if (req.apiToken) {
    if (!req.apiToken.permissions.includes(permission)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    return next();
  }

  if (req.user) {
    const permissionRoles = {
      "read:analytics": ["admin", "alumni"],
      "read:alumni": ["admin", "alumni"],
      "read:alumni_of_day": ["admin", "alumni"],
      read: ["admin", "alumni"],
    };

    const allowedRoles = permissionRoles[permission] || ["admin"];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    return next();
  }

  return res.status(401).json({ message: "Token not authenticated" });
};

module.exports = { authenticateToken, checkPermission };
