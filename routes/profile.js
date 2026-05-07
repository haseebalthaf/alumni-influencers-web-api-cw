const express = require("express");
const {
  getProfile,
  createOrUpdateProfile,
  uploadProfileImage,
  getProfileImage,
  searchProfiles,
  getProfileById,
} = require("../controllers/profileController");
const { authenticateToken, checkPermission } = require("../middleware/apiAuth");
const { 
  validateProfileUpdate,
  validateSearch,
  validateProfileId
} = require("../middleware/validation");

const router = express.Router();

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Profile' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/", authenticateToken, checkPermission("read:alumni"), getProfile);

/**
 * @swagger
 * /api/profile/search:
 *   get:
 *     summary: Search profiles by name or current/past company
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Case-insensitive partial match against firstName / lastName
 *       - in: query
 *         name: company
 *         schema: { type: string }
 *         description: Case-insensitive partial match against employmentHistory.company
 *     responses:
 *       200:
 *         description: Up to 20 matching profiles (limited fields)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProfileSearchResult' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get("/search", authenticateToken, checkPermission("read:alumni"), searchProfiles);

/**
 * @swagger
 * /api/profile/{id}:
 *   get:
 *     summary: Get profile by user ID
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: User _id
 *     responses:
 *       200:
 *         description: Profile retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Profile' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/:id", authenticateToken, checkPermission("read:alumni"), getProfileById);

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create or update the current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProfileUpsertRequest' }
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Profile' }
 *       201:
 *         description: Profile created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Profile' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post(
  "/",
  authenticateToken,
  checkPermission("read:alumni"),
  validateProfileUpdate,
  createOrUpdateProfile,
);

/**
 * @swagger
 * /api/profile/upload-image:
 *   post:
 *     summary: Upload a profile image (max 5MB, image/* only)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image stored on disk and filename persisted on the profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 filename: { type: string, description: 'Use with GET /api/profile/image/{filename}' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.post("/upload-image", authenticateToken, checkPermission("read:alumni"), uploadProfileImage);

/**
 * @swagger
 * /api/profile/image/{filename}:
 *   get:
 *     summary: Get profile image
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image file
 */
router.get("/image/:filename", getProfileImage);

module.exports = router;
