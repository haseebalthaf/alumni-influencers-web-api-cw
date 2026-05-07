const express = require('express');
const {
  getSkillsAnalytics,
  getIndustryDistribution,
  getCareerPaths,
  getCertificationTrends,
  getAlumniGrowth,
  getCoursesLicences,
} = require('../controllers/analyticsController');
const { authenticateToken, checkPermission } = require('../middleware/apiAuth');

const router = express.Router();

/**
 * Helper: every analytics endpoint returns the same envelope, so we describe
 * it once via $ref. Each route's `data[]` item shape is documented inline
 * (NameCount / MonthCount / CareerPathRow) using allOf.
 *
 * @swagger
 * components:
 *   schemas:
 *     SkillsAnalyticsResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/AnalyticsEnvelope'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items: { $ref: '#/components/schemas/NameCount' }
 *     IndustryAnalyticsResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/AnalyticsEnvelope'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items: { $ref: '#/components/schemas/NameCount' }
 *     CareerPathsResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/AnalyticsEnvelope'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items: { $ref: '#/components/schemas/CareerPathRow' }
 *     MonthlySeriesResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/AnalyticsEnvelope'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items: { $ref: '#/components/schemas/MonthCount' }
 */

/**
 * @swagger
 * /api/analytics/skills:
 *   get:
 *     summary: Top 10 most common certification titles ("skills")
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Skills demand counts, sorted descending
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SkillsAnalyticsResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get('/skills', authenticateToken, checkPermission('read:analytics'), getSkillsAnalytics);

/**
 * @swagger
 * /api/analytics/industries:
 *   get:
 *     summary: Distribution of alumni across companies (called "industries" in UI)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Per-company counts, sorted descending
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/IndustryAnalyticsResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get('/industries', authenticateToken, checkPermission('read:analytics'), getIndustryDistribution);

/**
 * @swagger
 * /api/analytics/career-paths:
 *   get:
 *     summary: Top 20 (degree, role) combinations across alumni
 *     description: |
 *       Counts the Cartesian pairing of `degrees[].title` and `employmentHistory[].position`
 *       for every alumnus. An alumnus with 2 degrees and 3 jobs contributes 6 rows pre-grouping,
 *       so counts measure (degree, role) co-occurrences, not unique people.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Top (degree, role) co-occurrences, sorted descending
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CareerPathsResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get('/career-paths', authenticateToken, checkPermission('read:analytics'), getCareerPaths);

/**
 * @swagger
 * /api/analytics/certification-trends:
 *   get:
 *     summary: Certifications completed per month across all alumni
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Monthly time series sorted ascending
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MonthlySeriesResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get('/certification-trends', authenticateToken, checkPermission('read:analytics'), getCertificationTrends);

/**
 * @swagger
 * /api/analytics/alumni-growth:
 *   get:
 *     summary: Profiles created per month
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Monthly time series sorted ascending
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MonthlySeriesResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get('/alumni-growth', authenticateToken, checkPermission('read:analytics'), getAlumniGrowth);

/**
 * @swagger
 * /api/analytics/courses:
 *   get:
 *     summary: Top 10 course / licence titles (merged across both arrays)
 *     description: |
 *       Aggregates `courses[].title` and `licences[].title` separately, then merges
 *       on title. Identical titles in both arrays are summed into one row.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Top 10 merged titles, sorted descending
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/IndustryAnalyticsResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get('/courses', authenticateToken, checkPermission('read:analytics'), getCoursesLicences);

module.exports = router;
