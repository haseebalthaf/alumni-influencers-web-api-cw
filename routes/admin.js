const express = require("express");
const { body } = require("express-validator");
const {
  createToken,
  getTokens,
  revokeToken,
  updateToken,
  getUsageStats,
  selectWinner,
} = require("../controllers/adminController");
const { protect, isAdmin } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * /api/admin/tokens:
 *   post:
 *     summary: Create a new API token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name for the token
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 default: ["read"]
 *     responses:
 *       201:
 *         description: Token created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/tokens",
  protect,
  isAdmin,
  body("name").notEmpty().trim().withMessage("Token name is required"),
  createToken,
);

/**
 * @swagger
 * /api/admin/tokens:
 *   get:
 *     summary: Get all API tokens
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tokens
 *       401:
 *         description: Unauthorized
 */
router.get("/tokens", protect, isAdmin, getTokens);

/**
 * @swagger
 * /api/admin/tokens/{id}:
 *   delete:
 *     summary: Revoke an API token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token revoked
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Token not found
 */
router.delete("/tokens/:id", protect, isAdmin, revokeToken);

/**
 * @swagger
 * /api/admin/tokens/{id}:
 *   put:
 *     summary: Update token permissions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Token updated
 *       401:
 *         description: Unauthorized
 */
router.put("/tokens/:id", protect, isAdmin, updateToken);

/**
 * @swagger
 * /api/admin/usage:
 *   get:
 *     summary: Get API token usage statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage statistics
 *       401:
 *         description: Unauthorized
 */
router.get("/usage", protect, isAdmin, getUsageStats);

/**
 * @swagger
 * /api/admin/select-winner:
 *   post:
 *     summary: Manually select the highest bidder as winner
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: forToday
 *         schema:
 *           type: string
 *           enum: [true]
 *         description: Set to 'true' to select winner for today (for testing), otherwise selects for tomorrow
 *     responses:
 *       200:
 *         description: Winner selected successfully
 *       400:
 *         description: No active bids or winner already selected
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No bids found
 */
router.post("/select-winner", protect, isAdmin, selectWinner);

module.exports = router;
