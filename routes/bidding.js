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

/**
 * @swagger
 * /api/bidding/status:
 *   get:
 *     summary: Current month's bid status for the logged-in alumnus
 *     tags: [Bidding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bid status retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/BidStatus' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get("/status", protect, isAlumni, getBidStatus);

/**
 * @swagger
 * /api/bidding/bid:
 *   post:
 *     summary: Place a new bid or raise the existing one (only-increase rule)
 *     tags: [Bidding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PlaceBidRequest' }
 *     responses:
 *       200:
 *         description: Bid placed or raised
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 bid: { type: number, description: 'New bid amount' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.post(
  "/bid",
  protect,
  isAlumni,
  validatePlaceBid,
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
 *     summary: Bidding history (all months, newest first) for the logged-in alumnus
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
 *                   items: { $ref: '#/components/schemas/Bid' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get("/history", protect, isAlumni, getBidHistory);

/**
 * @swagger
 * /api/bidding/tomorrow-slot:
 *   get:
 *     summary: Get tomorrow's featured alumnus (preview)
 *     tags: [Public API]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Tomorrow's featured slot retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/WinnerSummary' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/tomorrow-slot", authenticateToken, getTomorrowSlot);

/**
 * @swagger
 * /api/bidding/today-winner:
 *   get:
 *     summary: Get today's featured alumnus
 *     tags: [Public API]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Today's winner retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/WinnerSummary' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/today-winner", authenticateToken, checkPermission("read:alumni_of_day"), getTodayWinner);

module.exports = router;
