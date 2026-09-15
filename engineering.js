/* engineering.js v3 — solar correlation, day/night separation, distance
   scatter (dynamic highlight), anomalies, report. Compact, no-overlap layout:
   table width:max-content with horizontal scroll; charts sized to container. */
"use strict";
(function () {
  const p2 = n => String(n).padStart(2, "0");
  const R_E = 6371, rad = Math.PI / 180;
  function sunElev(ms, lat, lon) {
    const d = new Date(ms);
    let Y = d.getUTCFullYear(), M = d.getUTCMonth() + 1;
    const D = d.getUTCDate() + (d.getUTCHours() + d.getUTCMinutes() / 60) / 24;
    if (M <= 2) { Y -= 1; M += 12; }
    const A = Math.floor(Y / 100), B = 2 - A + Math.floor(A / 4);
    const jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
    const n = jd - 2451545.0;
    const L = (280.460 + 0.9856474 * n) * rad, g = (357.528 + 0.9856003 * n) * rad;
    const lam = L + (1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad;
    const eps = 23.439 * rad;
    const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
    const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
    let ha = (18.697374558 + 24.06570982441908 * n) * 15 * rad + lon * rad - ra;
    ha = Math.atan2(Math.sin(ha), Math.cos(ha));
    const la = lat * rad;
    return Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(ha)) / rad;
  }
  function midPath(a, b) {
    const p1 = a.lat * rad, p2l = b.lat * rad, dl = (b.lon - a.lon) * rad;
    const Bx = Math.cos(p2l) * Math.cos(dl), By = Math.cos(p2l) * Math.sin(dl);
    const pm = Math.atan2(Math.sin(p1) + Math.sin(p2l), Math.hypot(Math.cos(p1) + Bx, By));
    return { lat: pm / rad, lon: (a.lon * rad + Math.atan2(By, Math.cos(p1) + Bx)) / rad };
  }
  function gcKm(a, b) {
    const dLa = (b.lat - a.lat) * rad, dLo = (b.lon - a.lon) * rad;
    const s = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLo / 2) ** 2;
    return 2 * R_E * Math.asin(Math.sqrt(s));
  }
  function parseCSV(text) {
    const out = [];
    for (const l of text.split(/\r?\n/)) {
      const m = l.match(/^"([^"]+)","([^"]+)",([\d.eE+-]+),([\d.eE+-]+),([\d.eE+-]+),(\w+)\s*$/);
      if (m) { const t = Date.parse(m[1].replace(" ", "T") + "Z"); if (isFinite(t)) out.push({ t, st: m[2], mn: +m[5], on: m[6] === "ON" }); }
    }
    return out;
  }
  const lookup = (name, stations) => {
    const m = name.match(/(\d{4})([MWXYZNOP])\s/);
    return m ? stations.find(s => s.gri === m[1] && s.role === m[2]) || null : null;
  };
  const shortName = n => n.replace(/\s*\d{4}[MWXYZNOP]\b[\s\S]*$/, "").trim() || n;

  let perStation = [], anomalies = [], selIdx = -1;

  function computeAll(rows, api) {
    const stations = api.stations(), rec = api.receiver;
    if (!stations.length) throw new Error("stations.js not loaded");
    const groups = {};
    for (const r of rows) (groups[r.st] = groups[r.st] || []).push(r);
    const out = [];
    for (const name in groups) {
      const g = groups[name].sort((a, b) => a.t - b.t);
      const sdb = lookup(name, stations);
      if (!sdb) continue;
      const mid = midPath(rec, sdb), n = g.length;
      const elev = new Float64Array(n);
      for (let i = 0; i < n; i++) elev[i] = sunElev(g[i].t, mid.lat, mid.lon);
      let onCnt = 0, sumOn = 0, dN = 0, dOn = 0, nN = 0, nOn = 0;
      for (let i = 0; i < n; i++) {
        if (g[i].on) { onCnt++; sumOn += g[i].mn; }
        if (elev[i] > 0) { dN++; if (g[i].on) dOn++; }
        else if (elev[i] < -6) { nN++; if (g[i].on) nOn++; }
      }
      let best = { r: 0, lag: 0 };
      for (let lagH = -3; lagH <= 3.001; lagH += 0.5) {
        let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, k = 0;
        for (let i = 0; i < n; i++) {
          const ni = sunElev(g[i].t - lagH * 3600000, mid.lat, mid.lon) < -6 ? 1 : 0;
          const on = g[i].on ? 1 : 0;
          sx += ni; sy += on; sxx += ni; syy += on; sxy += ni * on; k++;
        }
        const den = Math.sqrt((k * sxx - sx * sx) * (k * syy - sy * sy));
        const r = den > 0 ? (k * sxy - sx * sy) / den : 0;
        if (r > best.r) best = { r, lag: lagH };
      }
      out.push({ name, gri: sdb.gri, role: sdb.role, dist: gcKm(rec, sdb), n,
        onPct: 100 * onCnt / n, meanOn: onCnt ? sumOn / onCnt : 0,
        dayPct: dN ? 100 * dOn / dN : NaN, nightPct: nN ? 100 * nOn / nN : NaN,
        corr: best.r, lag: best.lag, g, elev });
    }
    return out.sort((a, b) => b.corr - a.corr);
  }
  function findAnomalies(per) {
    const list = [];
    for (const s of per) {
      if (s.corr < 0.2 || !isFinite(s.dayPct)) continue;
      const byDay = {};
      for (let i = 0; i < s.g.length; i++) {
        const d = new Date(s.g[i].t).toISOString().slice(0, 10);
        const b = (byDay[d] = byDay[d] || { dOn: 0, dN: 0, nOn: 0, nN: 0 });
        if (s.elev[i] > 0) { b.dN++; if (s.g[i].on) b.dOn++; }
        else if (s.elev[i] < -6) { b.nN++; if (s.g[i].on) b.nOn++; }
      }
      for (const d in byDay) {
        const b = byDay[d];
        const dp = b.dN >= 20 ? 100 * b.dOn / b.dN : null;
        const np = b.nN >= 20 ? 100 * b.nOn / b.nN : null;
        if (dp !== null && s.dayPct < 15 && dp > 40)
          list.push({ st: s.name, day: d, kind: "daytime opening", val: dp.toFixed(0) + "% ON in daylight" });
        if (np !== null && s.nightPct > 85 && np < 50)
          list.push({ st: s.name, day: d, kind: "night outage", val: np.toFixed(0) + "% ON at night" });
      }
    }
    return list.slice(0, 50);
  }
  function drawScatter() {
    const wrap = document.getElementById("enScatWrap");
    if (!wrap) return;
    const wCss = Math.max(320, Math.min(1000, wrap.clientWidth || 900));
    const w = wCss, h = 210, top = 34;
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h; cv.style.width = "100%";
    wrap.innerHTML = ""; wrap.appendChild(cv);
    const c = cv.getContext("2d");
    c.fillStyle = "#0d1117"; c.fillRect(0, 0, w, h);
    const vis = perStation.filter(s => s.onPct > 0);
    const dmx = Math.max(1000, ...vis.map(s => s.dist));
    const my = Math.max(0.01, ...vis.map(s => s.meanOn));
    c.strokeStyle = "#30363d";
    c.beginPath(); c.moveTo(40, h - 26); c.lineTo(w - 10, h - 26); c.stroke();
    for (const s of vis) {
      const x = 40 + s.dist / dmx * (w - 60), y = h - 26 - s.meanOn / my * (h - top - 14);
      const sel = vis.indexOf(s) === selIdx;
      c.fillStyle = sel ? "#ff5252" : s.corr > 0.5 ? "#58a6ff" : s.corr > 0.2 ? "#7ee787" : "#6a6a6a";
      c.beginPath(); c.arc(x, y, sel ? 5.5 : 3.5, 0, 7); c.fill();
      if (sel) {
        c.strokeStyle = "#ff5252"; c.lineWidth = 1.5;
        c.beginPath(); c.arc(x, y, 9, 0, 7); c.stroke();
      }
      c.fillStyle = sel ? "#ff5252" : "#6a6a6a"; c.font = "8px monospace";
      c.fillText(s.gri + s.role, x + 4, y + 9);
    }
    c.fillStyle = "#8b949e"; c.font = "10px monospace";
    c.fillText("0", 40, h - 8); c.fillText(Math.round(dmx) + " km", w - 80, h - 8);
    c.fillStyle = "#58a6ff";
    c.fillText(selIdx >= 0
      ? "Apparent signal vs distance — selected: " + shortName(perStation[selIdx].name) + " " +
        perStation[selIdx].gri + perStation[selIdx].role + " (" + Math.round(perStation[selIdx].dist) + " km)"
      : "Apparent signal vs distance — click a table row to highlight a station", 42, 16);
  }
  function drawElev(s) {
    const holder = document.getElementById("enProf");
    if (!holder) return;
    const wCss = Math.max(320, Math.min(1000, holder.clientWidth || 900));
    const w = wCss, h = 180, bins = 13, lo = -32.5;
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h; cv.style.width = "100%";
    holder.innerHTML = ""; holder.appendChild(cv);
    const c = cv.getContext("2d");
    c.fillStyle = "#0d1117"; c.fillRect(0, 0, w, h);
    const acc = Array.from({ length: bins }, () => ({ on: 0, n: 0 }));
    for (let i = 0; i < s.g.length; i++) {
      const k = Math.max(0, Math.min(bins - 1, Math.floor((s.elev[i] - lo) / 5)));
      acc[k].n++; if (s.g[i].on) acc[k].on++;
    }
    const bw = (w - 80) / bins;
    for (let k = 0; k < bins; k++) {
      const x = 40 + k * bw, eC = lo + (k + 0.5) * 5;
      c.fillStyle = eC < -6 ? "rgba(70,100,200,0.25)" : eC > 0 ? "rgba(240,180,60,0.2)" : "rgba(150,150,150,0.15)";
      c.fillRect(x, 30, bw - 1, h - 56);
      if (acc[k].n) {
        const p = 100 * acc[k].on / acc[k].n, ph = p / 100 * (h - 62);
        c.fillStyle = "#7ee787"; c.fillRect(x, h - 26 - ph, bw - 1, ph);
        c.fillStyle = "#c9d1d9"; c.font = "9px monospace";
        c.fillText(p.toFixed(0) + "%", x + 2, h - 30 - ph);
      }
    }
    c.fillStyle = "#8b949e"; c.font = "10px monospace";
    for (let e = -30; e <= 30; e += 10) c.fillText(e + "°", 40 + (e - lo) / 5 * bw, h - 6);
    c.fillStyle = "#58a6ff";
    c.fillText(shortName(s.name) + " " + s.gri + s.role + " — ON% vs sun elevation at path midpoint", 42, 16);
  }

  function init(root, api) {
    root.innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label class="tab-btn" style="display:inline-block;padding:6px 12px;cursor:pointer">
          Metric CSV <input type="file" id="enCsv" accept=".csv" style="display:none"></label>
        <button class="tab-btn" id="enRun" disabled>Analyze</button>
        <button class="tab-btn" id="enRep" disabled>Report CSV</button>
        <span id="enInfo" style="font-size:0.75rem;color:#8b949e"></span>
      </div>
      <div id="enOut"></div>`;
    const info = root.querySelector("#enInfo"), out = root.querySelector("#enOut");
    let csvText = null;
    root.querySelector("#enCsv").onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = ev => { csvText = ev.target.result;
        root.querySelector("#enRun").disabled = false;
        info.textContent = "CSV loaded (" + f.name + ")"; };
      rd.readAsText(f);
    };
    root.querySelector("#enRun").onclick = () => {
      try {
        const rows = parseCSV(csvText);
        if (!rows.length) { info.textContent = "no valid rows — is this loran_signal_metric.csv?"; return; }
        perStation = computeAll(rows, api);
        anomalies = findAnomalies(perStation);
        selIdx = -1;
        root.querySelector("#enRep").disabled = false;
        render(out, info);
      } catch (err) { info.textContent = "error: " + err.message; }
    };
    root.querySelector("#enRep").onclick = () => {
      let csv = "station,gri,role,dist_km,samples,on_pct,mean_norm_on,day_on_pct,night_on_pct,solar_corr,best_lag_h,anomalies\n";
      for (const s of perStation)
        csv += `"${s.name}",${s.gri},${s.role},${s.dist.toFixed(0)},${s.n},${s.onPct.toFixed(1)},` +
               `${s.meanOn.toFixed(3)},${isFinite(s.dayPct) ? s.dayPct.toFixed(1) : ""},` +
               `${isFinite(s.nightPct) ? s.nightPct.toFixed(1) : ""},${s.corr.toFixed(3)},${s.lag},` +
               `${anomalies.filter(a => a.st === s.name).length}\n`;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      a.download = "loran_engineering_report.csv"; a.click();
      URL.revokeObjectURL(a.href);
    };
  }
  function render(out, info) {
    out.innerHTML =
      `<div style="font-size:0.75rem;color:#8b949e;margin-bottom:6px">` +
      `${perStation.length} stations · Solar corr = Pearson r (ON vs night at path midpoint, best lag).` +
      ` Click a row: highlights the station in the scatter + elevation profile below.</div>` +
      `<div style="display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:10px;align-items:start">` +
      `<div style="border:1px solid #30363d;border-radius:6px;max-height:38vh;overflow:auto">` +
      `<table style="width:max-content;min-width:100%;table-layout:auto">` +
      `<thead><tr><th>Station</th><th>GRI</th><th>Role</th><th>km</th><th>N</th><th>ON%</th>` +
      `<th>MeanON</th><th>Day%</th><th>Night%</th><th>Corr</th><th>Lag</th></tr></thead>` +
      `<tbody id="enBody"></tbody></table></div>` +
      `<div id="enAnom" style="font-size:0.7rem;color:#8b949e;max-height:38vh;overflow:auto;` +
      `border:1px solid #30363d;border-radius:6px;padding:8px"></div></div>` +
      `<div style="margin-top:10px" id="enScatWrap"></div>` +
      `<div style="margin-top:10px" id="enProf"></div>`;
    out.querySelector("#enBody").innerHTML = perStation.map((s, i) =>
      `<tr data-i="${i}" style="cursor:pointer" title="${s.name.replace(/"/g, "&quot;")}">` +
      `<td>${shortName(s.name)}</td><td>${s.gri}</td><td>${s.role}</td>` +
      `<td>${Math.round(s.dist)}</td><td>${s.n}</td><td>${s.onPct.toFixed(1)}</td><td>${s.meanOn.toFixed(3)}</td>` +
      `<td>${isFinite(s.dayPct) ? s.dayPct.toFixed(0) : "—"}</td>` +
      `<td>${isFinite(s.nightPct) ? s.nightPct.toFixed(0) : "—"}</td>` +
      `<td style="color:${s.corr > 0.5 ? "#58a6ff" : s.corr > 0.2 ? "#7ee787" : "#6a6a6a"}">${s.corr.toFixed(2)}</td>` +
      `<td>${s.lag > 0 ? "+" : ""}${s.lag}h</td></tr>`).join("");
    out.querySelector("#enBody").addEventListener("click", e => {
      const tr = e.target.closest("tr"); if (!tr) return;
      const i = +tr.dataset.i;
      selIdx = (selIdx === i) ? -1 : i;             // toggle
      drawScatter();
      if (selIdx >= 0) drawElev(perStation[selIdx]);
      else document.getElementById("enProf").innerHTML = "";
    });
    drawScatter();
    out.querySelector("#enAnom").innerHTML = anomalies.length
      ? "<b style='color:#f0883e'>Anomalies (possible Sporadic-E / absorption events):</b><br>" +
        anomalies.map(a => `${a.day} — ${shortName(a.st)}: <b>${a.kind}</b> (${a.val})`).join("<br>")
      : "No anomalies detected (thresholds: corr ≥ 0.2, day base < 15%, opening > 40%).";
    info.textContent = "analysis complete";
  }

  window.LORAN_ENGINEERING = { init };
  if (window.LORAN_API) window.LORAN_API.register("engineering", window.LORAN_ENGINEERING);
})();