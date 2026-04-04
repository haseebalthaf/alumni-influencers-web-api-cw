const API_BASE = "http://localhost:3000/api";
let token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

// Load existing profile
window.addEventListener("load", loadProfile);

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  await saveProfile();
});

// Logout button
document.getElementById("logoutBtn").addEventListener("click", logout);

// Add buttons
document.getElementById("addDegreeBtn").addEventListener("click", addDegree);
document
  .getElementById("addCertificationBtn")
  .addEventListener("click", addCertification);
document.getElementById("addLicenceBtn").addEventListener("click", addLicence);
document.getElementById("addCourseBtn").addEventListener("click", addCourse);
document
  .getElementById("addEmploymentBtn")
  .addEventListener("click", addEmployment);

// Simple image preview
document.getElementById("profileImage").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      document.getElementById("imagePreview").src = event.target.result;
      document.getElementById("imagePreviewContainer").style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

async function loadProfile() {
  try {
    const response = await fetch(`${API_BASE}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const profile = await response.json();
      populateForm(profile);
    } else if (response.status === 404) {
      showMessage("Please fill out your profile", "success");
    }
  } catch (error) {
    showMessage("Error loading profile", "error");
  }
}

function populateForm(profile) {
  document.getElementById("firstName").value =
    profile.personalInfo?.firstName || "";
  document.getElementById("lastName").value =
    profile.personalInfo?.lastName || "";
  document.getElementById("biography").value =
    profile.personalInfo?.biography || "";
  document.getElementById("linkedInUrl").value = profile.linkedInUrl || "";

  profile.degrees?.forEach((degree) => addDegree(degree));
  profile.certifications?.forEach((cert) => addCertification(cert));
  profile.licences?.forEach((licence) => addLicence(licence));
  profile.courses?.forEach((course) => addCourse(course));
  profile.employmentHistory?.forEach((emp) => addEmployment(emp));
}

async function saveProfile() {
  const profileData = {
    personalInfo: {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      biography: document.getElementById("biography").value,
    },
    linkedInUrl: document.getElementById("linkedInUrl").value,
    degrees: getDegrees(),
    certifications: getCertifications(),
    licences: getLicences(),
    courses: getCourses(),
    employmentHistory: getEmployment(),
  };

  try {
    const response = await fetch(`${API_BASE}/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage("Profile saved successfully!", "success");
    } else {
      showMessage(data.message || "Failed to save profile", "error");
    }
  } catch (error) {
    showMessage("Network error. Please try again.", "error");
  }
}

function showMessage(text, type) {
  const messageDiv = document.getElementById("message");
  messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
  messageDiv.style.display = "block";
  setTimeout(() => (messageDiv.style.display = "none"), 3000);
}

