const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema({
  token: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Token",
    required: true,
  },
  endpoint: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
    enum: ["GET", "POST", "PUT", "DELETE"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ip: String,
  userAgent: String,
});

usageSchema.index({ token: 1, timestamp: -1 });

module.exports = mongoose.model("Usage", usageSchema);
