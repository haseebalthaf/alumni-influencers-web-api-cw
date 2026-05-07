const apiBase = () => window.SharedUtils?.API_BASE || "http://localhost:3000/api";
const authToken = () => window.SharedUtils?.getToken?.() || localStorage.getItem("token");

function redirectToLogin() {
  window.SharedUtils?.navigateTo("login.html");
  window.location.href = "login.html";
}

if (!authToken() || !window.SharedUtils?.validateToken()) {
  redirectToLogin();
} else if (window.SharedUtils?.getRole?.() === "admin") {
  window.location.href = "dashboard.html";
} else {
  window.addEventListener("DOMContentLoaded", () => {
    const bidForm = document.getElementById("bidForm");
    const cancelBidBtn = document.getElementById("cancelBidBtn");

    bidForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const amount = Number(document.getElementById("bidAmount").value);
      if (!amount || amount <= 0) {
        showMessage("Enter a positive bid amount", "error");
        return;
      }
      await placeBid(amount);
    });

    cancelBidBtn?.addEventListener("click", async () => {
      await cancelBid();
    });

    loadStatus();
    loadHistory();
    loadTomorrowSlot();
  });
}

async function loadStatus() {
  try {
    const response = await fetch(`${apiBase()}/bidding/status`, {
      headers: {
        Authorization: `Bearer ${authToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Unable to load bid status");
    }

    const data = await response.json();
    document.getElementById("currentBid").textContent = data.currentBid || 0;
    document.getElementById("winStatus").textContent =
      data.currentBid > 0
        ? data.isWinning
          ? "Winning"
          : "Not winning"
        : "No active bid";
    document.getElementById("monthlyWins").textContent = data.monthlyWins;
    document.getElementById("remainingSlots").textContent = data.remainingSlots;
    document.getElementById("canBid").textContent = data.canBid ? "Yes" : "No";

    const cancelBidBtn = document.getElementById("cancelBidBtn");
    if (cancelBidBtn) {
      if (!data.canBid) {
        cancelBidBtn.disabled = true;
        cancelBidBtn.textContent = "Cannot bid now";
      } else {
        cancelBidBtn.disabled = false;
        cancelBidBtn.textContent = "Cancel active bid";
      }
    }
  } catch (error) {
    showMessage("Failed to load bidding status", "error");
  }
}

async function loadHistory() {
  try {
    const response = await fetch(`${apiBase()}/bidding/history`, {
      headers: {
        Authorization: `Bearer ${authToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Unable to load bid history");
    }

    const data = await response.json();
    const historyList = document.getElementById("historyList");
    if (!historyList) return;
    historyList.innerHTML = "";

    if (!data.history || data.history.length === 0) {
      historyList.innerHTML =
        '<li class="history-item">No bids placed yet.</li>';
      return;
    }

    data.history.forEach((bid) => {
      const item = document.createElement("li");
      item.className = "history-item";
      item.innerHTML = `
        <div><span>£${bid.amount}</span> ${new Date(bid.date).toLocaleString()}</div>
        <div>Status: ${bid.status}</div>
      `;
      historyList.appendChild(item);
    });
  } catch (error) {
    const historyList = document.getElementById("historyList");
    if (historyList) {
      historyList.innerHTML =
        '<li class="history-item">Unable to load history.</li>';
    }
  }
}

async function loadTomorrowSlot() {
  try {
    const response = await fetch(`${apiBase()}/bidding/tomorrow-slot`, {
      headers: {
        Authorization: `Bearer ${authToken()}`,
      },
    });

    const slot = document.getElementById("tomorrowSlot");
    if (!slot) return;

    if (!response.ok) {
      slot.textContent = "Tomorrow slot is not available yet.";
      return;
    }

    const data = await response.json();
    slot.innerHTML = `<strong>${data.winner.name}</strong> — ${data.winner.biography || "No biography available"}`;
  } catch (error) {
    const slot = document.getElementById("tomorrowSlot");
    if (slot) {
      slot.textContent = "Unable to load tomorrow slot.";
    }
  }
}

async function placeBid(amount) {
  try {
    const response = await fetch(`${apiBase()}/bidding/bid`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken()}`,
      },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();
    if (!response.ok) {
      showMessage(data.message || "Failed to place bid", "error");
      return;
    }

    showMessage("Bid placed successfully", "success");
    const bidInput = document.getElementById("bidAmount");
    if (bidInput) {
      bidInput.value = "";
    }
    await loadStatus();
    await loadHistory();
  } catch (error) {
    showMessage("Network error while placing bid", "error");
  }
}

async function cancelBid() {
  try {
    const response = await fetch(`${apiBase()}/bidding/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken()}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      showMessage(data.message || "Failed to cancel bid", "error");
      return;
    }

    showMessage("Bid cancelled successfully", "success");
    await loadStatus();
    await loadHistory();
  } catch (error) {
    showMessage("Network error while cancelling bid", "error");
  }
}

function showMessage(text, type) {
  const messageDiv = document.getElementById("message");
  if (!messageDiv) return;
  messageDiv.textContent = text;
  messageDiv.className = type;
  messageDiv.style.display = "block";
  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 4000);
}
