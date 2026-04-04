const express = require("express");
const { body } = require("express-validator");
const {
  getBidStatus,
  placeBid,
  getTodayWinner,
  getTomorrowSlot,
  getBidHistory,
  cancelBid,
} = require("../controllers/biddingController");
const { protect, isAlumni } = require("../middleware/auth");
const { authenticateToken } = require("../middleware/apiAuth");

const router = express.Router();

/**
 * @swagger
 * /api/bidding/status:
 *   get:
 *     summary: Get current bid status
 *     tags: [Bidding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bid status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentBid:
 *                   type: number
 *                 isWinning:
 *                   type: boolean
 *                 monthlyWins:
 *                   type: number
 *                 remainingSlots:
 *                   type: number
 *                 canBid:
 *                   type: boolean
 */
router.get("/status", protect, isAlumni, getBidStatus);

/**
 * @swagger
 * /api/bidding/bid:
 *   post:
 *     summary: Place or update bid
 *     tags: [Bidding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Bid placed successfully
 *       400:
 *         description: Invalid bid amount or limit reached
 */
router.post(
  "/bid",
  protect,
  isAlumni,
  body("amount").isNumeric().withMessage("Bid amount must be a number"),
  body("amount").custom((value) => {
    if (value <= 0) throw new Error("Bid amount must be greater than 0");
    return true;
  }),
  placeBid,
);

/**
 * @swagger
 * /api/bidding/cancel:
 *   post:
 *     summary: Cancel current active bid for this month
 *     tags: [Bidding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bid cancelled successfully
 *       404:
 *         description: No active bid found
 */
router.post("/cancel", protect, isAlumni, cancelBid);

/**
 * @swagger
 * /api/bidding/history:
 *   get:
 *     summary: Get bidding history for current user
 *     tags: [Bidding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bidding history retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 */
router.get("/history", protect, isAlumni, getBidHistory);

/**
 * @swagger
 * /api/bidding/tomorrow-slot:
 *   get:
 *     summary: Get tomorrow's featured slot
 *     tags: [Public API]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Tomorrow's featured slot retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 winner:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     biography:
 *                       type: string
 *                     linkedInUrl:
 *                       type: string
 *                     profileImage:
 *                       type: string
 *       404:
 *         description: No slot selected for tomorrow yet
 */
router.get("/tomorrow-slot", authenticateToken, getTomorrowSlot);

/**
 * @swagger
 * /api/bidding/today-winner:
 *   get:
 *     summary: Get today's featured alumnus
 *     tags: [Public API]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Today's winner retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 winner:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     biography:
 *                       type: string
 *                     linkedInUrl:
 *                       type: string
 *                     profileImage:
 *                       type: string
 *                     degrees:
 *                       type: array
 *                     certifications:
 *                       type: array
 *                     licences:
 *                       type: array
 *                     courses:
 *                       type: array
 *                     employmentHistory:
 *                       type: array
 *                 bidAmount:
 *                   type: number
 *       404:
 *         description: No winner selected for today
 */
router.get("/today-winner", authenticateToken, getTodayWinner);

module.exports = router;
