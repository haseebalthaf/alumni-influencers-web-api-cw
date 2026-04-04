const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  bid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bid",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
});

winnerSchema.index({ date: -1 });
winnerSchema.index({ user: 1, month: 1 });

module.exports = mongoose.model("Winner", winnerSchema);
