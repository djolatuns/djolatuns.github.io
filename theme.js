(() => {
  const KEY = "djOlatunsTheme";
  const readSaved = () => {
    try { return localStorage.getItem(KEY); } catch (_) { return null; }
  };
  // OLATUNS WORLD's light purple/blue identity is the default.
  const normalize = value => value === "dark" ? "dark" : "light";
  const css = document.createElement("style");
  css.id = "dj-olatuns-theme-style";
  css.textContent = String.raw\`
    html[data-dj-theme="light"] { color-scheme: light !important; }
    html[data-dj-theme="dark"] { color-scheme: dark !important; }

    html[data-dj-theme="light"] body {
      background: #f7f7fc !important;
      background-image: none !important;
      color: #17172b !important;
    }
    html[data-dj-theme="light"] body * { scrollbar-color: #c9c5ef #f7f7fc; }
    html[data-dj-theme="light"] p,
    html[data-dj-theme="light"] small,
    html[data-dj-theme="light"] .muted,
    html[data-dj-theme="light"] .sub,
    html[data-dj-theme="light"] .description,
    html[data-dj-theme="light"] .hint,
    html[data-dj-theme="light"] .app-menu-caption {
      color: #707087 !important;
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
      color: #17172b !important;
    }

    html[data-dj-theme="light"] header,
    html[data-dj-theme="light"] nav,
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
    html[data-dj-theme="light"] .business-card,
    html[data-dj-theme="light"] .quick-card,
    html[data-dj-theme="light"] .discover-row,
    html[data-dj-theme="light"] .settings-list button,
    html[data-dj-theme="light"] .settings-list a {
      background-color: #fff !important;
      background-image: none !important;
      color: #17172b !important;
      border-color: #e9e8f2 !important;
      box-shadow: 0 8px 24px rgba(35,31,91,.07) !important;
    }

    html[data-dj-theme="light"] .app-menu {
      background: linear-gradient(160deg,#24213f,#19182e 72%) !important;
      border-color: #5146b7 !important;
    }
    html[data-dj-theme="light"] .app-menu-head strong,
    html[data-dj-theme="light"] .app-menu > a,
    html[data-dj-theme="light"] .app-menu > a:hover,
    html[data-dj-theme="light"] .app-menu > a:focus {
      color: #fff !important;
    }
    html[data-dj-theme="light"] .app-menu > a:hover,
    html[data-dj-theme="light"] .app-menu > a:focus {
      background: #5146b7 !important;
      border-color: #8f83ff !important;
    }
    html[data-dj-theme="light"] .app-menu-button {
      background: #fff !important;
      border-color: #d9d6f2 !important;
    }
    html[data-dj-theme="light"] .app-menu-button span { background: #6557e8 !important; }

    html[data-dj-theme="light"] .hero,
    html[data-dj-theme="light"] .brief,
    html[data-dj-theme="light"] .feature,
    html[data-dj-theme="light"] .wisdom-share {
      border-color: #e9e8f2 !important;
    }
    html[data-dj-theme="light"] .hero,
    html[data-dj-theme="light"] .brief,
    html[data-dj-theme="light"] .feature {
      background: #fff !important;
      color: #17172b !important;
    }
    html[data-dj-theme="light"] .home-banner,
    html[data-dj-theme="light"] .feature-strip,
    html[data-dj-theme="light"] .music-hero,
    html[data-dj-theme="light"] .feature-art,
    html[data-dj-theme="light"] .wisdom-share .primary {
      background: linear-gradient(115deg,#6557e8,#3289f5) !important;
      color: #fff !important;
      border-color: transparent !important;
    }
    html[data-dj-theme="light"] .home-banner h2,
    html[data-dj-theme="light"] .home-banner p,
    html[data-dj-theme="light"] .feature-strip b,
    html[data-dj-theme="light"] .feature-strip p,
    html[data-dj-theme="light"] .music-hero h1,
    html[data-dj-theme="light"] .music-hero p,
    html[data-dj-theme="light"] .feature-art strong,
    html[data-dj-theme="light"] .feature-art span,
    html[data-dj-theme="light"] .wisdom-share .primary {
      color: #fff !important;
    }
    html[data-dj-theme="light"] .eyebrow,
    html[data-dj-theme="light"] .kicker,
    html[data-dj-theme="light"] .tag,
    html[data-dj-theme="light"] .text-action,
    html[data-dj-theme="light"] .read,
    html[data-dj-theme="light"] .page-welcome h1 span,
    html[data-dj-theme="light"] .page-heading h1 span {
      color: #6557e8 !important;
    }
    html[data-dj-theme="light"] .welcome-mark,
    html[data-dj-theme="light"] .about-logo,
    html[data-dj-theme="light"] .row-icon {
      background: linear-gradient(135deg,#6557e8,#3289f5) !important;
      color: #fff !important;
    }
    html[data-dj-theme="light"] .bottomnav {
      background: rgba(25,24,46,.98) !important;
      border-color: #5146b7 !important;
    }
    html[data-dj-theme="light"] .bottomnav a { color: #d6d4ec !important; }
    html[data-dj-theme="light"] .bottomnav .ico { color: #a99fff !important; }
    html[data-dj-theme="light"] .bottomnav a.active {
      color: #fff !important;
      background: #5146b7 !important;
    }

    html[data-dj-theme="light"] a { color: #5146b7; }
    html[data-dj-theme="light"] .btn,
    html[data-dj-theme="light"] .toolbtn,
    html[data-dj-theme="light"] .wisdom-share button,
    html[data-dj-theme="light"] .wisdom-share a {
      border-color: #d9d6f2 !important;
      color: #5146b7 !important;
      background: #f2f0ff !important;
    }
    html[data-dj-theme="light"] .btn.gold,
    html[data-dj-theme="light"] .primary,
    html[data-dj-theme="light"] .installbtn,
    html[data-dj-theme="light"] .wisdom-share .primary {
      background: linear-gradient(110deg,#6557e8,#3289f5) !important;
      color: #fff !important;
      border-color: transparent !important;
    }
    html[data-dj-theme="light"] input,
    html[data-dj-theme="light"] textarea,
    html[data-dj-theme="light"] select,
    html[data-dj-theme="light"] [contenteditable="true"] {
      background: #fff !important;
      color: #17172b !important;
      border-color: #d9d6f2 !important;
    }
    html[data-dj-theme="light"] input::placeholder,
    html[data-dj-theme="light"] textarea::placeholder { color: #9291a8 !important; }
    html[data-dj-theme="light"] button { border-color: #d9d6f2; }
    html[data-dj-theme="light"] button:not(.primary):not(.action):not(.gold) {
      background-color: #f2f0ff !important;
      color: #5146b7 !important;
    }
    html[data-dj-theme="light"] table,
    html[data-dj-theme="light"] th,
    html[data-dj-theme="light"] td {
      color: #17172b !important;
      border-color: #e9e8f2 !important;
    }
    html[data-dj-theme="light"] footer {
      background: #19182e !important;
      color: #d6d4ec !important;
    }
    html[data-dj-theme="light"] .home-message-shortcut,
    html[data-dj-theme="light"] .home-message-link {
      background: linear-gradient(135deg,#6557e8,#3289f5) !important;
      color: #fff !important;
      border-color: #6557e8 !important;
    }
  \`;

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
      if (meta) meta.setAttribute("content", next === "light" ? "#6557e8" : "#090909");
    }
  };
  window.DJOLATUNS_THEME.set(readSaved());
})();