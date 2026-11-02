(() => {
  const KEY = "djOlatunsTheme";
  const saved = (() => { try { return localStorage.getItem(KEY); } catch (_) { return null; } })();
  const theme = saved === "light" ? "light" : "dark";
  const css = document.createElement("style");
  css.id = "dj-olatuns-theme-style";
  css.textContent = `
    html[data-dj-theme="light"] { color-scheme: light !important; }
    html[data-dj-theme="light"] body {
      background: #f4f1e9 !important; color: #24211b !important;
    }
    html[data-dj-theme="light"] header,
    html[data-dj-theme="light"] nav,
    html[data-dj-theme="light"] .bottomnav,
    html[data-dj-theme="light"] .app-menu,
    html[data-dj-theme="light"] .sidebar,
    html[data-dj-theme="light"] .side-head {
      background: #fffdf7 !important; color: #24211b !important;
      border-color: #d8c79f !important;
    }
    html[data-dj-theme="light"] main,
    html[data-dj-theme="light"] section,
    html[data-dj-theme="light"] article,
    html[data-dj-theme="light"] .card,
    html[data-dj-theme="light"] .setting,
    html[data-dj-theme="light"] .intro,
    html[data-dj-theme="light"] .brief,
    html[data-dj-theme="light"] .feature,
    html[data-dj-theme="light"] .tile,
    html[data-dj-theme="light"] .chat-shell,
    html[data-dj-theme="light"] .chat-main,
    html[data-dj-theme="light"] .message-list,
    html[data-dj-theme="light"] .panel,
    html[data-dj-theme="light"] .step {
      background: #fffdf7 !important; color: #24211b !important;
      border-color: #ded4bd !important;
    }
    html[data-dj-theme="light"] h1,
    html[data-dj-theme="light"] h2,
    html[data-dj-theme="light"] h3,
    html[data-dj-theme="light"] h4,
    html[data-dj-theme="light"] strong,
    html[data-dj-theme="light"] b,
    html[data-dj-theme="light"] label { color: #6f4d0b !important; }
    html[data-dj-theme="light"] p,
    html[data-dj-theme="light"] small,
    html[data-dj-theme="light"] .muted,
    html[data-dj-theme="light"] .sub,
    html[data-dj-theme="light"] span { color: #625d52; }
    html[data-dj-theme="light"] a { color: #805b12; }
    html[data-dj-theme="light"] input,
    html[data-dj-theme="light"] textarea,
    html[data-dj-theme="light"] select {
      background: #fff !important; color: #24211b !important;
      border-color: #cbbd9e !important;
    }
    html[data-dj-theme="light"] button {
      color: #3b2b0d;
    }
    html[data-dj-theme="light"] footer { color: #777064 !important; }
  `;
  (document.head || document.documentElement).appendChild(css);
  document.documentElement.setAttribute("data-dj-theme", theme);
  window.DJOLATUNS_THEME = {
    get: () => document.documentElement.getAttribute("data-dj-theme") || "dark",
    set(value) {
      const next = value === "light" ? "light" : "dark";
      document.documentElement.setAttribute("data-dj-theme", next);
      try { localStorage.setItem(KEY, next); } catch (_) {}
      document.querySelectorAll("[data-theme-choice]").forEach(button => {
        const active = button.getAttribute("data-theme-choice") === next;
        button.setAttribute("aria-pressed", String(active));
      });
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next === "light" ? "#f4f1e9" : "#090909");
    }
  };
  window.DJOLATUNS_THEME.set(theme);
})();