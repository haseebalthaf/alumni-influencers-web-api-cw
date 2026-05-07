const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Blacklist = require("../models/Blacklist");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const blacklistedToken = await Blacklist.findOne({ token });
      if (blacklistedToken) {
        return res
          .status(401)
          .json({ message: "Not authorized, token has been revoked" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

const isAlumni = (req, res, next) => {
  if (req.user && req.user.role === "alumni") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Alumni only." });
  }
};

const isAlumniOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "alumni" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Alumni or Admin only." });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

module.exports = { protect, isAlumni, isAlumniOrAdmin, isAdmin };
