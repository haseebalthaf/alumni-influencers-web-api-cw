const { body, param, query, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation error",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

const validateRegister = [
  body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Invalid email format")
    .matches(/@my\.westminster\.ac\.uk$/)
    .withMessage("Email must be from @my.westminster.ac.uk domain"),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "First name can only contain letters, spaces, hyphens, and apostrophes",
    ),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "Last name can only contain letters, spaces, hyphens, and apostrophes",
    ),
  handleValidationErrors,
];

const validateLogin = [
  body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Invalid email format"),
  body("password").trim().notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const validatePasswordReset = [
  body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Invalid email format"),
  handleValidationErrors,
];

const validateResetPasswordToken = [
  body("newPassword")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("token").trim().notEmpty().withMessage("Reset token is required"),
  handleValidationErrors,
];

const validateProfileUpdate = [
  body("personalInfo.firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("First name contains invalid characters"),
  body("personalInfo.lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("Last name contains invalid characters"),
  body("personalInfo.biography")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Biography must not exceed 500 characters"),
  body("linkedInUrl")
    .optional()
    .trim()
    .if((value) => value !== "")
    .isURL({ require_protocol: true, protocols: ["http", "https"] })
    .withMessage("Invalid LinkedIn URL"),
  body("degrees.*.title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Degree title must be between 1 and 100 characters"),
  body("degrees.*.university")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("University name must be between 1 and 100 characters"),
  body("certifications.*.title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Certification title must be between 1 and 100 characters"),
  body("certifications.*.issuingBody")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Issuing body must be between 1 and 100 characters"),
  handleValidationErrors,
];

const validatePlaceBid = [
  body("amount")
    .notEmpty()
    .withMessage("Bid amount is required")
    .isFloat({ min: 0.01 })
    .withMessage("Bid amount must be a positive number"),
  handleValidationErrors,
];

const validateSearch = [
  query("q")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search query must not exceed 100 characters")
    .escape()
    .withMessage("Search query contains invalid characters"),
  query("industry").optional().trim().escape(),
  query("degree").optional().trim().escape(),
  query("year").optional().isInt().withMessage("Year must be a valid number"),
  handleValidationErrors,
];

const validateProfileId = [
  param("id").isMongoId().withMessage("Invalid profile ID format"),
  handleValidationErrors,
];

const validateCreateApiKey = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("API key name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("API key name must be between 1 and 100 characters"),
  body("permissions")
    .optional()
    .isArray()
    .withMessage("Permissions must be an array")
    .custom((value) => {
      const allowedPermissions = [
        "read",
        "write",
        "admin",
        "read:alumni",
        "read:analytics",
        "read:alumni_of_day",
      ];
      const isValid =
        Array.isArray(value) &&
        value.every((p) => allowedPermissions.includes(p));
      if (!isValid) {
        throw new Error(
          "Invalid permission. Must be one of: " +
            allowedPermissions.join(", "),
        );
      }
      return true;
    }),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validatePasswordReset,
  validateResetPasswordToken,
  validateProfileUpdate,
  validatePlaceBid,
  validateSearch,
  validateProfileId,
  validateCreateApiKey,
};
