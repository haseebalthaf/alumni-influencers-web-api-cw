const Token = require("../models/Token");
const Usage = require("../models/Usage");
const crypto = require("crypto");
const { selectWinnerForDate } = require("../services/winnerService");

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
    res.status(500).json({
      message: "Server error while creating token",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
    res.status(500).json({
      message: "Server error while retrieving tokens",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
    res.status(500).json({
      message: "Server error while revoking token",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
    res.status(500).json({
      message: "Server error while updating token",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
    res.status(500).json({
      message: "Server error while retrieving usage statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const selectWinner = async (req, res) => {
  try {
    const result = await selectWinnerForDate({
      forToday: req && req.query && req.query.forToday === "true",
    });

    res.json({
      message: `Winner selected successfully for ${result.dateLabel}`,
      winner: {
        userId: result.winner.user,
        amount: result.winner.amount,
        date: result.winner.date,
        month: result.winner.month,
      },
    });
  } catch (error) {
    console.error("Select winner error:", error);
    if (error.status) {
      return res.status(error.status).json({
        message: error.message,
        ...(typeof error.monthlyWins !== "undefined" && {
          monthlyWins: error.monthlyWins,
        }),
        ...(typeof error.lastWinMonth !== "undefined" && {
          lastWinMonth: error.lastWinMonth,
        }),
        ...(typeof error.allowedWins !== "undefined" && {
          allowedWins: error.allowedWins,
        }),
      });
    }

    res.status(500).json({
      message: "Server error while selecting winner",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createToken,
  getTokens,
  revokeToken,
  updateToken,
  getUsageStats,
  selectWinner,
};
