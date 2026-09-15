/* season.js — REAL signal seasonality from the extractor's CSV export.
   Monthly averages and daily heatmaps per station (ON% / normalized level).
   No model, no invented dates: periods are deduced from the data itself. */
"use strict";
(function () {
  const p2 = n => String(n).padStart(2, "0");
  const labelW = 215, padT = 24, padB = 26, plotW = 940;

  let raw = null, stations = [], months = [], days = [],
      bySt = null, view = "monthly", metric = "on", hideNoSig = true,
      noSigNames = [];

  /* ── parsing (fast, no per-row Date) ── */
  function parseCSV(text) {
    const re = /^"([^"]+)","([^"]+)",(.*)$/, stRe = /(ON|OFF|ND)\s*"?\s*$/,
          numRe = /([\d.]+)\s*,\s*(?:ON|OFF|ND)\s*"?$/;
    const rows = [];
    for (const l of text.split(/\r?\n/)) {
      const m = re.exec(l);
      if (!m) continue;
      const t = Date.parse(m[1].replace(" ", "T") + "Z");
      if (!isFinite(t)) continue;
      const sm = stRe.exec(m[3]);
      if (!sm || sm[1] === "ND") continue;                 // skip no-data rows
      const nm = numRe.exec(m[3]);
      rows.push({ t, st: m[2], on: sm[1] === "ON",
                  lvl: nm ? parseFloat(nm[1]) : 0,
                  mk: m[1].slice(0, 7), dk: m[1].slice(0, 10) });
    }
    return rows;
  }

  function aggregate() {
    bySt = new Map();
    const mK = new Set(), dK = new Set(), order = [];
    for (const r of raw) {
      let s = bySt.get(r.st);
      if (!s) { s = { m: new Map(), d: new Map(), totOn: 0, tot: 0, maxLvl: 0 };
                bySt.set(r.st, s); order.push(r.st); }
      mK.add(r.mk); dK.add(r.dk);
      let a = s.m.get(r.mk); if (!a) { a = { on: 0, tot: 0, lvl: 0 }; s.m.set(r.mk, a); }
      let b = s.d.get(r.dk); if (!b) { b = { on: 0, tot: 0, lvl: 0 }; s.d.set(r.dk, b); }
      a.tot++; b.tot++; s.tot++;
      if (r.on) { a.on++; b.on++; s.totOn++; }
      a.lvl += r.lvl; b.lvl += r.lvl;
      if (r.lvl > s.maxLvl) s.maxLvl = r.lvl;
    }
    stations = order;
    months = [...mK].sort();
    days = [...dK].sort();
    noSigNames = stations.filter(n => {
      const s = bySt.get(n);
      return s.tot > 0 && s.totOn / s.tot < 0.005 && s.maxLvl < 0.05;
    });
  }
  const visible = () =>
    hideNoSig ? stations.filter(n => !noSigNames.includes(n)) : stations;

  function cellVal(rec, key) {
    if (!rec) return null;
    const v = metric === "on" ? rec.on / rec.tot : Math.min(1, rec.lvl / rec.tot);
    return rec.tot ? v : null;
  }
  function colColor(v) {
    if (v === null) return "rgba(255,255,255,0.05)";
    return `rgba(60,220,120,${(0.10 + 0.85 * v).toFixed(3)})`;
  }
  const med = arr => {
    const a = arr.filter(x => x !== null).sort((x, y) => x - y);
    return a.length ? a[a.length >> 1] : null;
  };

  function draw(cv, hover) {
    const names = visible(), perRow = view === "monthly" ? 26 : 14;
    const keys = view === "monthly" ? months : days;
    const cellW = view === "monthly"
      ? Math.min(105, plotW / Math.max(1, keys.length))
      : Math.max(2, plotW / Math.max(1, days.length));
    const extra = view === "monthly" ? 30 : 0;             // median row
    const nRows = names.length + (extra ? 1 : 0);
    const cssH = padT + padB + nRows * perRow;
    const w = labelW + keys.length * cellW + (view === "monthly" ? 20 : 14);
    cv.width = w; cv.height = cssH; cv.style.maxWidth = "100%";
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, w, cssH);
    ctx.font = "10px sans-serif"; ctx.textBaseline = "middle";

    const val = (name, k) => cellVal(bySt.get(name)[view === "monthly" ? "m" : "d"].get(k), 0);

    /* median row (monthly view only) */
    let y0 = padT;
    if (extra) {
      ctx.fillStyle = "#58a6ff";
      ctx.fillText("ALL (median of stations)", 4, y0 + perRow / 2);
      months.forEach((mk, j) => {
        const vals = visible().map(n => {
          const r = bySt.get(n).m.get(mk);
          return cellVal(r, 0);
        });
        const v = med(vals);
        const x = labelW + j * cellW;
        ctx.fillStyle = colColor(v);
        ctx.fillRect(x, y0 + 1, cellW - 2, perRow - 2);
        if (v !== null) {
          ctx.fillStyle = "#0d1117"; ctx.font = "bold 10px sans-serif";
          ctx.fillText((100 * v).toFixed(0) + "%", x + (cellW - 2) / 2 - 11, y0 + perRow / 2);
          ctx.font = "10px sans-serif";
        }
      });
      y0 += perRow;
    }
    names.forEach((nm, i) => {
      const y = y0 + i * perRow;
      let label = nm; if (label.length > 30) label = label.slice(0, 29) + "…";
      ctx.fillStyle = "#c9d1d9"; ctx.fillText(label, 4, y + perRow / 2);
      keys.forEach((k, j) => {
        const rec = bySt.get(nm)[view === "monthly" ? "m" : "d"].get(k);
        const v = cellVal(rec, 0);
        const x = labelW + j * cellW;
        ctx.fillStyle = colColor(v);
        ctx.fillRect(x, y + 1, cellW - 2, perRow - 2);
        if (view === "monthly" && v !== null) {
          ctx.fillStyle = "#c9d1d9";
          ctx.fillText((100 * v).toFixed(0), x + (cellW - 2) / 2 - 8, y + perRow / 2);
        }
      });
    });

    /* axis */
    ctx.fillStyle = "#8b949e";
    if (view === "monthly") {
      months.forEach((mk, j) =>
        ctx.fillText(mk.slice(5) + "/" + mk.slice(2, 4),
          labelW + j * cellW + (cellW - 2) / 2 - 14, cssH - 9));
    } else {
      let prevM = "";
      days.forEach((dk, j) => {
        const mm = dk.slice(5, 7);
        if (mm !== prevM) {
          const x = labelW + j * cellW;
          ctx.strokeStyle = "rgba(255,255,255,0.15)";
          ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, cssH - padB); ctx.stroke();
          ctx.fillText(dk.slice(5) + "/" + dk.slice(2, 4), x + 2, cssH - 9);
          prevM = mm;
        }
      });
    }
    if (hover) {
      const i = Math.floor((hover.y - y0) / perRow);
      const j = Math.floor((hover.x - labelW) / cellW);
      let txt = "";
      if (i >= 0 && j >= 0) {
        if (extra && i === 0) {
          const mk = months[j];
          const v = med(visible().map(n => cellVal(bySt.get(n).m.get(mk), 0)));
          txt = `ALL stations · ${mk} · median ` +
                (v === null ? "no data" : (100 * v).toFixed(1) + "%");
        } else {
          const nm = names[extra ? i - 1 : i], k = keys[j];
          if (nm && k) {
            const r = bySt.get(nm)[view === "monthly" ? "m" : "d"].get(k);
            txt = r ? `${nm} · ${k} · ON ${r.on}/${r.tot} = ` +
              (100 * r.on / r.tot).toFixed(1) + "%" +
              (r.lvl ? ` · level ${(r.lvl / r.tot).toFixed(3)}` : "")
                    : `${nm} · ${k} · no data`;
          }
        }
      }
      hover.out.textContent = txt;
    }
  }

  function init(root, api) {
    root.innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label class="tab-btn" style="display:inline-block;padding:6px 12px;cursor:pointer">
          Load extractor CSV <input type="file" id="snCsv" accept=".csv" style="display:none"></label>
        <span style="font-size:0.72rem;color:#8b949e">("Full data CSV" or "Signal metric CSV" from the Extractor tab)</span>
        <label>View <select id="snView">
          <option value="monthly" selected>Monthly averages</option>
          <option value="daily">Daily</option></select></label>
        <label>Metric <select id="snMetric">
          <option value="on" selected>ON %</option>
          <option value="lvl">Signal level (normalized)</option></select></label>
        <label class="chk" style="margin:0"><input type="checkbox" id="snHide" checked> Hide no-signal stations</label>
        <span id="snInfo" style="font-size:0.75rem;color:#8b949e"></span>
      </div>
      <canvas id="snCanvas" style="max-width:100%;border-radius:8px"></canvas>
      <div id="snHover" style="font-size:0.78rem;color:#8b949e;margin-top:6px;min-height:18px"></div>
      <div style="color:#8b949e;font-size:0.75rem;margin-top:6px">
        <b>REAL DATA</b> &mdash; everything on this tab comes from your extracted CSV; periods are
        deduced from the data (no invented dates). Green intensity = ON% (or mean normalized signal
        level). Monthly view shows the value in each cell and a median row on top; Daily view has
        month ticks on the axis. Stations on air after the extract end show up as "no signal"
        rows &mdash; keep "Hide no-signal stations" on to hide them.</div>`;
    const cv = root.querySelector("#snCanvas"), info = root.querySelector("#snInfo");
    root.querySelector("#snCsv").onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      info.textContent = "parsing " + f.name + " ...";
      const rd = new FileReader();
      rd.onload = ev => {
        setTimeout(() => {
          raw = parseCSV(ev.target.result);
          if (!raw.length) { info.textContent = "no valid rows — is this an extractor CSV?"; return; }
          aggregate();
          info.textContent = raw.length.toLocaleString() + " samples · " + stations.length +
            " stations · " + months[0] + " → " + months[months.length - 1] +
            (noSigNames.length ? " · no-signal stations hidden: " + noSigNames.length : "");
          draw(cv);
        }, 30);
      };
      rd.readAsText(f);
    };
    root.querySelector("#snView").onchange = e => { view = e.target.value; draw(cv); };
    root.querySelector("#snMetric").onchange = e => { metric = e.target.value; draw(cv); };
    root.querySelector("#snHide").onchange = e => { hideNoSig = e.target.checked; draw(cv); };
    cv.addEventListener("mousemove", e => {
      const r = cv.getBoundingClientRect(), k = cv.width / r.width;
      draw(cv, { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k,
                 out: root.querySelector("#snHover") });
    });
  }
  window.LORAN_SEASON = { init };
  if (window.LORAN_API) window.LORAN_API.register("season", window.LORAN_SEASON);
})();