(() => {
  "use strict";
  const KEY = "djOlatunsThemeV3";
  const getSaved = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
  const theme = value => value === "dark" ? "dark" : "light";
  const style = document.createElement("style");
  style.id = "dj-olatuns-theme-style";
  style.textContent = `
    :root {
      --ow-bg:#f7f7fc; --ow-surface:#ffffff; --ow-surface-soft:#f0effb;
      --ow-ink:#19182e; --ow-muted:#707087; --ow-purple:#6557e8;
      --ow-blue:#3289f5; --ow-line:#e7e6f1; --ow-shadow:0 12px 32px rgba(35,31,91,.075);
      --ow-radius:20px; color-scheme:light;
    }
    html[data-dj-theme="light"] { color-scheme:light !important; background:var(--ow-bg); }
    html[data-dj-theme="light"] body {
      margin-top:0; background:var(--ow-bg) !important; background-image:none !important;
      color:var(--ow-ink) !important; font-family:Inter,system-ui,-apple-system,"Segoe UI",Arial,sans-serif !important;
      line-height:1.65;
    }
    html[data-dj-theme="light"] body :where(p,small,.muted,.sub,.description,.hint,.caption,.meta,.timestamp) {
      color:var(--ow-muted);
    }
    html[data-dj-theme="light"] body :where(h1,h2,h3,h4,h5,h6,strong,b,label,legend) { color:var(--ow-ink); }
    html[data-dj-theme="light"] a { color:var(--ow-purple); text-decoration:none; }
    html[data-dj-theme="light"] a:hover { color:var(--ow-blue); }
    html[data-dj-theme="light"] header {
      color:var(--ow-ink) !important; background:rgba(255,255,255,.96) !important;
      background-image:none !important; border-color:var(--ow-line) !important;
      box-shadow:0 4px 20px rgba(35,31,91,.035);
    }
    html[data-dj-theme="light"] header :where(h1,h2,h3,p,.brand,.sub) { color:var(--ow-ink) !important; }
    html[data-dj-theme="light"] header :where(.tag,.eyebrow,.kicker) { color:var(--ow-purple) !important; }
    html[data-dj-theme="light"] :where(main,.wrap,.container,.page,.content,.shell) {
      color:var(--ow-ink);
    }
    html[data-dj-theme="light"] :where(main section,.wrap section,.container section,.card,.panel,.tile,.intro,.brief,.feature,.step,.setting,.post,.post-card,.announcement,.announcement-card,.profile-card,.account-card,.booking-card,.lesson-card,.business-card,.quick-card,.conversation,.message-card,.chat-shell,.chat-main,.chat-sidebar,.settings-list) {
      background-color:var(--ow-surface) !important; background-image:none !important;
      color:var(--ow-ink) !important; border-color:var(--ow-line) !important;
      box-shadow:var(--ow-shadow);
    }
    html[data-dj-theme="light"] :where(main section,.wrap section,.container section) {
      border-radius:var(--ow-radius); padding:clamp(18px,3vw,28px);
    }
    html[data-dj-theme="light"] :where(main section h1,main section h2,main section h3,.card h2,.card h3,.panel h2,.panel h3,.intro h2,.brief h2) {
      color:var(--ow-purple) !important;
    }
    html[data-dj-theme="light"] :where(main section p,main section li,.card p,.panel p,.tile p,.intro p,.brief p) { color:var(--ow-muted) !important; }
    html[data-dj-theme="light"] :where(.hero,.home-banner,.feature-strip,.music-hero,.feature-art,.welcome-banner,.page-hero) {
      background:linear-gradient(125deg,var(--ow-purple),var(--ow-blue)) !important;
      color:#fff !important; border:0 !important; border-radius:24px !important;
      box-shadow:0 18px 42px rgba(101,87,232,.2) !important;
    }
    html[data-dj-theme="light"] :where(.hero,.home-banner,.feature-strip,.music-hero,.feature-art,.welcome-banner,.page-hero) :where(h1,h2,h3,p,span,strong,small,a) {
      color:#fff !important;
    }
    html[data-dj-theme="light"] :where(.eyebrow,.kicker,.tag,.text-action,.read,.page-welcome h1 span,.page-heading h1 span) {
      color:var(--ow-purple) !important;
    }
    html[data-dj-theme="light"] :where(.welcome-mark,.about-logo,.row-icon,.icon-box) {
      background:linear-gradient(135deg,var(--ow-purple),var(--ow-blue)) !important; color:#fff !important;
    }
    html[data-dj-theme="light"] :where(button,.btn,.toolbtn,.installbtn,.action,[role="button"]) {
      border-radius:12px; border-color:#d9d6f2 !important;
    }
    html[data-dj-theme="light"] button:not(.primary):not(.gold):not(.installbtn):not(.active),
    html[data-dj-theme="light"] :where(.btn,.toolbtn) {
      background:var(--ow-surface-soft) !important; color:#5146b7 !important;
    }
    html[data-dj-theme="light"] :where(button.primary,button.gold,.btn.primary,.btn.gold,.primary,.installbtn,.action.primary,.home-message-link,.home-message-shortcut) {
      background:linear-gradient(110deg,var(--ow-purple),var(--ow-blue)) !important;
      color:#fff !important; border-color:transparent !important; box-shadow:0 8px 20px rgba(101,87,232,.18);
    }
    html[data-dj-theme="light"] :where(input,textarea,select,[contenteditable="true"]) {
      background:#fff !important; color:var(--ow-ink) !important;
      border:1px solid #dcd9f0 !important; border-radius:12px;
    }
    html[data-dj-theme="light"] :where(input,textarea,select):focus {
      outline:3px solid rgba(101,87,232,.14) !important; border-color:var(--ow-purple) !important;
    }
    html[data-dj-theme="light"] :where(input,textarea)::placeholder { color:#9695aa !important; }
    html[data-dj-theme="light"] :where(table,th,td) { color:var(--ow-ink) !important; border-color:var(--ow-line) !important; }
    html[data-dj-theme="light"] :where(footer) {
      background:var(--ow-ink) !important; background-image:none !important;
      color:#e5e4f2 !important; border-color:transparent !important;
    }
    html[data-dj-theme="light"] footer :where(p,a,small,span) { color:#d6d4ec !important; }
    html[data-dj-theme="light"] :where(.bottomnav,.bottom-nav,.app-bottom-nav) {
      background:rgba(25,24,46,.98) !important; border-color:#5146b7 !important;
      box-shadow:0 -8px 28px rgba(25,24,46,.12);
    }
    html[data-dj-theme="light"] :where(.bottomnav,.bottom-nav,.app-bottom-nav) a { color:#d6d4ec !important; }
    html[data-dj-theme="light"] :where(.bottomnav,.bottom-nav,.app-bottom-nav) a.active {
      color:#fff !important; background:#5146b7 !important; border-radius:12px;
    }
    html[data-dj-theme="light"] .app-menu {
      background:linear-gradient(160deg,#24213f,#19182e 72%) !important; border-color:#5146b7 !important;
    }
    html[data-dj-theme="light"] .app-menu :where(a,strong,span) { color:#fff !important; }
    html[data-dj-theme="light"] .app-menu-button { background:#fff !important; border-color:#d9d6f2 !important; }
    html[data-dj-theme="light"] .app-menu-button span { background:var(--ow-purple) !important; }
    html[data-dj-theme="light"] :where(.chat-shell,.chat-main,.message-list,.conversation) { background:#fff !important; }
    html[data-dj-theme="light"] :where(.message,.bubble,.chat-message) { border-color:var(--ow-line) !important; }
    html[data-dj-theme="light"] :where(.message.user,.bubble.user,.chat-message.user) {
      background:#eeecff !important; color:var(--ow-ink) !important;
    }
    html[data-dj-theme="light"] :where(img,video,iframe) { max-width:100%; }
    html[data-dj-theme="light"] :where(img) { height:auto; }
    html[data-dj-theme="light"] :where(.home-message-link,.home-message-shortcut) {
      background:linear-gradient(135deg,var(--ow-purple),var(--ow-blue)) !important; color:#fff !important;
    }
    /* Page-specific surfaces used by the account, community and chat screens */
    html[data-dj-theme="light"] :where(.account-profile,.account-profile-main,.account-profile-stat,.account-profile-stats,.account-profile-tabs,.account-center-nav,.profile-editor,.profile-edit-preview,.account-wrap,.member-directory,.member-results,.community-highlights,.highlight-tile,.member-search,.member-results,.table-wrap,.stat,.stats,.notice,.update,.lesson,.profile-post,.empty,.empty-history,.history,.workspace,.assistant,.assistant-head,.sidebar,.side-head,.side-foot,.chat-area,.chat-body,.chat-head,.conversation-list,.chat,.composer,.composer-wrap,.history-load,.topic,.topics,.welcome,.privacy,.search,.links,.conversation,.post,.post-avatar,.member-profile,.avatar,.avatar-fallback) {
      background-color:var(--ow-surface) !important;
      background-image:none !important;
      color:var(--ow-ink) !important;
      border-color:var(--ow-line) !important;
      box-shadow:0 8px 24px rgba(35,31,91,.055);
    }
    html[data-dj-theme="light"] :where(.account-center-nav,.account-profile-tabs,.bottom-app-nav,.bottom,.bottomnav,.bottom-nav) {
      background:var(--ow-ink) !important; color:#fff !important; border-color:#5146b7 !important;
    }
    html[data-dj-theme="light"] :where(.account-center-nav,.account-profile-tabs,.bottom-app-nav,.bottom,.bottomnav,.bottom-nav) a {
      color:#e5e4f2 !important;
    }
    html[data-dj-theme="light"] :where(.account-profile-stat,.stat,.highlight-tile,.topic,.tile,.setting-row) {
      background:var(--ow-surface-soft) !important; border:1px solid var(--ow-line) !important;
      border-radius:16px;
    }
    html[data-dj-theme="light"] :where(.highlight-main,.assistant-head,.chat-head,.side-head,.welcome,.orb) {
      background:linear-gradient(125deg,var(--ow-purple),var(--ow-blue)) !important;
      color:#fff !important; border-color:transparent !important;
    }
    html[data-dj-theme="light"] :where(.highlight-main,.assistant-head,.chat-head,.side-head,.welcome) :where(h1,h2,h3,p,span,strong,small,a) {
      color:#fff !important;
    }
    html[data-dj-theme="light"] :where(.sidebar,.history,.conversation-list) {
      background:#f0effb !important; border-color:var(--ow-line) !important;
    }
    html[data-dj-theme="light"] :where(.bubble,.message,.chat-message) {
      background:#f0effb !important; color:var(--ow-ink) !important;
      border:1px solid var(--ow-line) !important; border-radius:16px;
    }
    html[data-dj-theme="light"] :where(.user .bubble,.mine .bubble,.bubble.user,.message.user) {
      background:#e9e6ff !important; color:var(--ow-ink) !important;
    }
    html[data-dj-theme="light"] :where(.assistant .bubble,.bubble.assistant,.bubble-row.assistant .bubble) {
      background:#fff !important; color:var(--ow-ink) !important;
    }
    html[data-dj-theme="light"] :where(.avatar,.avatar-fallback,.ac-icon) {
      background:linear-gradient(135deg,var(--ow-purple),var(--ow-blue)) !important;
      color:#fff !important; border-color:transparent !important;
    }
    html[data-dj-theme="light"] :where(.notice,.status) {
      background:#eef4ff !important; color:#334b82 !important; border-color:#d8e5ff !important;
    }
    html[data-dj-theme="light"] :where(.secondary,.outline,.navlink,.tab) {
      color:#5146b7 !important; border-color:#d9d6f2 !important;
    }
    html[data-dj-theme="light"] :where(.tab.active,.navlink.active,.action.active) {
      background:#e9e6ff !important; color:#5146b7 !important;
    }
    html[data-dj-theme="light"] :where(.post,.profile-post,.update,.lesson,.member-results) {
      border:1px solid var(--ow-line) !important; border-radius:18px;
    }
    html[data-dj-theme="light"] :where(.account-heading,.account-heading-subtitle,.account-eyebrow,.account-section-label) {
      color:var(--ow-purple) !important;
    }
    /* Remove the old gold palette from LIGHT mode only. Dark mode keeps its original accents. */
    html[data-dj-theme="light"] body :where(.gold,.gold-link,.gold-text,.gold-accent,.golden,[class*="gold"]) {
      color:var(--ow-purple) !important;
      border-color:#d9d6f2 !important;
      text-shadow:none !important;
    }
    html[data-dj-theme="light"] body :where(button.gold,.btn.gold,.gold.button,.gold-link.button,[class*="gold"].btn,[class*="gold"][role="button"]) {
      background:linear-gradient(110deg,var(--ow-purple),var(--ow-blue)) !important;
      color:#fff !important;
      border-color:transparent !important;
      box-shadow:0 8px 20px rgba(101,87,232,.18) !important;
    }
    html[data-dj-theme="light"] body :where(.gold:not(button):not(.btn),.gold-link:not(button):not(.btn),.gold-text,.gold-accent,.golden,[class*="gold"]:not(button):not(.btn)) {
      background-color:transparent !important;
      background-image:none !important;
    }
    html[data-dj-theme="light"] body [style*="#d9b45b"],
    html[data-dj-theme="light"] body [style*="#dfb95f"],
    html[data-dj-theme="light"] body [style*="#e7c36b"],
    html[data-dj-theme="light"] body [style*="#d8ad52"],
    html[data-dj-theme="light"] body [style*="#e3bd62"],
    html[data-dj-theme="light"] body [style*="#e2b95f"],
    html[data-dj-theme="light"] body [style*="#d9ad55"],
    html[data-dj-theme="light"] body [style*="#e0bd69"],
    html[data-dj-theme="light"] body [style*="#d8ad52"],
    html[data-dj-theme="light"] body [style*="#e2bd69"] {
      color:var(--ow-purple) !important;
      border-color:#d9d6f2 !important;
      text-shadow:none !important;
    }
    html[data-dj-theme="light"] body [style*="background:#d9b45b"],
    html[data-dj-theme="light"] body [style*="background-color:#d9b45b"],
    html[data-dj-theme="light"] body [style*="background:#dfb95f"],
    html[data-dj-theme="light"] body [style*="background-color:#dfb95f"],
    html[data-dj-theme="light"] body [style*="background:#e7c36b"],
    html[data-dj-theme="light"] body [style*="background-color:#e7c36b"] {
      background:linear-gradient(110deg,var(--ow-purple),var(--ow-blue)) !important;
      color:#fff !important;
    }
    html[data-dj-theme="dark"] { color-scheme:dark !important; }
    html[data-dj-theme="dark"] body { background:#090909 !important; color:#f5f1e8 !important; }
    html[data-dj-theme="dark"] header { background:#101010 !important; color:#f5f1e8 !important; }
    @media(max-width:640px) {
      html[data-dj-theme="light"] body { font-size:15px; }
      html[data-dj-theme="light"] :where(header) { padding-left:14px; padding-right:14px; }
      html[data-dj-theme="light"] :where(main,.wrap,.container,.content) { width:100%; max-width:100%; }
      html[data-dj-theme="light"] :where(main section,.wrap section,.container section) { margin:14px 12px; }
      html[data-dj-theme="light"] :where(button,.btn,input,textarea,select) { max-width:100%; }
    }
  `;
  (document.head || document.documentElement).appendChild(style);
  document.documentElement.setAttribute("data-dj-theme", theme(getSaved()));
  window.DJOLATUNS_THEME = {
    get() { return theme(document.documentElement.getAttribute("data-dj-theme")); },
    set(value) {
      const next = theme(value);
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
  window.DJOLATUNS_THEME.set(getSaved());
})();