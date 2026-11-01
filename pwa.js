(() => {
  const installButton = document.createElement("button");
  installButton.type = "button";
  installButton.id = "djInstallAppButton";
  installButton.textContent = "Install App";
  installButton.setAttribute("aria-label", "Install DJ OLATUNS app");
  installButton.style.cssText = "position:fixed;top:12px;right:12px;z-index:9999;border:1px solid #ffe6a0;border-radius:999px;padding:10px 15px;background:linear-gradient(120deg,#ffe5a0,#c89431);color:#100d06;font:800 13px system-ui;box-shadow:0 4px 18px #0008;cursor:pointer";
  document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("djInstallAppButton")) document.body.appendChild(installButton);
  });
  let installPrompt = null;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.textContent = "Install App";
    installButton.hidden = false;
  });
  installButton.addEventListener("click", async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      return;
    }
    alert("To install DJ OLATUNS: open Chrome's ⋮ menu, then choose 'Install app' or 'Add to Home screen'. If the option is not shown yet, refresh this page after a short while and try again.");
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    installButton.textContent = "App Installed";
    installButton.disabled = true;
    installButton.style.opacity = ".75";
  });
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js", { scope: "/" })
        .then((registration) => registration.update())
        .catch((error) => console.error("DJ OLATUNS service worker registration failed:", error));
    });
  }
})();