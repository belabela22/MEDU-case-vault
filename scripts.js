// MEDU Case Vault - Main JS
// Author: Luna.C.Everly

"use strict";

// DOM Elements
const loginSection = document.getElementById("login-section");
const usernameInput = document.getElementById("usernameInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const userDisplay = document.getElementById("userDisplay");

const navButtons = document.querySelectorAll(".nav-btn");
const pageSections = document.querySelectorAll(".page-section");
const logoutBtn = document.getElementById("logoutBtn");
const darkModeToggle = document.getElementById("darkModeToggle");

const adminLoginForm = document.getElementById("adminLoginForm");
const adminPassInput = document.getElementById("adminPass");
const adminLoginError = document.getElementById("adminLoginError");
const adminPanel = document.getElementById("adminPanel");

const addCaseForm = document.getElementById("addCaseForm");
const casesList = document.getElementById("casesList");

const addMemberForm = document.getElementById("addMemberForm");

const clearanceStatus = document.getElementById("clearanceStatus");
const unlockClearanceBtn = document.getElementById("unlockClearanceBtn");

const startGamesBtn = document.getElementById("startGamesBtn");

let currentUser = null;
let isAdmin = false;
let clearanceUnlocked = false;

let cases = [];
let members = [];

// Admin password (hardcoded for demo - change in production)
const ADMIN_PASSWORD = "meduAdmin123";

// --- USER LOGIN & NAVIGATION --- //
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (!username) {
    loginError.textContent = "Please enter a valid name.";
    return;
  }
  currentUser = username;
  loginSection.hidden = true;
  loginError.textContent = "";
  userDisplay.textContent = currentUser;
  showSection("home");
  logoutBtn.style.display = "inline-block";
  updateNavForUser();
});

logoutBtn.addEventListener("click", () => {
  currentUser = null;
  isAdmin = false;
  clearanceUnlocked = false;
  adminPanel.classList.add("hidden");
  adminLoginForm.style.display = "block";
  adminLoginError.textContent = "";
  logoutBtn.style.display = "none";
  userDisplay.textContent = "";
  clearInputFields();
  showSection("login-section");
  resetNav();
});

function updateNavForUser() {
  navButtons.forEach(btn => {
    btn.disabled = false;
    if (btn.classList.contains("admin-only")) {
      btn.style.display = isAdmin ? "inline-block" : "none";
    }
  });
}

function resetNav() {
  navButtons.forEach(btn => {
    btn.classList.remove("active");
    btn.style.display = btn.classList.contains("admin-only") ? "none" : "inline-block";
  });
  document.querySelector(".nav-btn[data-target='login-section']").classList.add("active");
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    const target = btn.getAttribute("data-target");
    if (target) showSection(target);
    setActiveNav(btn);
  });
});

function setActiveNav(activeBtn) {
  navButtons.forEach(btn => btn.classList.remove("active"));
  activeBtn.classList.add("active");
}

function showSection(sectionId) {
  pageSections.forEach(section => {
    if (section.id === sectionId) {
      section.classList.add("active");
      section.hidden = false;
    } else {
      section.classList.remove("active");
      section.hidden = true;
    }
  });
}

// --- ADMIN LOGIN & TOOLS --- //
adminLoginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const pass = adminPassInput.value;
  if (pass === ADMIN_PASSWORD) {
    isAdmin = true;
    adminLoginForm.style.display = "none";
    adminLoginError.textContent = "";
    adminPanel.classList.remove("hidden");
    updateNavForUser();
  } else {
    adminLoginError.textContent = "Incorrect password.";
  }
});

addCaseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!isAdmin) return alert("Admin access required.");
  const title = document.getElementById("caseTitle").value.trim();
  const description = document.getElementById("caseDescription").value.trim();
  const status = document.getElementById("caseStatus").value;

  if (!title || !description) return alert("Title and description are required.");

  const newCase = {
    id: Date.now(),
    title,
    description,
    status,
    createdBy: currentUser,
  };

  cases.push(newCase);
  renderCases();
  addCaseForm.reset();
});

addMemberForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!isAdmin) return alert("Admin access required.");
  const memberName = document.getElementById("memberName").value.trim();
  const medal = document.getElementById("memberMedal").value;

  if (!memberName) return alert("Member name is required.");

  members.push({
    id: Date.now(),
    name: memberName,
    medal,
    casesSolved: 0,
  });

  addMemberForm.reset();
  renderLeaderboard();
});

function renderCases() {
  casesList.innerHTML = "";
  if (cases.length === 0) {
    casesList.innerHTML = "<li>No cases added yet.</li>";
    return;
  }
  cases.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `[${c.status}] ${c.title} - by ${c.createdBy}`;
    casesList.appendChild(li);
  });
}

// --- LEADERBOARD --- //
function renderLeaderboard() {
  const leaderboardTableBody = document.querySelector("#leaderboardTable tbody");
  leaderboardTableBody.innerHTML = "";
  if (members.length === 0) {
    leaderboardTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No members yet.</td></tr>`;
    return;
  }
  // Sort members by casesSolved descending
  const sortedMembers = members.slice().sort((a, b) => b.casesSolved - a.casesSolved);

  sortedMembers.forEach((m, i) => {
    const tr = document.createElement("tr");
    const rankTitle = i === 0 ? "Gold Medic" : i <= 2 ? "Silver Medic" : "Bronze Medic";
    tr.innerHTML = `
      <td>${rankTitle}</td>
      <td>${m.name}</td>
      <td>${m.casesSolved}</td>
      <td>${m.medal}</td>
    `;
    leaderboardTableBody.appendChild(tr);
  });
}

// --- CLEARANCE UNLOCK --- //
unlockClearanceBtn.addEventListener("click", () => {
  // simulate clearance unlock for demo
  if (clearanceUnlocked) {
    clearanceStatus.textContent = "Clearance already unlocked.";
    return;
  }
  if (!currentUser) {
    clearanceStatus.textContent = "Please log in first.";
    return;
  }
  clearanceUnlocked = true;
  clearanceStatus.textContent = "Clearance unlocked! You now have access to Shadow Cases.";
});

// --- GAMES PLAY BUTTONS --- //
document.querySelectorAll(".playGameBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!currentUser) {
      alert("Please log in to play games.");
      return;
    }
    const game = btn.getAttribute("data-game");
    startGame(game);
  });
});

function startGame(gameName) {
  alert(`Starting game: ${gameName} (Placeholder)`);
  // Here you add real game logic, branching, simulation, etc.
}

// --- NAVIGATION FROM HOME TO GAMES --- //
startGamesBtn.addEventListener("click", () => {
  showSection("games");
  setActiveNav([...navButtons].find(btn => btn.dataset.target === "games"));
});

// --- DARK MODE TOGGLE --- //
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    darkModeToggle.textContent = "☀️";
  } else {
    darkModeToggle.textContent = "🌙";
  }
});

// --- UTILS --- //
function clearInputFields() {
  usernameInput.value = "";
  adminPassInput.value = "";
  addCaseForm.reset();
  addMemberForm.reset();
}

// --- INIT --- //
function init() {
  // Initialize empty arrays or fetch from localStorage if needed
  renderLeaderboard();
  renderCases();
}

init();
