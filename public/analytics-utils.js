/**
 * Analytics Dashboard Utilities
 * Shared utilities for analytics functionality across dashboard and analytics pages
 */

// Configuration / token are sourced from window.SharedUtils (shared/utils.js)
// to avoid redeclaring the same top-level identifiers across classic scripts.

// Chart configuration
const chartIds = {
  skills: "skillsChart",
  industry: "industryChart",
  growth: "growthChart",
  certifications: "certificationChart",
  careers: "careerChart",
  courses: "coursesChart",
};

// Global state
const chartInstances = {};
let skillsData = [];
let industryData = [];
let careerPathsData = [];
let selectedIndustry = "";
let selectedDegree = "";

// =====================
// Authentication
// =====================

function showTokenError(message) {
  const mainContent = document.querySelector(".main-content");
  if (mainContent) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "token-error";
    errorDiv.innerHTML = `
      <div class="token-error-content">
        <h3>⚠️ Authentication Error</h3>
        <p>${message}</p>
        <button onclick="handleTokenError()">Return to Login</button>
      </div>
    `;
    mainContent.insertBefore(errorDiv, mainContent.firstChild);
  }
}

function handleTokenError() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// =====================
// API Calls
// =====================

async function fetchAnalytics(endpoint) {
  const apiBase = window.SharedUtils?.API_BASE || "http://localhost:3000/api";
  const token = window.SharedUtils?.getToken?.() || localStorage.getItem("token");

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${apiBase}/analytics/${endpoint}`, {
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    if (response.status === 403) {
      throw new Error(
        errorBody?.message ||
          "Access denied: invalid API key or insufficient permissions."
      );
    }
    throw new Error(errorBody?.message || "Failed to load analytics data");
  }

  const json = await response.json();
  return json.data || [];
}

async function fetchSkillsAnalytics() {
  return fetchAnalytics("skills");
}

async function fetchIndustryDistribution() {
  return fetchAnalytics("industries");
}

async function fetchCareerPaths() {
  return fetchAnalytics("career-paths");
}

async function fetchCertificationTrends() {
  return fetchAnalytics("certification-trends");
}

async function fetchAlumniGrowth() {
  return fetchAnalytics("alumni-growth");
}

// =====================
// Chart Management
// =====================

function clearChartMessage(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const existing = canvas.parentElement.querySelector(".chart-status");
  if (existing) {
    existing.remove();
  }
}

function destroyChart(canvasId) {
  const existing = chartInstances[canvasId];
  if (existing) {
    existing.destroy();
    delete chartInstances[canvasId];
  }
}

function showChartLoading(canvasId) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  clearChartMessage(canvasId);
  const loadingNode = document.createElement("div");
  loadingNode.className = "chart-status chart-loading";
  loadingNode.textContent = "Loading...";
  canvas.parentElement.appendChild(loadingNode);
}

function showChartError(canvasId, message) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  clearChartMessage(canvasId);
  const errorNode = document.createElement("div");
  errorNode.className = "chart-status chart-error";
  errorNode.textContent = message;
  canvas.parentElement.appendChild(errorNode);
}

function isChartDataValid(config) {
  const labels = config?.data?.labels;
  const datasets = config?.data?.datasets;
  if (!Array.isArray(labels) || !labels.length) return false;
  if (!Array.isArray(datasets) || !datasets.length) return false;
  return datasets.some((dataset) => Array.isArray(dataset.data) && dataset.data.length > 0);
}

function createChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  // Check if Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.error('Chart.js is not loaded. Please ensure Chart.js is loaded before analytics-utils.js');
    showChartError(canvasId, "Chart library not loaded. Please refresh the page.");
    return null;
  }

  if (!isChartDataValid(config)) {
    showChartError(canvasId, "No data available to render this chart.");
    return null;
  }

  destroyChart(canvasId);
  clearChartMessage(canvasId);

  const ctx = canvas.getContext("2d");
  const chart = new Chart(ctx, config);
  chartInstances[canvasId] = chart;
  return chart;
}

// =====================
// Chart Configurations
// =====================

function buildBarConfig(labels, values, labelText) {
  return {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: labelText,
          data: values,
          backgroundColor: "rgba(102, 126, 234, 0.7)",
          borderColor: "rgba(102, 126, 234, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
    },
  };
}

function renderSkillsChart(data) {
  const labels = data.map((entry) => entry.name);
  const values = data.map((entry) => entry.count);

  const config = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Top Skills",
          data: values,
          backgroundColor: "rgba(102, 126, 234, 0.7)",
          borderColor: "rgba(102, 126, 234, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
        title: {
          display: true,
          text: "Top Skills",
        },
      },
    },
  };

  return createChart(chartIds.skills, config);
}

function renderIndustryChart(data) {
  const labels = data.map((entry) => entry.name);
  const values = data.map((entry) => entry.count);

  const colors = [
    "#667eea",
    "#764ba2",
    "#3b82f6",
    "#9333ea",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#0ea5e9",
    "#8b5cf6",
    "#14b8a6",
  ];

  const config = {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          label: "Industry Distribution",
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
        tooltip: { enabled: true },
        title: {
          display: true,
          text: "Industry Distribution",
        },
      },
    },
  };

  return createChart(chartIds.industry, config);
}

function renderGrowthChart(data) {
  const labels = data.map((entry) => entry.month);
  const values = data.map((entry) => entry.count);

  const config = {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Alumni growth",
          data: values,
          fill: true,
          backgroundColor: "rgba(102, 126, 234, 0.18)",
          borderColor: "rgba(102, 126, 234, 1)",
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "rgba(102, 126, 234, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Month",
          },
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Profiles Created",
          },
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
        title: {
          display: true,
          text: "Alumni Growth",
        },
      },
    },
  };

  return createChart(chartIds.growth, config);
}

function renderCertificationTrendsChart(data) {
  const labels = data.map((entry) => entry.month);
  const values = data.map((entry) => entry.count);

  const config = {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Certification trends",
          data: values,
          fill: true,
          backgroundColor: "rgba(102, 126, 234, 0.18)",
          borderColor: "rgba(102, 126, 234, 1)",
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "rgba(102, 126, 234, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Month",
          },
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Certifications Completed",
          },
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
        title: {
          display: true,
          text: "Certification Trends",
        },
      },
    },
  };

  return createChart(chartIds.certifications, config);
}

function renderCareerPathsChart(data) {
  const labels = data.map((entry) => `${entry.degree} / ${entry.role}`);
  const values = data.map((entry) => entry.count);

  const config = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Career paths",
          data: values,
          backgroundColor: "rgba(102, 126, 234, 0.7)",
          borderColor: "rgba(102, 126, 234, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Role",
          },
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Count",
          },
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
        title: {
          display: true,
          text: "Career Paths",
        },
      },
    },
  };

  return createChart(chartIds.careers, config);
}

// =====================
// Chart Loading
// =====================

async function loadAnalytics() {
  // Ensure Chart.js is loaded before proceeding
  if (typeof Chart === 'undefined') {
    console.error('Chart.js is not loaded. Waiting for Chart.js to load...');
    // Wait for Chart.js to load (retry after a short delay)
    setTimeout(() => {
      if (typeof Chart !== 'undefined') {
        loadAnalytics();
      } else {
        console.error('Chart.js failed to load. Please check your internet connection and refresh the page.');
        // Show error on all chart canvases
        Object.values(chartIds).forEach(canvasId => {
          showChartError(canvasId, "Chart library failed to load. Please refresh the page.");
        });
      }
    }, 1000);
    return;
  }

  await Promise.all([
    loadSkillsDemandChart(),
    loadIndustryDistributionChart(),
    loadAlumniGrowthChart(),
    loadCertificationTrendsChart(),
    loadCareerPathsChart(),
    loadCoursesLicencesChart(),
  ]).catch(() => {
    // Individual chart handlers already display errors.
  });
}

async function loadSkillsDemandChart() {
  showChartLoading(chartIds.skills);
  try {
    const items = await fetchSkillsAnalytics();
    skillsData = items;
    renderSkillsChart(items);
  } catch (error) {
    showChartError(chartIds.skills, error.message);
  }
}

async function loadIndustryDistributionChart() {
  showChartLoading(chartIds.industry);
  try {
    const items = await fetchIndustryDistribution();
    industryData = items;
    populateIndustryFilter(items);
    applyFilters();
  } catch (error) {
    showChartError(chartIds.industry, error.message);
  }
}

async function loadAlumniGrowthChart() {
  showChartLoading(chartIds.growth);
  try {
    const items = await fetchAlumniGrowth();
    renderGrowthChart(items);
  } catch (error) {
    showChartError(chartIds.growth, error.message);
  }
}

async function loadCertificationTrendsChart() {
  showChartLoading(chartIds.certifications);
  try {
    const items = await fetchCertificationTrends();
    renderCertificationTrendsChart(items);
  } catch (error) {
    showChartError(chartIds.certifications, error.message);
  }
}

async function loadCareerPathsChart() {
  showChartLoading(chartIds.careers);
  try {
    const items = await fetchCareerPaths();
    careerPathsData = items;
    populateDegreeFilter(items);
    applyFilters();
  } catch (error) {
    showChartError(chartIds.careers, error.message);
  }
}

async function loadCoursesLicencesChart() {
  showChartLoading(chartIds.courses);
  try {
    const items = await fetchAnalytics("courses");
    const labels = items.map((entry) => entry.name);
    const values = items.map((entry) => entry.count);
    createChart(
      chartIds.courses,
      buildBarConfig(labels, values, "Courses / Licences")
    );
  } catch (error) {
    showChartError(chartIds.courses, error.message);
  }
}

// =====================
// Export & Filtering
// =====================

function handleExportSkillsData() {
  if (!skillsData || !skillsData.length) {
    showChartError(chartIds.skills, "No skills data available to export.");
    return;
  }

  const csvRows = ["Skill,Count"];
  skillsData.forEach((entry) => {
    const label = `"${String(entry.name).replace(/"/g, '""')}"`;
    const count = entry.count ?? "";
    csvRows.push(`${label},${count}`);
  });

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "skills_data.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Download a chart as PNG image
 * @param {string} canvasId - ID of the canvas element
 * @param {string} filename - Name of the file to download
 */
