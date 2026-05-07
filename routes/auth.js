const express = require("express");
const {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const {
  validateRegister,
  validateLogin,
  validatePasswordReset,
  validateResetPasswordToken,
} = require("../middleware/validation");

const router = express.Router();

router.post("/register", validateRegister, register);
router.get("/verify/:token", verifyEmail);
router.post("/login", validateLogin, login);
router.post("/logout", protect, logout);
router.post("/forgot-password", validatePasswordReset, forgotPassword);
router.post(
  "/reset-password/:token",
  validateResetPasswordToken,
  resetPassword,
);

module.exports = router;
