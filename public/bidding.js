const API_BASE = "http://localhost:3000/api";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const bidForm = document.getElementById("bidForm");
const cancelBidBtn = document.getElementById("cancelBidBtn");
const logoutBtn = document.getElementById("logoutBtn");

window.addEventListener("load", () => {
  loadStatus();
  loadHistory();
  loadTomorrowSlot();
});

bidForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = Number(document.getElementById("bidAmount").value);
  if (!amount || amount <= 0) {
    showMessage("Enter a positive bid amount", "error");
    return;
  }
  await placeBid(amount);
});

cancelBidBtn.addEventListener("click", async () => {
  await cancelBid();
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

async function loadStatus() {
  try {
    const response = await fetch(`${API_BASE}/bidding/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
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

    if (!data.canBid) {
      cancelBidBtn.disabled = true;
      cancelBidBtn.textContent = "Cannot bid now";
    }
  } catch (error) {
    showMessage("Failed to load bidding status", "error");
  }
}

async function loadHistory() {
  try {
    const response = await fetch(`${API_BASE}/bidding/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Unable to load bid history");
    }

    const data = await response.json();
    const historyList = document.getElementById("historyList");
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
    historyList.innerHTML =
      '<li class="history-item">Unable to load history.</li>';
  }
}

async function loadTomorrowSlot() {
  try {
    const response = await fetch(`${API_BASE}/bidding/tomorrow-slot`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const slot = document.getElementById("tomorrowSlot");
    if (!response.ok) {
      slot.textContent = "Tomorrow slot is not available yet.";
      return;
    }

    const data = await response.json();
    slot.innerHTML = `<strong>${data.winner.name}</strong> — ${data.winner.biography || "No biography available"}`;
  } catch (error) {
    document.getElementById("tomorrowSlot").textContent =
      "Unable to load tomorrow slot.";
  }
}

async function placeBid(amount) {
  try {
    const response = await fetch(`${API_BASE}/bidding/bid`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();
    if (!response.ok) {
      showMessage(data.message || "Failed to place bid", "error");
      return;
    }

    showMessage("Bid placed successfully", "success");
    document.getElementById("bidAmount").value = "";
    await loadStatus();
    await loadHistory();
  } catch (error) {
    showMessage("Network error while placing bid", "error");
  }
}

async function cancelBid() {
  try {
    const response = await fetch(`${API_BASE}/bidding/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
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
  messageDiv.textContent = text;
  messageDiv.className = type;
  messageDiv.style.display = "block";
  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 4000);
}
