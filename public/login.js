const API_BASE = "http://localhost:3000/api";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      showMessage("Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "profile.html";
      }, 1000);
    } else {
      showMessage(data.message || "Login failed", "error");
    }
  } catch (error) {
    showMessage("Network error. Please try again.", "error");
  }
});

function showMessage(text, type) {
  const messageDiv = document.getElementById("message");
  messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
  messageDiv.style.display = "block";
  setTimeout(() => (messageDiv.style.display = "none"), 3000);
}
