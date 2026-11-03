(() => {
  const KEY = "djOlatunsTheme";
  const readSaved = () => {
    try { return localStorage.getItem(KEY); } catch (_) { return null; }
  };
  const normalize = value => value === "light" ? "light" : "dark";
  const css = document.createElement("style");
  css.id = "dj-olatuns-theme-style";
  css.textContent = `
    html[data-dj-theme="light"] { color-scheme: light !important; }
    html[data-dj-theme="dark"] { color-scheme: dark !important; }

    /* Global page canvas and typography */
    html[data-dj-theme="light"] body {
      background: #f4f1e9 !important;
      background-image: none !important;
      color: #24211b !important;
    }
    html[data-dj-theme="light"] body * {
      scrollbar-color: #c9b98f #f4f1e9;
    }
    html[data-dj-theme="light"] p,
    html[data-dj-theme="light"] small,
    html[data-dj-theme="light"] .muted,
    html[data-dj-theme="light"] .sub,
    html[data-dj-theme="light"] .description,
    html[data-dj-theme="light"] .hint,
    html[data-dj-theme="light"] .eyebrow,
    html[data-dj-theme="light"] .app-menu-caption {
      color: #625d52 !important;
    }
    html[data-dj-theme="light"] h1,
    html[data-dj-theme="light"] h2,
    html[data-dj-theme="light"] h3,
    html[data-dj-theme="light"] h4,
    html[data-dj-theme="light"] h5,
    html[data-dj-theme="light"] h6,
    html[data-dj-theme="light"] strong,
    html[data-dj-theme="light"] b,
    html[data-dj-theme="light"] label {
      color: #6f4d0b !important;
    }

    /* Page chrome, navigation, menus, panels and common card patterns */
    html[data-dj-theme="light"] header,
    html[data-dj-theme="light"] nav,
    html[data-dj-theme="light"] .bottomnav,
    html[data-dj-theme="light"] .app-menu,
    html[data-dj-theme="light"] .app-menu-head,
    html[data-dj-theme="light"] .sidebar,
    html[data-dj-theme="light"] .side-head,
    html[data-dj-theme="light"] .topbar,
    html[data-dj-theme="light"] .toolbar,
    html[data-dj-theme="light"] .tabs,
    html[data-dj-theme="light"] .tab-bar,
    html[data-dj-theme="light"] .drawer,
    html[data-dj-theme="light"] .modal,
    html[data-dj-theme="light"] .dialog,
    html[data-dj-theme="light"] .dropdown,
    html[data-dj-theme="light"] .popover,
    html[data-dj-theme="light"] .menu,
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
    html[data-dj-theme="light"] .step,
    html[data-dj-theme="light"] .post,
    html[data-dj-theme="light"] .post-card,
    html[data-dj-theme="light"] .announcement,
    html[data-dj-theme="light"] .announcement-card,
    html[data-dj-theme="light"] .conversation,
    html[data-dj-theme="light"] .message-card,
    html[data-dj-theme="light"] .profile-card,
    html[data-dj-theme="light"] .account-card,
    html[data-dj-theme="light"] .booking-card,
    html[data-dj-theme="light"] .lesson-card,
    html[data-dj-theme="light"] .business-card {
      background-color: #fffdf7 !important;
      background-image: none !important;
      color: #24211b !important;
      border-color: #ded4bd !important;
      box-shadow: 0 6px 20px #5b4a2510 !important;
    }

    /* Inline dark backgrounds are a common reason individual pages stay dark */
    html[data-dj-theme="light"] [style*="background:#"],
    html[data-dj-theme="light"] [style*="background: #"],
    html[data-dj-theme="light"] [style*="background-color:#"],
    html[data-dj-theme="light"] [style*="background-color: #"],
    html[data-dj-theme="light"] [style*="background:linear-gradient"],
    html[data-dj-theme="light"] [style*="background: linear-gradient"],
    html[data-dj-theme="light"] [style*="background:radial-gradient"],
    html[data-dj-theme="light"] [style*="background: radial-gradient"] {
      background-color: #fffdf7 !important;
      background-image: none !important;
      color: #24211b !important;
      border-color: #ded4bd !important;
    }

    html[data-dj-theme="light"] a {
      color: #805b12;
    }
    html[data-dj-theme="light"] .bottomnav a,
    html[data-dj-theme="light"] .app-menu > a {
      color: #514832 !important;
    }
    html[data-dj-theme="light"] .bottomnav a.active,
    html[data-dj-theme="light"] .app-menu > a:hover,
    html[data-dj-theme="light"] .app-menu > a:focus {
      background: #f1e7cf !important;
      color: #6f4d0b !important;
      border-color: #d8c79f !important;
    }

    /* Form fields and interactive controls */
    html[data-dj-theme="light"] input,
    html[data-dj-theme="light"] textarea,
    html[data-dj-theme="light"] select,
    html[data-dj-theme="light"] [contenteditable="true"] {
      background: #fff !important;
      color: #24211b !important;
      border-color: #cbbd9e !important;
    }
    html[data-dj-theme="light"] input::placeholder,
    html[data-dj-theme="light"] textarea::placeholder {
      color: #8b8374 !important;
    }
    html[data-dj-theme="light"] button {
      color: #3b2b0d;
      border-color: #cbbd9e;
    }
    html[data-dj-theme="light"] button:not(.gold):not(.primary):not(.action),
    html[data-dj-theme="light"] .secondary {
      background-color: #f4eddd !important;
      color: #51401d !important;
    }
    html[data-dj-theme="light"] .gold,
    html[data-dj-theme="light"] .primary,
    html[data-dj-theme="light"] .action:not(.secondary),
    html[data-dj-theme="light"] .btn.gold {
      background: linear-gradient(120deg,#ffe5a0,#c89431) !important;
      color: #100d06 !important;
      border-color: transparent !important;
    }
    html[data-dj-theme="light"] table,
    html[data-dj-theme="light"] th,
    html[data-dj-theme="light"] td {
      color: #24211b !important;
      border-color: #ded4bd !important;
    }
    html[data-dj-theme="light"] footer {
      color: #777064 !important;
    }
    html[data-dj-theme="light"] .app-menu-button,
    html[data-dj-theme="light"] .home-message-shortcut,
    html[data-dj-theme="light"] .home-message-link {
      background: #fffdf7 !important;
      color: #805b12 !important;
      border-color: #d8c79f !important;
    }
    html[data-dj-theme="light"] .app-menu-button span {
      background: #805b12 !important;
    }
  `;
  (document.head || document.documentElement).appendChild(css);

  document.documentElement.setAttribute("data-dj-theme", normalize(readSaved()));
  window.DJOLATUNS_THEME = {
    get() {
      return normalize(document.documentElement.getAttribute("data-dj-theme"));
    },
    set(value) {
      const next = normalize(value);
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
  window.DJOLATUNS_THEME.set(readSaved());
})();