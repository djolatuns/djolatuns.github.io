(() => {
  const SUPABASE_URL = "https://tiqracqtgggoctyvtuqo.supabase.co";
  const SUPABASE_KEY = "sb_publishable_9UYttF-UC-2xgb6KBYBvLQ_4rCob3LO";
  const VAPID_PUBLIC_KEY = "BFyxNuIrHS5TOcnOOf_RYSSDkroBWzE0LCoxbzkApVi-0vvjbS68-7-zsA-kqkX6agWMA6i7vvfC-exTNTsvvuk";
  let client = null;

  const $ = (id) => document.getElementById(id);
  function say(message) { const el = $("pushStatus"); if (el) el.textContent = message; }
  function decodeKey(value) {
    const padded = value + "=".repeat((4 - value.length % 4) % 4);
    const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(raw, c => c.charCodeAt(0));
  }

  async function getClient() {
    if (!window.supabase) throw new Error("The account service is not ready. Refresh and try again.");
    if (!client) client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data } = await client.auth.getSession();
    if (!data.session) throw new Error("Please log in to enable member notifications.");
    return { client, session: data.session };
  }

  async function refreshPushState() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      say("This browser does not support push notifications. Update Chrome on Android and reopen the installed app.");
      $("enablePushBtn").disabled = true;
      return;
    }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    $("enablePushBtn").classList.toggle("hidden", !!sub);
    $("disablePushBtn").classList.toggle("hidden", !sub);
    if (sub) say("Notifications are enabled on this device.");
    else if (Notification.permission === "denied") say("Notifications are blocked in Android/browser settings. Allow them there, then try again.");
    else say("Notifications are currently off on this device.");
  }

  async function callPush(action, payload = {}) {
    const { session } = await getClient();
    const response = await fetch(SUPABASE_URL + "/functions/v1/member-push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + session.access_token
      },
      body: JSON.stringify({ action, ...payload })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Push service error (" + response.status + ").");
    return result;
  }

  async function enable() {
    const button = $("enablePushBtn");
    button.disabled = true;
    try {
      await getClient();
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") throw new Error("Notification permission was not granted. Allow it in your phone settings to continue.");
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeKey(VAPID_PUBLIC_KEY)
      });
      const result = await callPush("subscribe", { subscription: sub.toJSON() });
      say(result.message || "Notifications enabled.");
      await refreshPushState();
    } catch (error) {
      say(error.message || "Could not enable notifications.");
    } finally {
      button.disabled = false;
    }
  }

  async function disable() {
    const button = $("disablePushBtn");
    button.disabled = true;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await callPush("unsubscribe", { endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      await refreshPushState();
    } catch (error) {
      say(error.message || "Could not turn off notifications.");
    } finally {
      button.disabled = false;
    }
  }

  window.initMemberPush = async function(user) {
    if (!user || !$("pushNotice")) return;
    $("enablePushBtn").onclick = enable;
    $("disablePushBtn").onclick = disable;
    try { await refreshPushState(); } catch (error) { say(error.message); }
  };

  if (window.__djCurrentUser) window.initMemberPush(window.__djCurrentUser);
})();