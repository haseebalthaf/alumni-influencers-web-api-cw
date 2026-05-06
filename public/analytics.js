/**
 * Analytics Page - Page Initialization
 * Loaded by analytics.html
 * Uses shared analytics-utils.js for all chart/API logic
 */

document.addEventListener("DOMContentLoaded", async () => {
  if (!window.SharedUtils?.validateToken()) {
    return;
  }

  // Setup event listeners
  const logoutBtn = document.getElementById("sidebarLogoutBtn");
  const exportSkillsBtn = document.getElementById("exportSkillsBtn");
  const industryFilterEl = document.getElementById("industryFilter");
  const degreeFilterEl = document.getElementById("degreeFilter");

  logoutBtn?.addEventListener("click", window.SharedUtils?.handleLogout || handleLogout);
  exportSkillsBtn?.addEventListener("click", handleExportSkillsData);
  industryFilterEl?.addEventListener("change", handleFilterChange);
  degreeFilterEl?.addEventListener("change", handleFilterChange);
  
  // Load all charts
  await loadAnalytics();
});