async function logout() {
  try {
    // Call backend logout endpoint
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Clear token and redirect regardless of response
    localStorage.removeItem("token");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
    // Still logout client-side even if API call fails
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`${API_BASE}/profile/upload-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      showMessage("Image uploaded successfully!", "success");
    } else {
      showMessage(data.message || "Failed to upload image", "error");
    }
  } catch (error) {
    showMessage("Network error. Please try again.", "error");
  }
}

// Helper functions for dynamic arrays
function addDegree(data = {}) {
  const container = document.getElementById("degreesContainer");
  const div = document.createElement("div");
  div.className = "array-item";
  div.innerHTML = `
        <button type="button" class="remove-btn">Remove</button>
        <div class="grid">
            <div class="form-group">
                <label>Title:</label>
                <input type="text" value="${data.title || ""}" required>
            </div>
            <div class="form-group">
                <label>University:</label>
                <input type="text" value="${data.university || ""}" required>
            </div>
            <div class="form-group">
                <label>Completion Date:</label>
                <input type="date" value="${data.completionDate ? data.completionDate.split("T")[0] : ""}" required>
            </div>
            <div class="form-group">
                <label>URL:</label>
                <input type="url" value="${data.url || ""}" placeholder="https://university.edu/degree">
            </div>
        </div>
    `;
  const removeBtn = div.querySelector(".remove-btn");
  removeBtn.addEventListener("click", () => div.remove());
  container.appendChild(div);
}

function getDegrees() {
  return Array.from(
    document.querySelectorAll("#degreesContainer .array-item"),
  ).map((item) => {
    const inputs = item.querySelectorAll("input");
    return {
      title: inputs[0].value,
      university: inputs[1].value,
      completionDate: inputs[2].value,
      url: inputs[3].value,
    };
  });
}

function addCertification(data = {}) {
  const container = document.getElementById("certificationsContainer");
  const div = document.createElement("div");
  div.className = "array-item";
  div.innerHTML = `
        <button type="button" class="remove-btn">Remove</button>
        <div class="grid">
            <div class="form-group">
                <label>Title:</label>
                <input type="text" value="${data.title || ""}" required>
            </div>
            <div class="form-group">
                <label>Issuing Body:</label>
                <input type="text" value="${data.issuingBody || ""}" required>
            </div>
            <div class="form-group">
                <label>Completion Date:</label>
                <input type="date" value="${data.completionDate ? data.completionDate.split("T")[0] : ""}" required>
            </div>
            <div class="form-group">
                <label>URL:</label>
                <input type="url" value="${data.url || ""}" placeholder="https://certification.org/cert">
            </div>
        </div>
    `;
  const removeBtn = div.querySelector(".remove-btn");
  removeBtn.addEventListener("click", () => div.remove());
  container.appendChild(div);
}

function getCertifications() {
  return Array.from(
    document.querySelectorAll("#certificationsContainer .array-item"),
  ).map((item) => {
    const inputs = item.querySelectorAll("input");
    return {
      title: inputs[0].value,
      issuingBody: inputs[1].value,
      completionDate: inputs[2].value,
      url: inputs[3].value,
    };
  });
}

function addLicence(data = {}) {
  const container = document.getElementById("licencesContainer");
  const div = document.createElement("div");
  div.className = "array-item";
  div.innerHTML = `
        <button type="button" class="remove-btn">Remove</button>
        <div class="grid">
            <div class="form-group">
                <label>Title:</label>
                <input type="text" value="${data.title || ""}" required>
            </div>
            <div class="form-group">
                <label>Issuing Body:</label>
                <input type="text" value="${data.issuingBody || ""}" required>
            </div>
            <div class="form-group">
                <label>Completion Date:</label>
                <input type="date" value="${data.completionDate ? data.completionDate.split("T")[0] : ""}" required>
            </div>
            <div class="form-group">
                <label>URL:</label>
                <input type="url" value="${data.url || ""}" placeholder="https://licensing.org/licence">
            </div>
        </div>
    `;
  const removeBtn = div.querySelector(".remove-btn");
  removeBtn.addEventListener("click", () => div.remove());
  container.appendChild(div);
}

function getLicences() {
  return Array.from(
    document.querySelectorAll("#licencesContainer .array-item"),
  ).map((item) => {
    const inputs = item.querySelectorAll("input");
    return {
      title: inputs[0].value,
      issuingBody: inputs[1].value,
      completionDate: inputs[2].value,
      url: inputs[3].value,
    };
  });
}

function addCourse(data = {}) {
  const container = document.getElementById("coursesContainer");
  const div = document.createElement("div");
  div.className = "array-item";
  div.innerHTML = `
        <button type="button" class="remove-btn">Remove</button>
        <div class="grid">
            <div class="form-group">
                <label>Title:</label>
                <input type="text" value="${data.title || ""}" required>
            </div>
            <div class="form-group">
                <label>Provider:</label>
                <input type="text" value="${data.provider || ""}" required>
            </div>
            <div class="form-group">
                <label>Completion Date:</label>
                <input type="date" value="${data.completionDate ? data.completionDate.split("T")[0] : ""}" required>
            </div>
            <div class="form-group">
                <label>URL:</label>
                <input type="url" value="${data.url || ""}" placeholder="https://courseprovider.com/course">
            </div>
        </div>
    `;
  const removeBtn = div.querySelector(".remove-btn");
  removeBtn.addEventListener("click", () => div.remove());
  container.appendChild(div);
}

function getCourses() {
  return Array.from(
    document.querySelectorAll("#coursesContainer .array-item"),
  ).map((item) => {
    const inputs = item.querySelectorAll("input");
    return {
      title: inputs[0].value,
      provider: inputs[1].value,
      completionDate: inputs[2].value,
      url: inputs[3].value,
    };
  });
}

function addEmployment(data = {}) {
  const container = document.getElementById("employmentContainer");
  const div = document.createElement("div");
  div.className = "array-item";
  div.innerHTML = `
        <button type="button" class="remove-btn">Remove</button>
        <div class="grid">
            <div class="form-group">
                <label>Position:</label>
                <input type="text" value="${data.position || ""}" required>
            </div>
            <div class="form-group">
                <label>Company:</label>
                <input type="text" value="${data.company || ""}" required>
            </div>
            <div class="form-group">
                <label>Start Date:</label>
                <input type="date" value="${data.startDate ? data.startDate.split("T")[0] : ""}" required>
            </div>
            <div class="form-group">
                <label>End Date (leave empty if current):</label>
                <input type="date" value="${data.endDate ? data.endDate.split("T")[0] : ""}">
            </div>
        </div>
        <div class="form-group full-width">
            <label>Description:</label>
            <textarea>${data.description || ""}</textarea>
        </div>
    `;
  const removeBtn = div.querySelector(".remove-btn");
  removeBtn.addEventListener("click", () => div.remove());
  container.appendChild(div);
}

function getEmployment() {
  return Array.from(
    document.querySelectorAll("#employmentContainer .array-item"),
  ).map((item) => {
    const inputs = item.querySelectorAll("input");
    const textarea = item.querySelector("textarea");
    return {
      position: inputs[0].value,
      company: inputs[1].value,
      startDate: inputs[2].value,
      endDate: inputs[3].value || null,
      description: textarea.value,
    };
  });
}
