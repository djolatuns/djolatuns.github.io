(() => {
  const isHomePage = location.pathname === "/" || location.pathname.endsWith("/index.html");
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
      if (installPrompt) {
        installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
      } else {
        alert("To install DJ OLATUNS, open Chrome's ⋮ menu and choose 'Install app' or 'Add to Home screen'. If you don't see it yet, refresh the page and try again.");
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