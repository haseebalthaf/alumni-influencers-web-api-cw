const express = require("express");
const {
  getBidStatus,
  placeBid,
  getTodayWinner,
  getTomorrowSlot,
  getBidHistory,
  cancelBid,
} = require("../controllers/biddingController");
const { protect, isAlumni } = require("../middleware/auth");
const { authenticateToken, checkPermission } = require("../middleware/apiAuth");
const { validatePlaceBid } = require("../middleware/validation");

const router = express.Router();

router.get("/status", protect, isAlumni, getBidStatus);
router.post("/bid", protect, isAlumni, validatePlaceBid, placeBid);
router.post("/cancel", protect, isAlumni, cancelBid);
router.get("/history", protect, isAlumni, getBidHistory);
router.get("/tomorrow-slot", authenticateToken, getTomorrowSlot);
router.get(
  "/today-winner",
  authenticateToken,
  checkPermission("read:alumni_of_day"),
  getTodayWinner,
);

module.exports = router;
