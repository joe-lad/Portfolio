const CSV_URL = "https://mrshu.github.io/github-statuses/parsed/downtime_windows.csv";
const STATS_URL = "/uptime_stats";

function setPill(id, state, label) {
  const el = document.getElementById(id);
  el.className = "uptime-pill uptime-pill--" + state;
  el.innerHTML = '<span class="uptime-dot"></span>' + label;
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map(line => {
    const vals = line.split(",");
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (vals[i] || "").trim());
    return obj;
  });
}

function calcUptime(rows) {
  const now = new Date();
  const cutoff = new Date(now - 90 * 24 * 60 * 60 * 1000);
  const totalMins = 90 * 24 * 60;
  let downtimeMins = 0;
  rows
    .filter(r => r.impact !== "maintenance")
    .forEach(r => {
      const start = new Date(r.downtime_start);
      const end   = new Date(r.downtime_end);
      if (end < cutoff) return;
      const clampStart = start < cutoff ? cutoff : start;
      const clampEnd   = end > now ? now : end;
      const mins = (clampEnd - clampStart) / 60000;
      if (mins > 0) downtimeMins += mins;
    });
  return (totalMins - downtimeMins) / totalMins * 100;
}

async function checkJKnight() {
  setPill("jk-pill", "neutral", "Loading…");
  try {
    const res  = await fetch(STATS_URL);
    const data = await res.json();
    const pct  = parseFloat(data.uptime_90d).toFixed(2);
    const up   = data.status === 2;
    setPill("jk-pill", up ? "ok" : "bad", up ? "Up" : "Down");
    document.getElementById("jk-pct").textContent  = pct + "%";
    document.getElementById("jk-meta").textContent = "Status: " + (up ? "operational" : "down");
  } catch (e) {
    setPill("jk-pill", "bad", "Error");
    document.getElementById("jk-meta").textContent = e.message;
  }
}

async function checkGitHub() {
  setPill("gh-pill", "neutral", "Loading…");
  try {
    const res  = await fetch(CSV_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    const rows = parseCSV(text);

    const uptime = calcUptime(rows);
    document.getElementById("gh-pct").textContent = uptime.toFixed(2) + "%";

    const now     = new Date();
    const cutoff  = new Date(now - 90 * 24 * 60 * 60 * 1000);
    const recent  = rows.filter(r => r.impact !== "maintenance" && new Date(r.downtime_end) >= cutoff);
    const uniqueIds = [...new Set(recent.map(r => r.incident_id))];
    document.getElementById("gh-meta").textContent = uniqueIds.length + " incidents";

    const ok = uptime >= 99.5;
    setPill("gh-pill", ok ? "ok" : uptime >= 99.0 ? "warn" : "bad", ok ? "Operational" : "Degraded");
  } catch (e) {
    setPill("gh-pill", "bad", "Error: " + e.message);
  }
}

window.uptimeWidgetInit = async function () {
  document.getElementById("uptime-last-run").textContent = "Checked at " + new Date().toLocaleTimeString();
  await Promise.all([checkJKnight(), checkGitHub()]);
};

if (document.getElementById("uptime-widget")) {
  uptimeWidgetInit();
}