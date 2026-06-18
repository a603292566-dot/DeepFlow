const CONFIG_KEY = "deepflow_supabase_config_v1";
const QUEUE_KEY = "deepflow_supabase_queue_v1";
const CLIENT_ID_KEY = "deepflow_client_id_v1";
const STATUS_KEY = "deepflow_supabase_status_v1";
const APP_VERSION = "deepflow-mvp-v1";

function readJson(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix) {
  const random = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${random}`;
}

function normalizeUrl(url) {
  return url.trim().replace(/\/+$/, "");
}

function getEnvConfig() {
  const env = globalThis.DEEPFLOW_ENV || {};
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  return {
    enabled: Boolean(supabaseUrl && anonKey),
    supabaseUrl: normalizeUrl(supabaseUrl),
    anonKey
  };
}

export function getCloudConfig() {
  const saved = readJson(CONFIG_KEY, null);
  if (saved?.supabaseUrl && saved?.anonKey) return saved;
  return getEnvConfig();
}

export function saveCloudConfig(config) {
  const nextConfig = {
    enabled: Boolean(config.supabaseUrl && config.anonKey),
    supabaseUrl: normalizeUrl(config.supabaseUrl || ""),
    anonKey: (config.anonKey || "").trim()
  };
  writeJson(CONFIG_KEY, nextConfig);
  return nextConfig;
}

export function clearCloudConfig() {
  localStorage.removeItem(CONFIG_KEY);
}

export function hasEnvCloudConfig() {
  return getEnvConfig().enabled;
}

export function getClientId() {
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = createId("client");
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  return clientId;
}

export function getCloudQueue() {
  return readJson(QUEUE_KEY, []);
}

function saveCloudQueue(queue) {
  writeJson(QUEUE_KEY, queue);
}

export function getCloudSyncStatus() {
  const config = getCloudConfig();
  return {
    configured: Boolean(config.enabled && config.supabaseUrl && config.anonKey),
    queueCount: getCloudQueue().length,
    ...readJson(STATUS_KEY, {})
  };
}

function setCloudSyncStatus(patch) {
  writeJson(STATUS_KEY, {
    ...readJson(STATUS_KEY, {}),
    ...patch
  });
}

export function queueCloudEvent(eventType, state, payload = {}) {
  const event = {
    sync_id: createId("sync"),
    client_id: getClientId(),
    profile_id: state?.user?.id || state?.activeProfileId || null,
    event_type: eventType,
    event_payload: payload,
    app_version: APP_VERSION,
    created_at: new Date().toISOString()
  };
  saveCloudQueue([...getCloudQueue(), event]);
  setCloudSyncStatus({ lastQueuedAt: event.created_at, lastError: "" });
  flushCloudQueue();
  return event;
}

export async function flushCloudQueue() {
  const config = getCloudConfig();
  if (!config.enabled || !config.supabaseUrl || !config.anonKey) return { synced: 0, pending: getCloudQueue().length };

  const queue = getCloudQueue();
  if (!queue.length) return { synced: 0, pending: 0 };

  const remaining = [];
  let synced = 0;

  for (const event of queue) {
    try {
      const response = await fetch(`${config.supabaseUrl}/rest/v1/deepflow_sync_events`, {
        method: "POST",
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Supabase sync failed: ${response.status}`);
      }

      synced += 1;
    } catch (error) {
      remaining.push(event);
      setCloudSyncStatus({
        lastError: error.message || "同步暂时不可用",
        lastAttemptAt: new Date().toISOString()
      });
    }
  }

  saveCloudQueue(remaining);
  if (synced) {
    setCloudSyncStatus({
      lastSyncedAt: new Date().toISOString(),
      lastError: ""
    });
  }

  return { synced, pending: remaining.length };
}

export function cloudConfigPreview() {
  const config = getCloudConfig();
  if (!config.supabaseUrl) return "未配置";
  return config.supabaseUrl;
}

export function queueTestCloudEvent(state = {}) {
  const event = queueCloudEvent("sync_test", state, {
    message: "DeepFlow Supabase test event",
    createdAt: new Date().toISOString()
  });
  setCloudSyncStatus({ lastTestAt: event.created_at });
  return event;
}
