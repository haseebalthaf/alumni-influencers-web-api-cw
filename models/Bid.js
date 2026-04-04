const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "won", "lost"],
    default: "active",
  },
  month: {
    type: String,
    required: true,
  },
});

bidSchema.index({ user: 1, month: 1 });
bidSchema.index({ date: -1 });

module.exports = mongoose.model("Bid", bidSchema);
