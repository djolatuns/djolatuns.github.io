(() => {
  const isHomePage = location.pathname === "/" || location.pathname.endsWith("/index.html");
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let installPrompt = null;
  let installButton = null;

  if (isHomePage) {
    installButton = document.createElement("button");
    installButton.type = "button";
    installButton.id = "djInstallAppButton";
    installButton.className = "btn gold";
    installButton.textContent = "⬇ Install DJ OLATUNS App";
    installButton.setAttribute("aria-label", "Install DJ OLATUNS app");

    document.addEventListener("DOMContentLoaded", () => {
      const actions = document.querySelector(".hero .actions");
      if (actions && !document.getElementById("djInstallAppButton")) {
        actions.appendChild(installButton);
      }
    });

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;
      installButton.textContent = "⬇ Install DJ OLATUNS App";
    });

    installButton.addEventListener("click", async () => {
      if (isIOS) {
        alert("Install DJ OLATUNS on your iPhone:\n\n1. Open this page in Safari.\n2. Tap the Share button (the square with the upward arrow).\n3. Scroll down and tap 'Add to Home Screen'.\n4. Tap 'Add'.\n\nDJ OLATUNS will then appear on your Home Screen like an app.");
      } else if (installPrompt) {
        installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
      } else {
        alert("To install DJ OLATUNS, open your browser menu and choose 'Install app' or 'Add to Home screen'. If you don't see it yet, refresh the page and try again.");
      }
    });

    window.addEventListener("appinstalled", () => {
      installPrompt = null;
      installButton.textContent = "✓ DJ OLATUNS App Installed";
      installButton.disabled = true;
    });
  }

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js", { scope: "/" })
        .then((registration) => registration.update())
        .catch((error) => console.error("DJ OLATUNS service worker registration failed:", error));
    });
  }
})();