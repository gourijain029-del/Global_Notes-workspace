import { getAccounts, setAccounts, mergeGuestNotes } from "./storage.js";
import { initLoginForm } from "./loginPage.js";

function initAuthPage() {
  // Set flag to indicate module has loaded
  window._authPageInitialized = true;

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const switchButtons = document.querySelectorAll(".switch-btn");
  const messageEl = document.getElementById("auth-message");

  // Displays a message to the user with optional type (info/error/success)
  const setMessage = (text, type = "info") => {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = `auth-message ${type}`;
  };

  // Toggles between login and signup forms
  const toggleView = (view) => {
    document.querySelectorAll(".auth-form").forEach((form) => {
      const isTarget = form.dataset.view === view;
      form.classList.toggle("hidden", !isTarget);
    });
    switchButtons.forEach((btn) => {
      const isTarget = btn.dataset.view === view;
      btn.classList.toggle("active", isTarget);
      btn.setAttribute("aria-selected", String(isTarget));
    });
    setMessage("");
  };

  switchButtons.forEach((btn) => {
    btn.addEventListener("click", () => toggleView(btn.dataset.view));
  });

  // --- Social Auth Mock ---
  const handleSocialLogin = (provider) => {
    setMessage(`Connecting to ${provider}...`, "info");

    // Simulate API delay
    const btn = document.querySelector(`.social-btn.${provider.toLowerCase()}`);
    if (btn) btn.style.opacity = "0.7";

    setTimeout(() => {
      // Create mock user if needed, simplify to just logging in as "User"
      const mockUser = `${provider}User`;
      mergeGuestNotes(mockUser);

      // Ensure account exists in local list so logic elsewhere holds (optional, but clean)
      const accounts = getAccounts();
      if (!accounts.some(a => a.username === mockUser)) {
        accounts.push({ username: mockUser, password: "social-login-mock", email: `user@${provider.toLowerCase()}.com` });
        setAccounts(accounts);
      }

      import("./storage.js").then(({ setActiveUser }) => {
        setActiveUser(mockUser);
        setMessage(`Success! Logged in with ${provider}.`, "success");
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 800);
      });
    }, 1200);
  };

  const googleBtn = document.querySelector(".social-btn.google");
  const githubBtn = document.querySelector(".social-btn.github");

  if (googleBtn) googleBtn.addEventListener("click", () => handleSocialLogin("Google"));
  if (githubBtn) githubBtn.addEventListener("click", () => handleSocialLogin("GitHub"));

  // Initialize the login form with necessary callbacks
  initLoginForm({
    formId: "login-form",
    setMessage,
    toggleView,
  });

  // Handle signup form submission
  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("new-username").value.trim();
    const password = document.getElementById("new-password").value;
    const confirm = document.getElementById("confirm-password").value;
    const email = document.getElementById("email").value.trim();

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.", "error");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.", "error");
      return;
    }

    const accounts = getAccounts();
    const exists = accounts.some((a) => a.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      setMessage("That username is already taken.", "error");
      return;
    }

    accounts.push({ username, password, email });
    setAccounts(accounts);
    mergeGuestNotes(username);
    setMessage("Account created! You can log in now.", "success");
    signupForm.reset();
    toggleView("login");
    document.getElementById("username").value = username;
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuthPage);
} else {
  initAuthPage();
}

//aneek
