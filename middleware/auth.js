const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Blacklist = require("../models/Blacklist");

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Check if token is blacklisted
      const blacklistedToken = await Blacklist.findOne({ token });
      if (blacklistedToken) {
        return res
          .status(401)
          .json({ message: "Not authorized, token has been revoked" });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      return next();
    } catch (error) {
      console.error("Auth error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Check if user is alumni
const isAlumni = (req, res, next) => {
  if (req.user && req.user.role === "alumni") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Alumni only." });
  }
};

// Check if user is alumni or admin
const isAlumniOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "alumni" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Alumni or Admin only." });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

module.exports = { protect, isAlumni, isAlumniOrAdmin, isAdmin };
