const Token = require("../models/Token");
const Usage = require("../models/Usage");
const Winner = require("../models/Winner");
const Bid = require("../models/Bid");
const Profile = require("../models/Profile");
const cron = require("node-cron");
const crypto = require("crypto");

const createToken = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Token name is required" });
    }

    const token = await Token.create({
      name,
      token: crypto.randomBytes(32).toString("hex"),
      permissions: permissions || ["read"],
      createdBy: req.user._id,
    });

    res.status(201).json({
      token: token.token,
      name: token.name,
      permissions: token.permissions,
    });
  } catch (error) {
    console.error("Error creating token:", error);
    res
      .status(500)
      .json({
        message: "Server error while creating token",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
  }
};

const getTokens = async (req, res) => {
  try {
    const tokens = await Token.find()
      .select("-token")
      .populate("createdBy", "email");
    res.json(tokens);
  } catch (error) {
    console.error("Error fetching tokens:", error);
    res
      .status(500)
      .json({
        message: "Server error while retrieving tokens",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
  }
};

const revokeToken = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    token.isActive = false;
    await token.save();

    res.json({ message: "Token revoked successfully" });
  } catch (error) {
    console.error("Revoke token error:", error);
    res
      .status(500)
      .json({
        message: "Server error while revoking token",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
  }
};

const updateToken = async (req, res) => {
  try {
    const { permissions } = req.body;

    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    if (permissions && Array.isArray(permissions)) {
      token.permissions = permissions;
    }

    await token.save();

    res.json({
      message: "Token updated successfully",
      token: { name: token.name, permissions: token.permissions },
    });
  } catch (error) {
    console.error("Update token error:", error);
    res
      .status(500)
      .json({
        message: "Server error while updating token",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
  }
};

const getUsageStats = async (req, res) => {
  try {
    const stats = await Usage.aggregate([
      {
        $group: {
          _id: "$token",
          count: { $sum: 1 },
          lastUsed: { $max: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "tokens",
          localField: "_id",
          foreignField: "_id",
          as: "tokenInfo",
        },
      },
      {
        $unwind: "$tokenInfo",
      },
      {
        $project: {
          name: "$tokenInfo.name",
          count: 1,
          lastUsed: 1,
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("Get usage stats error:", error);
    res
      .status(500)
      .json({
        message: "Server error while retrieving usage statistics",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
  }
};

const selectWinner = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const targetDate =
      req && req.query && req.query.forToday === "true"
        ? new Date() // Today for testing
        : (() => {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            d.setHours(0, 0, 0, 0);
            return d;
          })(); // Tomorrow normally

    const dateLabel =
      req && req.query && req.query.forToday === "true" ? "today" : "tomorrow";

    // Check if winner already selected for target date
    const existingWinner = await Winner.findOne({
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingWinner) {
      return res
        .status(400)
        .json({ message: `Winner already selected for ${dateLabel}` });
    }

    // Get highest bid
    const highestBid = await Bid.findOne({
      month: currentMonth,
      status: "active",
    })
      .sort({ amount: -1 })
      .populate("user");

    const profileDateMonth = targetDate.toISOString().slice(0, 7);

    if (!highestBid) {
      return res
        .status(404)
        .json({ message: "No active bids found for this month" });
    }

    // Validate user exists
    if (!highestBid.user) {
      return res.status(500).json({ message: "Invalid bid: user not found" });
    }

    // Get user profile
    const profile = await Profile.findOne({ user: highestBid.user._id });

    if (!profile) {
      return res
        .status(404)
        .json({
          message: `Profile not found for highest bidder (${highestBid.user.email})`,
        });
    }

    const activeMonthWins =
      profile.lastWinMonth === profileDateMonth ? profile.monthlyWins : 0;
    const extraWin =
      profile.eventParticipationMonth === profileDateMonth ? 1 : 0;
    const allowedWins = 3 + extraWin;

    if (activeMonthWins >= allowedWins) {
      return res.status(400).json({
        message: `User has reached monthly win limit of ${allowedWins} wins in ${profileDateMonth}`,
        monthlyWins: activeMonthWins,
        lastWinMonth: profile.lastWinMonth,
        allowedWins,
      });
    }

    // Create winner
    const winner = await Winner.create({
      user: highestBid.user._id,
      profile: profile._id,
      bid: highestBid._id,
      amount: highestBid.amount,
      date: targetDate,
      month: profileDateMonth,
    });

    // Update bid status
    highestBid.status = "won";
    await highestBid.save();

    // Update profile
    profile.monthlyWins += 1;
    profile.lastWinMonth = profileDateMonth;
    await profile.save();

    // Mark other bids as lost
    await Bid.updateMany(
      {
        month: currentMonth,
        status: "active",
        _id: { $ne: highestBid._id },
      },
      { status: "lost" },
    );

    res.json({
      message: `Winner selected successfully for ${dateLabel}`,
      winner: {
        userId: winner.user,
        amount: winner.amount,
        date: winner.date,
        month: winner.month,
      },
    });
  } catch (error) {
    console.error("Select winner error:", error);
    res
      .status(500)
      .json({
        message: "Server error while selecting winner",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
  }
};

// Schedule daily winner selection at 6 PM
cron.schedule("0 18 * * *", async () => {
  console.log("Running scheduled winner selection...");
  try {
    // Simulate admin request for winner selection
    const currentMonth = new Date().toISOString().slice(0, 7);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const profileDateMonth = tomorrow.toISOString().slice(0, 7);

    // Check if winner already selected for tomorrow
    const existingWinner = await Winner.findOne({
      date: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingWinner) return;

    // Get highest bid
    const highestBid = await Bid.findOne({
      month: currentMonth,
      status: "active",
    })
      .sort({ amount: -1 })
      .populate("user");

    if (!highestBid) return;

    const profile = await Profile.findOne({ user: highestBid.user._id });
    if (!profile) return;

    const activeMonthWins =
      profile.lastWinMonth === profileDateMonth ? profile.monthlyWins : 0;
    const extraWin =
      profile.eventParticipationMonth === profileDateMonth ? 1 : 0;
    const allowedWins = 3 + extraWin;

    if (activeMonthWins >= allowedWins) return;

    // Create winner
    await Winner.create({
      user: highestBid.user._id,
      profile: profile._id,
      bid: highestBid._id,
      amount: highestBid.amount,
      date: tomorrow,
      month: profileDateMonth,
    });

    highestBid.status = "won";
    await highestBid.save();

    profile.monthlyWins += 1;
    profile.lastWinMonth = profileDateMonth;
    await profile.save();

    await Bid.updateMany(
      {
        month: currentMonth,
        status: "active",
        _id: { $ne: highestBid._id },
      },
      { status: "lost" },
    );

    console.log("Winner selected successfully");
  } catch (error) {
    console.error("Error in scheduled winner selection:", error);
  }
});

module.exports = {
  createToken,
  getTokens,
  revokeToken,
  updateToken,
  getUsageStats,
  selectWinner,
};
