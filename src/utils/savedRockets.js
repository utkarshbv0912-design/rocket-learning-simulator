const SAVED_KEY = "rocketlab_saved_rockets";
const HISTORY_KEY = "rocketlab_launch_history";

export function getSavedRockets() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch { return []; }
}

export function saveRocket(name, params) {
  const rockets = getSavedRockets();
  const existing = rockets.findIndex((r) => r.name === name);
  const rocket = { id: Date.now(), name, emoji: "💾", ...params, color: "border-emerald-500/40 from-emerald-600/15", isCustom: true };
  if (existing >= 0) rockets[existing] = { ...rockets[existing], ...rocket };
  else rockets.push(rocket);
  localStorage.setItem(SAVED_KEY, JSON.stringify(rockets));
  return rocket;
}

export function deleteSavedRocket(id) {
  const rockets = getSavedRockets().filter((r) => r.id !== id);
  localStorage.setItem(SAVED_KEY, JSON.stringify(rockets));
}

export function getLaunchHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

export function addLaunchToHistory(result, rocketName) {
  const history = getLaunchHistory();
  const entry = { id: Date.now(), rocketName: rocketName || "Unknown Rocket", timestamp: new Date().toISOString(), ...result };
  history.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 15)));
}

export function clearLaunchHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
