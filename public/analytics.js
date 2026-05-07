document.addEventListener("DOMContentLoaded", async () => {
  if (!window.SharedUtils?.validateToken()) {
    return;
  }

  const logoutBtn = document.getElementById("sidebarLogoutBtn");
  const exportSkillsBtn = document.getElementById("exportSkillsBtn");
  const industryFilterEl = document.getElementById("industryFilter");
  const degreeFilterEl = document.getElementById("degreeFilter");

  logoutBtn?.addEventListener("click", window.SharedUtils?.handleLogout || handleLogout);
  exportSkillsBtn?.addEventListener("click", handleExportSkillsData);
  industryFilterEl?.addEventListener("change", handleFilterChange);
  degreeFilterEl?.addEventListener("change", handleFilterChange);
  
  await loadAnalytics();
});
