const Token = require("../models/Token");
const Usage = require("../models/Usage");

// Authenticate API requests with token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const apiToken = await Token.findOne({ token, isActive: true });

    if (!apiToken) {
      return res.status(401).json({ message: "Invalid or inactive token" });
    }

    // Check permissions
    if (!apiToken.permissions.includes("read") && req.method !== "GET") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    // Log usage
    await Usage.create({
      token: apiToken._id,
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Update last used and count
    apiToken.lastUsed = new Date();
    apiToken.usageCount += 1;
    await apiToken.save();

    req.apiToken = apiToken;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { authenticateToken };
