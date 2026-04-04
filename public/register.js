const API_BASE = "http://localhost:3000/api";

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("Registration successful! You can now login.", "success");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        showMessage(data.message || "Registration failed", "error");
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
