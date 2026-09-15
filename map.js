/* map.js — Leaflet world map + ADVANCED real-signal animation.
   Basemaps: Esri (no API key) with auto-fallback. Static layer: stations,
   GRI links, coverage model. ADVANCED: load the extractor CSV (Full data or
   Signal metric) and markers show the REAL state at the selected time
   (green=ON, red=OFF, gray=no data in the 15-min bucket), with playback. */
"use strict";
(function () {
  const p2 = n => String(n).padStart(2, "0");
  const rad = Math.PI / 180;
  const BUCKET_MS = 900000;                       // 15-minute aggregation
  const MARGIN_MS = 3 * 86400000;                 // tolerance around the dataset window
  const griColor = g => { let h = 0; for (const c of g) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
    return `hsl(${h % 360},70%,55%)`; };

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
  function gcPoints(a, b, n = 48) {
    const p1 = a.lat * rad, l1 = a.lon * rad, p2 = b.lat * rad, l2 = b.lon * rad;
    const d = 2 * Math.asin(Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 +
      Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2));
    if (d < 1e-9) return [[a.lat, a.lon]];
    const sd = Math.sin(d), pts = [];
    for (let k = 0; k <= n; k++) {
      const f = k / n, A = Math.sin((1 - f) * d) / sd, B = Math.sin(f * d) / sd;
      const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
      const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
      const z = A * Math.sin(p1) + B * Math.sin(p2);
      pts.push([Math.atan2(z, Math.hypot(x, y)) / rad, Math.atan2(y, x) / rad]);
    }
    return pts;
  }
  /* fast "YYYY-MM-DD HH:MM:SS" → ms (no Date object per row) */
  function daysFromCivil(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const era = Math.floor(y / 400), yoe = y - era * 400;
    const doy = Math.floor((153 * (m - 3) + 2) / 5) + d - 1;
    const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
    return era * 146097 + doe - 719468;
  }
  function parseTs(s) {
    if (s.length < 16) return NaN;
    const y = +s.slice(0, 4), mo = +s.slice(5, 7), d = +s.slice(8, 10);
    const h = +s.slice(11, 13) || 0, mi = +s.slice(14, 16) || 0;
    const t = (daysFromCivil(y, mo, d) * 86400 + h * 3600 + mi * 60) * 1000;
    return isFinite(t) ? t : NaN;
  }
  /* chunked CSV → 15-min buckets per station.
     FIX: state is at end-of-line WITHOUT a trailing quote ("...,ON"),
     optional trailing CR (Windows) and optional quote are stripped. */
  function loadReal(text, api, done, prog) {
    const t0 = Date.parse(api.dataset.start + "T00:00:00Z") - MARGIN_MS;
    const t1 = Date.parse(api.dataset.end + "T23:59:59Z") + MARGIN_MS;
    const nb = Math.ceil((t1 - t0) / BUCKET_MS) + 1;
    const smap = new Map(), byKey = new Map();
    let tMin = Infinity, tMax = -Infinity, rows = 0, skipped = 0, pos = 0;
    const n = text.length, reNum = /,([\d.]+),(?:ON|OFF)$/;
    function chunk() {
      const stop = Math.min(n, pos + 300000);
      while (pos < stop) {
        let nl = text.indexOf("\n", pos); if (nl < 0) nl = n;
        if (nl - pos > 18) {
          const q1 = text.indexOf('"', pos);
          if (q1 >= 0 && q1 < nl) {
            const q2 = text.indexOf('"', q1 + 1);
            const q3 = q2 >= 0 ? text.indexOf('"', q2 + 1) : -1;
            const q4 = q3 >= 0 ? text.indexOf('"', q3 + 1) : -1;
            if (q4 >= 0 && q4 < nl) {
              const t = parseTs(text.slice(q1 + 1, q2));
              if (isFinite(t)) {
                let tail = text.slice(q4 + 1, nl);
                const lc = tail.charCodeAt(tail.length - 1);
                if (lc === 13 || lc === 34) tail = tail.slice(0, -1);   // strip \r or "
                let on = -1;
                if (tail.endsWith("ON")) on = 1;
                else if (tail.endsWith("OFF")) on = 0;
                if (on >= 0) {
                  if (t >= t0 && t <= t1) {
                    const name = text.slice(q3 + 1, q4);
                    const mm = reNum.exec(tail);
                    const lvl = mm ? +mm[1] : 0;
                    let e = smap.get(name);
                    if (!e) {
                      e = { on: new Uint32Array(nb), cnt: new Uint32Array(nb), lvl: new Float64Array(nb) };
                      smap.set(name, e);
                      const km = name.match(/(\d{4})([MWXYZNOP])\b/);
                      if (km) byKey.set(km[1] + km[2], e);
                    }
                    const b = ((t - t0) / BUCKET_MS) | 0;
                    e.cnt[b]++; if (on) e.on[b]++; e.lvl[b] += lvl;
                    if (t < tMin) tMin = t; if (t > tMax) tMax = t;
                    rows++;
                  } else skipped++;
                }
              }
            }
          }
        }
        pos = nl + 1;
      }
      prog(rows);
      if (pos < n) setTimeout(chunk, 0);
      else done({ t0, t1, nb, map: smap, byKey, tMin, tMax, rows, skipped });
    }
    setTimeout(chunk, 0);
  }

  const PROVIDERS = [
    { name: "Satellite (Esri)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attr: "Tiles &copy; Esri" },
    { name: "Streets (Esri)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", attr: "Tiles &copy; Esri" },
    { name: "Topographic (Esri)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", attr: "Tiles &copy; Esri" },
    { name: "OpenStreetMap", url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", attr: "&copy; OpenStreetMap contributors" }
  ];

  let root = null, api = null, map = null, layers = null, tileLayer = null, built = false,
      provIdx = 0, errN = 0, okN = 0, day0 = 0, hour = 12, thr = -6, rec = null, st = [],
      real = null, realMode = false, timer = null;

  function setProvider(i) {
    provIdx = i; errN = 0; okN = 0;
    if (tileLayer) { map.removeLayer(tileLayer); tileLayer = null; }
    const note = root.querySelector("#mpBaseNote");
    if (i < 0) { note.textContent = "no basemap (offline) — markers still shown"; return; }
    const p = PROVIDERS[i];
    tileLayer = L.tileLayer(p.url, { maxZoom: 12, attribution: p.attr });
    tileLayer.on("tileerror", () => { if (++errN >= 8 && okN === 0) setProvider(provIdx + 1 < PROVIDERS.length ? provIdx + 1 : -1); });
    tileLayer.on("tileload", () => { okN++; });
    tileLayer.addTo(map);
    root.querySelector("#mpBase").value = String(i);
    note.textContent = "basemap: " + p.name;
  }
  function realAt(entry, t) {
    const b = ((t - real.t0) / BUCKET_MS) | 0;
    if (b < 0 || b >= real.nb) return null;
    const c = entry.cnt[b];
    if (!c) return null;
    return { on: entry.on[b], c, frac: entry.on[b] / c, lvl: entry.lvl[b] / c };
  }
  function refreshOverlays() {
    if (!map) return;
    layers.clearLayers();
    const t = day0 + hour * 3600000;
    const showGW = root.querySelector("#mpGW").checked;
    const showSW = root.querySelector("#mpSW").checked;
    const useReal = realMode && real && real.rows > 0;
    const chains = {};
    for (const s of st) (chains[s.gri] = chains[s.gri] || { m: null, sec: [] });
    for (const s of st) if (s.role === "M") chains[s.gri].m = s; else chains[s.gri].sec.push(s);
    for (const g in chains) {
      const c = chains[g], col = griColor(g);
      if (c.m) for (const s of c.sec)
        layers.addLayer(L.polyline(gcPoints(c.m, s), { color: col, weight: 1, opacity: 0.5, dashArray: "4 5" }));
    }
    st.forEach(s => {
      if (showGW) layers.addLayer(L.circle([s.lat, s.lon], {
        radius: 1200000, color: griColor(s.gri), weight: 1, fillOpacity: 0.06, opacity: 0.35 }));
      if (showSW && sunElev(t, midPath(rec, s).lat, midPath(rec, s).lon) < thr)
        layers.addLayer(L.circle([s.lat, s.lon], {
          radius: 4300000, color: griColor(s.gri), weight: 1.2, dashArray: "6 6",
          fillOpacity: 0.04, opacity: 0.6 }));
    });
    st.forEach(s => {
      const isNew = /NEW/i.test(s.note || "");
      let fill = s.v ? griColor(s.gri) : "#f0883e", radius = s.role === "M" ? 6 : 4.5, extra = "";
      if (useReal) {
        const entry = real.byKey.get(s.gri + s.role);
        const r = entry ? realAt(entry, t) : null;
        if (r) {
          fill = r.frac >= 0.5 ? "#2ecc71" : "#e74c3c";
          radius += Math.min(5, r.lvl * 6);
          extra = `<br><b>REAL</b> (15-min bucket): ON ${r.on}/${r.c} = ${(100 * r.frac).toFixed(0)}%` +
                  (r.lvl ? ` · lvl ${r.lvl.toFixed(3)}` : "");
        } else {
          fill = "#555"; extra = "<br><b>REAL</b>: no data in this bucket";
        }
      }
      layers.addLayer(L.circleMarker([s.lat, s.lon], {
        radius, color: isNew ? "#7ee787" : "#000", weight: isNew ? 2 : 0.8,
        fillColor: fill, fillOpacity: 0.95
      }).bindPopup(`<b>${s.name}</b><br>GRI ${s.gri} · role ${s.role}` +
        `<br>${s.lat.toFixed(2)}, ${s.lon.toFixed(2)} · ${Math.round(api.greatCircleKm(rec, s))} km` +
        extra +
        (isNew ? '<br><b style="color:#e3b341">NEW — on air 2026-09-10, NO data in this extract</b>' : "") +
        (s.v ? "" : '<br><i>position to verify</i>')));
    });
    layers.addLayer(L.circleMarker([rec.lat, rec.lon], {
      radius: 7, color: "#fff", weight: 2, fillColor: "#ff5252", fillOpacity: 1
    }).bindPopup(`<b>${rec.name}</b><br>Monitoring receiver`));
  }
  function upd() {
    day0 = Date.parse(root.querySelector("#mpDate").value + "T00:00:00Z");
    if (!isFinite(day0)) day0 = Date.parse(api.dataset.start + "T00:00:00Z");
    hour = parseFloat(root.querySelector("#mpHour").value) || 0;
    thr = parseFloat(root.querySelector("#mpThr").value) || -6;
    const d = new Date(day0);
    root.querySelector("#mpClock").textContent = d.toISOString().slice(0, 10) + " " +
      p2(Math.floor(hour)) + ":" + p2(Math.round((hour % 1) * 60)) + " UTC";
    refreshOverlays();
  }
  function setCursor(t) {
    const d = new Date(t);
    root.querySelector("#mpDate").value = d.toISOString().slice(0, 10);
    hour = (t % 86400000) / 3600000;
    root.querySelector("#mpHour").value = hour;
    upd();
  }
  function stopPlay() {
    if (timer) { clearInterval(timer); timer = null; }
    root.querySelector("#mpPlay").innerHTML = "&#9654; Play";
  }
  function build() {
    built = true;
    map = L.map(root.querySelector("#mpMap"), { worldCopyJump: true }).setView([rec.lat, rec.lon], 3);
    layers = L.layerGroup().addTo(map);
    setProvider(0);
    upd();
  }
  function init(r, a) {
    root = r; api = a;
    rec = api.receiver;
    st = api.stations().filter(s => s.role !== "R");
    const D = api.dataset;
    root.innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
      <label>Date (UTC)
        <input type="date" id="mpDate" value="${D.start}" min="${D.start}" max="${D.end}"></label>
        <label>Hour <input type="range" id="mpHour" min="0" max="24" step="0.25" value="12" style="width:200px"></label>
        <span id="mpClock" style="font-family:monospace;color:#58a6ff;min-width:130px"></span>
        <label>Basemap <select id="mpBase">
          ${PROVIDERS.map((p, i) => `<option value="${i}">${p.name}</option>`).join("")}
          <option value="-1">No basemap (offline)</option></select></label>
        <span id="mpBaseNote" style="font-size:0.72rem;color:#8b949e"></span>
        <label class="chk" style="margin:0"><input type="checkbox" id="mpGW" checked> Groundwave ~1200 km</label>
        <label class="chk" style="margin:0"><input type="checkbox" id="mpSW" checked> Night skywave ~4300 km</label>
        <label>Thr <input type="number" id="mpThr" value="-6" step="1" style="width:52px">&deg;</label>
      </div>
      <details id="mpAdv" style="margin-bottom:8px">
        <summary style="cursor:pointer;color:#58a6ff;font-size:0.85rem;font-weight:600">
          Advanced &mdash; real signals on the map (from your extractor CSV)</summary>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0;
             border:1px solid #30363d;border-radius:8px;padding:10px;background:#0d1117">
          <label class="tab-btn" style="display:inline-block;padding:6px 12px;cursor:pointer">
            Load CSV <input type="file" id="mpCsv" accept=".csv" style="display:none"></label>
          <label class="chk" style="margin:0"><input type="checkbox" id="mpReal" disabled> Real data mode</label>
          <button class="tab-btn" id="mpPlay" disabled>&#9654; Play</button>
          <label>Step <select id="mpStep">
            <option value="900000">15 min</option><option value="3600000" selected>1 h</option>
            <option value="21600000">6 h</option><option value="86400000">1 day</option></select></label>
          <span id="mpRealInfo" style="font-size:0.75rem;color:#8b949e">
            Load "Full data CSV" or "Signal metric CSV" exported from the Extractor tab.</span>
        </div>
      </details>
      <div id="mpMap" style="height:620px;border-radius:8px;border:1px solid #30363d;background:#0d1117"></div>
      <div style="margin-top:6px;font-size:0.78rem;color:#8b949e">
        Coverage rings: approximate model; dashed rings only at night. Orange fill = position to
        verify; green outline = on air 2026-09-10 (absent from this extract). In <b>real data
        mode</b>: <b style="color:#2ecc71">green = ON</b>,
        <b style="color:#e74c3c">red = OFF</b>, gray = no samples in that 15-min bucket; marker
        size grows with signal level (metric CSV). Play animates the whole extract.</div>`;
    ["mpDate", "mpHour", "mpGW", "mpSW", "mpThr"].forEach(id =>
      root.querySelector("#" + id).addEventListener("input", upd));
    root.querySelector("#mpBase").addEventListener("change", e =>
      setProvider(parseInt(e.target.value, 10)));
    root.querySelector("#mpReal").addEventListener("change", e => {
      realMode = e.target.checked && !!real;
      refreshOverlays();
    });
    root.querySelector("#mpPlay").addEventListener("click", () => {
      if (timer) { stopPlay(); return; }
      root.querySelector("#mpPlay").innerHTML = "&#9632; Stop";
      const step = parseInt(root.querySelector("#mpStep").value, 10);
      const endT = real && real.rows ? real.tMax : Date.parse(D.end + "T23:59:59Z");
      const startT = real && real.rows ? real.tMin : Date.parse(D.start + "T00:00:00Z");
      let t = Math.max(day0 + hour * 3600000, startT);
      timer = setInterval(() => {
        t += step;
        if (t > endT) t = startT;
        setCursor(t);
      }, 160);
    });
    root.querySelector("#mpCsv").addEventListener("change", e => {
      const f = e.target.files[0]; if (!f) return;
      const info = root.querySelector("#mpRealInfo");
      info.textContent = "parsing " + f.name + " ...";
      const rd = new FileReader();
      rd.onload = ev => {
        loadReal(ev.target.result, api,
          res => {
            real = res;
            if (!res.rows) {
              info.textContent = "0 rows matched — is this an extractor CSV (Full data / Signal metric)?";
              return;
            }
            realMode = true;
            root.querySelector("#mpReal").disabled = false;
            root.querySelector("#mpReal").checked = true;
            root.querySelector("#mpPlay").disabled = false;
            info.textContent = res.rows.toLocaleString() + " samples · " + res.map.size +
              " stations · data " + new Date(res.tMin).toISOString().slice(0, 10) + " → " +
              new Date(res.tMax).toISOString().slice(0, 10) +
              " · buckets 15 min" + (res.skipped ? " · " + res.skipped.toLocaleString() + " rows outside window" : "");
            refreshOverlays();
          },
          r => { info.textContent = "parsing... " + r.toLocaleString() + " rows"; });
      };
      rd.readAsText(f);
    });
  }
  function onShow() {
    if (!window.L) return;
    if (!built) build();
    else setTimeout(() => map.invalidateSize(), 60);
  }
  window.LORAN_MAP = { init, onShow };
  if (window.LORAN_API) window.LORAN_API.register("map", window.LORAN_MAP);
})();
