// ---- Mock auth helpers -----------------------------------------------------
// NOTE: this is a UI-level mock for demo purposes only — not real security.
// Anyone could bypass it by editing sessionStorage or opening the HTML directly.
// Replace with real authentication (e.g. Firebase Auth) before handling real users.

function isLoggedIn() {
  return sessionStorage.getItem("nkiru_provider_logged_in") === "true";
}

function logIn(email) {
  sessionStorage.setItem("nkiru_provider_logged_in", "true");
  sessionStorage.setItem("nkiru_provider_email", email);
}

function logOut() {
  sessionStorage.removeItem("nkiru_provider_logged_in");
  sessionStorage.removeItem("nkiru_provider_email");
  window.location.href = "login.html";
}

// ---- Login page logic -----------------------------------------------------

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorEl = document.getElementById("loginError");

    if (!email || !password) {
      errorEl.style.display = "block";
      return;
    }

    logIn(email);
    window.location.href = "provider-dashboard.html";
  });
}