function downloadChartAsImage(canvasId, filename = "chart.png") {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas element with ID '${canvasId}' not found`);
    return;
  }

  try {
    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, "image/png", 1.0);
  } catch (error) {
    console.error("Error downloading chart:", error);
    alert("Failed to download chart image. Please try again.");
  }
}

/**
 * Download skills chart
 */
function downloadSkillsChart() {
  downloadChartAsImage(chartIds.skills, "skills_analytics.png");
}

/**
 * Download industry chart
 */
function downloadIndustryChart() {
  downloadChartAsImage(chartIds.industry, "industry_distribution.png");
}

/**
 * Download growth chart
 */
function downloadGrowthChart() {
  downloadChartAsImage(chartIds.growth, "alumni_growth.png");
}

/**
 * Download certifications chart
 */
function downloadCertificationsChart() {
  downloadChartAsImage(chartIds.certifications, "certification_trends.png");
}

/**
 * Download career paths chart
 */
function downloadCareerPathsChart() {
  downloadChartAsImage(chartIds.careers, "career_paths.png");
}

/**
 * Show dialog to save filter preset
 */
function showSavePresetDialog() {
  const presetName = prompt("Enter a name for this filter preset:");
  if (presetName && presetName.trim()) {
    saveFilterPreset(presetName.trim());
  }
}

// =====================
// Filter Presets
// =====================

const PRESETS_STORAGE_KEY = "analytics_filter_presets";

/**
 * Save current filters as a preset
 * @param {string} presetName - Name for the preset
 */
function saveFilterPreset(presetName) {
  if (!presetName || presetName.trim() === "") {
    alert("Please enter a preset name");
    return;
  }

  const presets = getFilterPresets();
  
  // Check if preset already exists
  if (presets.some(p => p.name === presetName)) {
    const overwrite = confirm(`Preset "${presetName}" already exists. Overwrite?`);
    if (!overwrite) return;
  }

  const newPreset = {
    name: presetName,
    industry: selectedIndustry,
    degree: selectedDegree,
    createdAt: new Date().toISOString()
  };

  // Remove old preset with same name if exists
  const filteredPresets = presets.filter(p => p.name !== presetName);
  filteredPresets.push(newPreset);

  localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(filteredPresets));
  alert(`Preset "${presetName}" saved successfully!`);
  refreshPresetsList();
}

/**
 * Get all saved presets
 * @returns {Array} Array of saved presets
 */
function getFilterPresets() {
  const presetsJson = localStorage.getItem(PRESETS_STORAGE_KEY);
  return presetsJson ? JSON.parse(presetsJson) : [];
}

/**
 * Load a preset
 * @param {string} presetName - Name of preset to load
 */
function loadFilterPreset(presetName) {
  const presets = getFilterPresets();
  const preset = presets.find(p => p.name === presetName);

  if (!preset) {
    alert("Preset not found");
    return;
  }

  selectedIndustry = preset.industry || "";
  selectedDegree = preset.degree || "";

  // Update filter dropdowns
  const industryFilter = document.getElementById("industryFilter");
  const degreeFilter = document.getElementById("degreeFilter");

  if (industryFilter) industryFilter.value = selectedIndustry;
  if (degreeFilter) degreeFilter.value = selectedDegree;

  applyFilters();
}

/**
 * Delete a preset
 * @param {string} presetName - Name of preset to delete
 */
function deleteFilterPreset(presetName) {
  const confirmed = confirm(`Are you sure you want to delete "${presetName}"?`);
  if (!confirmed) return;

  const presets = getFilterPresets();
  const filteredPresets = presets.filter(p => p.name !== presetName);

  localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(filteredPresets));
  alert(`Preset "${presetName}" deleted successfully!`);
  refreshPresetsList();
}

/**
 * Display presets in UI
 */
function refreshPresetsList() {
  const presetsContainer = document.getElementById("presetsContainer");
  if (!presetsContainer) return;

  const presets = getFilterPresets();
  presetsContainer.innerHTML = "";

  if (presets.length === 0) {
    presetsContainer.innerHTML = '<p style="color: #999; font-size: 0.9rem;">No presets saved yet</p>';
    return;
  }

  const presetsHtml = presets.map((preset, index) => `
    <div style="
      display: flex;
      gap: 8px;
      padding: 8px;
      background: rgba(102, 126, 234, 0.05);
      border-radius: 6px;
      margin-bottom: 8px;
      align-items: center;
      justify-content: space-between;
    ">
      <div style="flex: 1;">
        <button
          onclick="loadFilterPreset('${preset.name}')"
          style="
            background: none;
            border: none;
            color: #667eea;
            cursor: pointer;
            font-weight: 600;
            text-decoration: underline;
            padding: 0;
          "
        >
          ${preset.name}
        </button>
        <div style="font-size: 0.8rem; color: #999; margin-top: 2px;">
          Industry: ${preset.industry || "All"} | Degree: ${preset.degree || "All"}
        </div>
      </div>
      <button
        onclick="deleteFilterPreset('${preset.name}')"
        style="
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #dc2626;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        "
      >
        Delete
      </button>
    </div>
  `).join("");

  presetsContainer.innerHTML = presetsHtml;
}

function populateIndustryFilter(data) {
  const filterEl = document.getElementById("industryFilter");
  if (!filterEl) return;

  const uniqueIndustries = [...new Set(data.map((item) => item.name))];
  uniqueIndustries.forEach((industry) => {
    const option = document.createElement("option");
    option.value = industry;
    option.textContent = industry;
    filterEl.appendChild(option);
  });
}

function populateDegreeFilter(data) {
  const filterEl = document.getElementById("degreeFilter");
  if (!filterEl) return;

  const uniqueDegrees = [...new Set(data.map((item) => item.degree))];
  uniqueDegrees.forEach((degree) => {
    const option = document.createElement("option");
    option.value = degree;
    option.textContent = degree;
    filterEl.appendChild(option);
  });
}

function handleFilterChange() {
  const industryFilterEl = document.getElementById("industryFilter");
  const degreeFilterEl = document.getElementById("degreeFilter");
  selectedIndustry = industryFilterEl?.value || "";
  selectedDegree = degreeFilterEl?.value || "";
  applyFilters();
}

function applyFilters() {
  if (industryData.length) {
    const filteredIndustry = selectedIndustry
      ? industryData.filter((item) => item.name === selectedIndustry)
      : industryData;
    if (filteredIndustry.length) {
      renderIndustryChart(filteredIndustry);
    } else {
      showChartError(chartIds.industry, "No industry data matches this selection.");
    }
  }

  if (careerPathsData.length) {
    const filteredCareerPaths = selectedDegree
      ? careerPathsData.filter((item) => item.degree === selectedDegree)
      : careerPathsData;
    if (filteredCareerPaths.length) {
      renderCareerPathsChart(filteredCareerPaths);
    } else {
      showChartError(chartIds.careers, "No career paths match this selection.");
    }
  }
}
