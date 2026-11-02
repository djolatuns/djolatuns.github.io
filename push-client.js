(() => {
  const SUPABASE_URL = "https://tiqracqtgggoctyvtuqo.supabase.co";
  const SUPABASE_KEY = "sb_publishable_9UYttF-UC-2xgb6KBYBvLQ_4rCob3LO";
  const VAPID_PUBLIC_KEY = "BAPOSk8cJRZu45PyPQV0-7vEzczdPTeJM5FumsjXBGlVVtB-Evk3l5t9GHqVbDoM4ViwlKeXdWuW7I2mca_DEig";
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

  async function getPushRegistration() {
    if (!("serviceWorker" in navigator)) throw new Error("This browser does not support service workers.");
    await navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
    return await navigator.serviceWorker.ready;
  }

  async function refreshPushState() {
    const enableButton = $("enablePushBtn");
    const disableButton = $("disablePushBtn");
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      say("This browser does not support web push. Update Chrome on Android and open the installed DJ OLATUNS app.");
      if (enableButton) enableButton.disabled = true;
      if (disableButton) disableButton.classList.add("hidden");
      return;
    }
    const reg = await getPushRegistration();
    const sub = await reg.pushManager.getSubscription();
    if (enableButton) {
      enableButton.disabled = false;
      enableButton.classList.toggle("hidden", !!sub);
    }
    if (disableButton) disableButton.classList.toggle("hidden", !sub);
    if (sub) {
      // Re-sync an existing browser subscription with the signed-in member account.
      const result = await callPush("subscribe", { subscription: sub.toJSON() });
      say(result.message || "Notifications are active and linked to your member account on this device.");
    } else if (Notification.permission === "denied") {
      say("Notifications are blocked by Android or Chrome. Allow notifications for djolatuns.github.io in your phone settings, then return here.");
    } else {
      say("Notifications are off on this device. Select Enable Notifications and allow the permission request.");
    }
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
      const reg = await getPushRegistration();
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

  async function testCEO() {
    const button = $("testPushBtn");
    if (!button) return;
    button.disabled = true;
    say("Sending a private test notification to your CEO devices…");
    try {
      const result = await callPush("test-ceo");
      say("CEO test sent to " + result.sent + " of " + result.total + " subscribed devices. Check your phone notifications.");
    } catch (error) {
      say("CEO test failed: " + (error.message || "Unknown push error."));
    } finally {
      button.disabled = false;
    }
  }

  async function disable() {
    const button = $("disablePushBtn");
    button.disabled = true;
    try {
      const reg = await getPushRegistration();
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

  window.sendDJLoginAlert = async function() {
    return await callPush("login-alert");
  };

  window.initMemberPush = async function(user) {
    if (!user) return;
    const notice = $("pushNotice");
    const enableButton = $("enablePushBtn");
    const disableButton = $("disablePushBtn");
    if (notice && enableButton && disableButton) {
      enableButton.onclick = enable;
      disableButton.onclick = disable;
      try { await refreshPushState(); } catch (error) { say(error.message); }
    }
    const testButton = $("testPushBtn");
    if (testButton) testButton.onclick = testCEO;
  };

  if (window.__djCurrentUser) window.initMemberPush(window.__djCurrentUser);
})();