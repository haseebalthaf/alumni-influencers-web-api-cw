const express = require("express");
const { body } = require("express-validator");
const {
  getProfile,
  createOrUpdateProfile,
  uploadProfileImage,
  getProfileImage,
  searchProfiles,
  getProfileById,
} = require("../controllers/profileController");
const { protect, isAlumniOrAdmin } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, isAlumniOrAdmin, getProfile);

/**
 * @swagger
 * /api/profile/search:
 *   get:
 *     summary: Search profiles
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by name
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Search by company
 *     responses:
 *       200:
 *         description: Profiles found
 *       401:
 *         description: Unauthorized
 */
router.get("/search", protect, isAlumniOrAdmin, searchProfiles);

/**
 * @swagger
 * /api/profile/{id}:
 *   get:
 *     summary: Get profile by user ID
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get("/:id", protect, isAlumniOrAdmin, getProfileById);

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create or update profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personalInfo:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   biography:
 *                     type: string
 *               linkedInUrl:
 *                 type: string
 *               degrees:
 *                 type: array
 *               certifications:
 *                 type: array
 *               licences:
 *                 type: array
 *               courses:
 *                 type: array
 *               employmentHistory:
 *                 type: array
 *               sponsorshipOffers:
 *                 type: array
 *               eventParticipationMonth:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       201:
 *         description: Profile created
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  protect,
  isAlumniOrAdmin,
  body("personalInfo.firstName")
    .notEmpty()
    .trim()
    .withMessage("First name is required"),
  body("personalInfo.lastName")
    .notEmpty()
    .trim()
    .withMessage("Last name is required"),
  body("linkedInUrl")
    .optional()
    .isURL()
    .withMessage("LinkedIn URL must be valid"),
  createOrUpdateProfile,
);

/**
 * @swagger
 * /api/profile/upload-image:
 *   post:
 *     summary: Upload profile image
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded
 *       401:
 *         description: Unauthorized
 */
router.post("/upload-image", protect, isAlumniOrAdmin, uploadProfileImage);

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
