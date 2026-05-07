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
  validateProfileId,
} = require("../middleware/validation");

const router = express.Router();

router.get("/", authenticateToken, checkPermission("read:alumni"), getProfile);
router.get(
  "/search",
  authenticateToken,
  checkPermission("read:alumni"),
  searchProfiles,
);
router.get(
  "/:id",
  authenticateToken,
  checkPermission("read:alumni"),
  getProfileById,
);
router.post(
  "/",
  authenticateToken,
  checkPermission("read:alumni"),
  validateProfileUpdate,
  createOrUpdateProfile,
);
router.post(
  "/upload-image",
  authenticateToken,
  checkPermission("read:alumni"),
  uploadProfileImage,
);
router.get("/image/:filename", getProfileImage);

module.exports = router;
