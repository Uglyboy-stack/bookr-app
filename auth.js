// ---- Mock auth helpers -----------------------------------------------------
// NOTE: this is a UI-level mock for demo purposes only — not real security.
// Passwords are not actually checked or stored securely. Anyone could bypass
// this by editing localStorage/sessionStorage directly. Replace with real
// authentication (e.g. Firebase Auth) before handling real users or real data.

const DEMO_EMAIL = "ada@bookr-demo.com";

function isLoggedIn() {
  return sessionStorage.getItem("bookr_provider_logged_in") === "true";
}

function isDemoAccount() {
  return sessionStorage.getItem("bookr_provider_email") === DEMO_EMAIL;
}

function profileKey(email) {
  return "bookr_profile_" + email.toLowerCase().trim();
}

// Stores a brand-new provider's starting profile (everything empty except what they entered at signup).
function createProviderProfile({ businessName, category, location, email }) {
  const profile = {
    provider: { name: businessName, category, location },
    services: [],
    availability: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    bookings: [],
    subscription: { active: false, monthlyFee: 5000, lastPaymentRef: null },
  };
  localStorage.setItem(profileKey(email), JSON.stringify(profile));
  return profile;
}

function getStoredProfile(email) {
  const raw = localStorage.getItem(profileKey(email));
  return raw ? JSON.parse(raw) : null;
}

function logIn(email) {
  sessionStorage.setItem("bookr_provider_logged_in", "true");
  sessionStorage.setItem("bookr_provider_email", email);
}

function logOut() {
  sessionStorage.removeItem("bookr_provider_logged_in");
  sessionStorage.removeItem("bookr_provider_email");
  window.location.href = "login.html";
}

// ---- Tab switching ----------------------------------------------------------

const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const loginPanel = document.getElementById("loginPanel");
const signupPanel = document.getElementById("signupPanel");

if (tabLogin && tabSignup) {
  tabLogin.addEventListener("click", () => switchTab("login"));
  tabSignup.addEventListener("click", () => switchTab("signup"));
}

function switchTab(which) {
  const loginActive = which === "login";
  tabLogin.classList.toggle("active", loginActive);
  tabSignup.classList.toggle("active", !loginActive);
  tabLogin.setAttribute("aria-selected", String(loginActive));
  tabSignup.setAttribute("aria-selected", String(!loginActive));
  loginPanel.hidden = !loginActive;
  signupPanel.hidden = loginActive;
}

// ---- Log in panel logic ------------------------------------------------------

if (loginPanel) {
  loginPanel.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorEl = document.getElementById("loginError");

    if (!email || !password) {
      errorEl.textContent = "Enter an email and password to continue.";
      errorEl.style.display = "block";
      return;
    }

    // Demo account always works, regardless of what's in localStorage.
    if (email.toLowerCase() === DEMO_EMAIL) {
      logIn(email);
      window.location.href = "provider-dashboard.html";
      return;
    }

    // Otherwise, only emails that have actually signed up can log in.
    const existing = getStoredProfile(email);
    if (!existing) {
      errorEl.innerHTML = 'No account found for that email. <button type="button" class="inline-link-btn" id="jumpToSignup">Sign up instead?</button>';
      errorEl.style.display = "block";
      document.getElementById("jumpToSignup").addEventListener("click", () => switchTab("signup"));
      return;
    }

    logIn(email);
    window.location.href = "provider-dashboard.html";
  });
}

// ---- Sign up panel logic ------------------------------------------------------

if (signupPanel) {
  signupPanel.addEventListener("submit", (e) => {
    e.preventDefault();
    const businessName = document.getElementById("suBusinessName").value.trim();
    const category = document.getElementById("suCategory").value;
    const location = document.getElementById("suLocation").value.trim();
    const email = document.getElementById("suEmail").value.trim();
    const password = document.getElementById("suPassword").value.trim();
    const errorEl = document.getElementById("signupError");

    if (!businessName || !category || !location || !email || !password) {
      errorEl.textContent = "Please fill in every field to create your profile.";
      errorEl.style.display = "block";
      return;
    }

    if (email.toLowerCase() === DEMO_EMAIL) {
      errorEl.textContent = "That email is reserved for the demo account — try logging in instead.";
      errorEl.style.display = "block";
      return;
    }

    if (getStoredProfile(email)) {
      errorEl.innerHTML = 'An account already exists for that email. <button type="button" class="inline-link-btn" id="jumpToLogin">Log in instead?</button>';
      errorEl.style.display = "block";
      document.getElementById("jumpToLogin").addEventListener("click", () => switchTab("login"));
      return;
    }

    createProviderProfile({ businessName, category, location, email });
    logIn(email);
    window.location.href = "provider-dashboard.html";
  });
}
