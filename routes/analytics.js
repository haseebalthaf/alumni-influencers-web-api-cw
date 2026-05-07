const express = require("express");
const {
  getSkillsAnalytics,
  getIndustryDistribution,
  getCareerPaths,
  getCertificationTrends,
  getAlumniGrowth,
  getCoursesLicences,
} = require("../controllers/analyticsController");
const { authenticateToken, checkPermission } = require("../middleware/apiAuth");

const router = express.Router();

router.get(
  "/skills",
  authenticateToken,
  checkPermission("read:analytics"),
  getSkillsAnalytics,
);

router.get(
  "/industries",
  authenticateToken,
  checkPermission("read:analytics"),
  getIndustryDistribution,
);

router.get(
  "/career-paths",
  authenticateToken,
  checkPermission("read:analytics"),
  getCareerPaths,
);

router.get(
  "/certification-trends",
  authenticateToken,
  checkPermission("read:analytics"),
  getCertificationTrends,
);
router.get(
  "/alumni-growth",
  authenticateToken,
  checkPermission("read:analytics"),
  getAlumniGrowth,
);

router.get(
  "/courses",
  authenticateToken,
  checkPermission("read:analytics"),
  getCoursesLicences,
);

module.exports = router;
