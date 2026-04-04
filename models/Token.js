const mongoose = require("mongoose");
const crypto = require("crypto");

const tokenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  permissions: [
    {
      type: String,
      enum: ["read", "write", "admin"],
      default: ["read"],
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsed: Date,
  usageCount: {
    type: Number,
    default: 0,
  },
});

tokenSchema.pre("save", function (next) {
  if (!this.token) {
    this.token = crypto.randomBytes(32).toString("hex");
  }
  next();
});

module.exports = mongoose.model("Token", tokenSchema);
