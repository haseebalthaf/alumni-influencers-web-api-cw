/**
 * Shared Utilities for Alumni Influencers Frontend
 * Common functions and constants used across all pages
 */

// Configuration
const API_BASE = "http://localhost:3000/api";

// Token Management
const getToken = () => localStorage.getItem("token");
const setToken = (token) => localStorage.setItem("token", token);
const removeToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
};

// Role helpers
const getRole = () => localStorage.getItem("userRole");

// Hide sidebar items whose data-role doesn't match the current user role.
// Elements without data-role are always shown. If role is unknown, nothing is hidden.
const applySidebarRoleVisibility = (container = document) => {
  const role = getRole();
  if (!role) return;
  container.querySelectorAll("[data-role]").forEach((el) => {
    const allowed = el.getAttribute("data-role").split(",").map((s) => s.trim());
    if (!allowed.includes(role)) {
      el.remove();
    }
  });
};

// Navigation
const navigateTo = (url) => window.location.href = url;

// Logout (calls API for proper session cleanup)
const handleLogout = async () => {
  try {
    const token = getToken();
    if (token) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.warn("Logout API call failed, clearing token anyway:", error);
  }

  removeToken();
  navigateTo("login.html");
};

// Token Validation
const validateToken = () => {
  const token = getToken();
  if (!token) {
    navigateTo("login.html");
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    if (payload.exp < now) {
      removeToken();
      navigateTo("login.html");
      return false;
    }
    return true;
  } catch (error) {
    removeToken();
    navigateTo("login.html");
    return false;
  }
};

// Error Handling
const showError = (message) => {
  alert(`Error: ${message}`);
};

const showSuccess = (message) => {
  alert(`Success: ${message}`);
};

// Export for use in other files
window.SharedUtils = {
  API_BASE,
  getToken,
  setToken,
  removeToken,
  getRole,
  applySidebarRoleVisibility,
  navigateTo,
  handleLogout,
  validateToken,
  showError,
  showSuccess
};