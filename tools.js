/* tools.js — image inspector v2: zoom/pan, region select, DL0AO 42-band
   overlay (hover shows the track name, click selects the band), column
   profile, temporal metric, UTC hour histogram. */
"use strict";
(function () {
  const TRACKS = ["GPS control","Anthorn 6731M","Anthorn 6731Y","Bryansk 8000M","Petrozavodsk 8000W",
    "Slonim 8000X","Simferopol 8000Y","Syzran 8000Z","Afif 8830M","Salwa 8830W","Ash Shaykh 8830Y",
    "Al Muwassam 8830Z","Kotelnikovo 5990M","Poltavskaya 5990X","Astrakhan 5990Y","Balashov 5990Z",
    "Inta 5960M","Tumanny 5960X","Norilsk 5960Z","Yuzhno-Uralsk 5970M","Yekaterinburg 5970X",
    "Orsk 5970Z","Nagqu 6250M","Pucheng 6000M","Hexian 6780M","Raoping 6780X","Chongzuo 6780Y",
    "Xuancheng 8390M","Raoping 8390X","Rongcheng 8390Y","Rongcheng 7430M","Pucheng 7430X",
    "Helong 7430Y","Pohang 9930M","Kwang Ju 9930W","Ussuriisk 9930Z","Aleksandrovsk 7950M",
    "Petropavlovsk 7950W","Ussuriisk 7950X","George 5990N","Fallon 5990O","Havre 5990P"];
  let img = null, data = null, dpr = 1;
  let view = { x: 0, y: 0, s: 1 }, mode = "pan";
  let drag = null, sel = null, showBands = false;
  let t0 = null, t1 = null;
  const p2 = n => String(n).padStart(2, "0");
  const fmt = ms => { const d = new Date(ms);
    return `${d.getUTCFullYear()}-${p2(d.getUTCMonth()+1)}-${p2(d.getUTCDate())} ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`; };

  function sunElev(ms, lat, lon) {
    const d = new Date(ms);
    let Y = d.getUTCFullYear(), M = d.getUTCMonth() + 1;
    const D = d.getUTCDate() + (d.getUTCHours() + d.getUTCMinutes() / 60) / 24;
    if (M <= 2) { Y -= 1; M += 12; }
    const A = Math.floor(Y / 100), B = 2 - A + Math.floor(A / 4);
    const jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
    const n = jd - 2451545.0;
    const L = (280.460 + 0.9856474 * n) * Math.PI / 180, g = (357.528 + 0.9856003 * n) * Math.PI / 180;
    const lam = L + (1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180;
    const dec = Math.asin(Math.sin(23.439 * Math.PI / 180) * Math.sin(lam));
    const ra = Math.atan2(Math.cos(23.439 * Math.PI / 180) * Math.sin(lam), Math.cos(lam));
    let ha = (18.697374558 + 24.06570982441908 * n) * 15 * Math.PI / 180 + lon * Math.PI / 180 - ra;
    ha = Math.atan2(Math.sin(ha), Math.cos(ha));
    const la = lat * Math.PI / 180;
    return Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(ha)) * 180 / Math.PI;
  }

  function init(root, api) {
    root.innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label class="tab-btn" style="display:inline-block;padding:6px 12px;cursor:pointer">
          Load image <input type="file" id="tlFile" accept="image/*" style="display:none"></label>
        <button class="tab-btn active" id="tlPan">Pan</button>
        <button class="tab-btn" id="tlSel">Select region</button>
        <button class="tab-btn" id="tlBand">Bands 1–42</button>
        <button class="tab-btn" id="tlFit">Fit</button>
        <button class="tab-btn" id="tlRun">Analyze region</button>
        <label>Start(UTC) <input type="date" id="tlStart" value="2026-01-01"></label>
        <label>Grab(UTC) <input type="datetime-local" id="tlGrab"></label>
        <span id="tlInfo" style="font-size:0.75rem;color:#8b949e"></span>
      </div>
      <canvas id="tlCanvas" style="width:100%;background:#000;border-radius:8px;cursor:grab"></canvas>
      <div id="tlOut" style="margin-top:10px"></div>
      <div style="color:#8b949e;font-size:0.75rem;margin-top:6px">
        <b>Bands 1–42</b>: overlay of the DL0AO track columns (assumes the whole image, or your
        current selection, is the plot area). With Bands active, <b>click a band</b> to select it,
        then "Analyze region" for that station's deep-dive (profile, metric over time, UTC histogram).</div>`;
    const cv = root.querySelector("#tlCanvas"), info = root.querySelector("#tlInfo"),
          out = root.querySelector("#tlOut");
    const fit = () => {
      if (!img) return;
      const cw = cv.parentElement.clientWidth - 4, ch = 560;
      cv.width = cw * dpr; cv.height = ch * dpr;
      cv.style.height = ch + "px";
      view.s = Math.min(cw / img.width, ch / img.height);
      view.x = (cw - img.width * view.s) / 2; view.y = (ch - img.height * view.s) / 2;
      draw();
    };
    const plotRect = () => sel || { x0: 0, y0: 0, x1: img ? img.width : 1, y1: img ? img.height : 1 };
    function draw(hoverBand) {
      if (!img) return;
      const ctx = cv.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cv.width / dpr, cv.height / dpr);
      ctx.imageSmoothingEnabled = view.s < 1;
      ctx.setTransform(view.s * dpr, 0, 0, view.s * dpr, view.x * dpr, view.y * dpr);
      ctx.drawImage(img, 0, 0);
      const R = plotRect();
      if (showBands) {
        const bw = (R.x1 - R.x0) / TRACKS.length;
        ctx.font = `${Math.max(7, 9 / view.s)}px monospace`;
        for (let i = 0; i <= TRACKS.length; i++) {
          const x = R.x0 + i * bw;
          ctx.strokeStyle = "rgba(255,210,77,0.55)"; ctx.lineWidth = 1 / view.s;
          ctx.beginPath(); ctx.moveTo(x, R.y0); ctx.lineTo(x, R.y1); ctx.stroke();
        }
        for (let i = 0; i < TRACKS.length; i++) {
          ctx.fillStyle = hoverBand === i ? "#ff5252" : "#ffd24d";
          ctx.fillText(String(i + 1), R.x0 + i * bw + 2 / view.s, R.y0 + 11 / view.s);
        }
      }
      if (sel) {
        ctx.strokeStyle = "#ff5252"; ctx.lineWidth = 1.5 / view.s;
        ctx.setLineDash([5 / view.s, 3 / view.s]);
        ctx.strokeRect(sel.x0, sel.y0, sel.x1 - sel.x0, sel.y1 - sel.y0);
        ctx.setLineDash([]);
      }
    }
    const toImg = (cx, cy) => {
      const r = cv.getBoundingClientRect();
      return { x: (cx - r.left - view.x) / view.s, y: (cy - r.top - view.y) / view.s };
    };
    const bandAt = (cx, cy) => {
      const p = toImg(cx, cy), R = plotRect();
      if (p.x < R.x0 || p.x >= R.x1 || p.y < R.y0 || p.y >= R.y1) return -1;
      return Math.min(TRACKS.length - 1, Math.floor((p.x - R.x0) / ((R.x1 - R.x0) / TRACKS.length)));
    };
    cv.addEventListener("wheel", e => {
      e.preventDefault();
      const f = e.deltaY < 0 ? 1.2 : 1 / 1.2;
      const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
      view.x = mx - (mx - view.x) * f; view.y = my - (my - view.y) * f;
      view.s = Math.max(0.02, Math.min(40, view.s * f));
      draw();
    }, { passive: false });
    cv.addEventListener("mousedown", e => { drag = { sx: e.clientX, sy: e.clientY, x: view.x, y: view.y, moved: false }; });
    cv.addEventListener("mousemove", e => {
      if (showBands && img && !drag) draw(bandAt(e.clientX, e.clientY));
      if (drag) {
        if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 4) drag.moved = true;
        if (mode === "pan") {
          view.x = drag.x + e.clientX - drag.sx; view.y = drag.y + e.clientY - drag.sy; draw();
        } else if (img) {
          const a = toImg(drag.sx, drag.sy), b = toImg(e.clientX, e.clientY);
          sel = { x0: Math.round(Math.min(a.x, b.x)), y0: Math.round(Math.min(a.y, b.y)),
                  x1: Math.round(Math.max(a.x, b.x)), y1: Math.round(Math.max(a.y, b.y)) };
          info.textContent = `region ${sel.x1 - sel.x0} × ${sel.y1 - sel.y0} px @ (${sel.x0},${sel.y0})`;
          draw();
        }
      }
    });
    window.addEventListener("mouseup", e => {
      if (!drag) return;
      const wasClick = !drag.moved;
      drag = null;
      if (wasClick && showBands && img) {
        const b = bandAt(e.clientX, e.clientY);
        if (b >= 0) {
          const R = plotRect(), bw = (R.x1 - R.x0) / TRACKS.length;
          sel = { x0: Math.round(R.x0 + b * bw), y0: Math.round(R.y0),
                  x1: Math.round(R.x0 + (b + 1) * bw), y1: Math.round(R.y1) };
          info.textContent = `band ${b + 1}: ${TRACKS[b]} selected — press "Analyze region"`;
          draw();
        }
      }
    });
    root.querySelector("#tlPan").onclick = () => { mode = "pan"; cv.style.cursor = "grab"; };
    root.querySelector("#tlSel").onclick = () => { mode = "sel"; cv.style.cursor = "crosshair"; };
    root.querySelector("#tlBand").onclick = e => {
      showBands = !showBands;
      e.target.classList.toggle("active", showBands);
      mode = showBands ? "band" : "pan";
      cv.style.cursor = showBands ? "pointer" : "grab";
      draw();
    };
    root.querySelector("#tlFit").onclick = fit;
    root.querySelector("#tlFile").onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = ev => {
        img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.width; c.height = img.height;
          const ctx = c.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);
          data = ctx.getImageData(0, 0, img.width, img.height);
          sel = null; info.textContent = `loaded ${img.width} × ${img.height} px`;
          if (f.lastModified) root.querySelector("#tlGrab").value =
            new Date(f.lastModified - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          fit();
        };
        img.src = ev.target.result;
      };
      rd.readAsDataURL(f);
    };
    root.querySelector("#tlRun").onclick = () => {
      if (!data) { info.textContent = "load an image first"; return; }
      const sv = root.querySelector("#tlStart").value, gv = root.querySelector("#tlGrab").value;
      t0 = Date.parse(sv + "T00:00:00Z");
      t1 = gv ? Date.parse(gv + (gv.length === 16 ? ":00" : "") + "Z") : Date.now();
      if (!isFinite(t0) || !isFinite(t1) || !(t1 > t0)) { info.textContent = "invalid time window"; return; }
      analyze(out, info);
    };
  }

  function analyze(out, info) {
    const R = sel || { x0: 0, y0: 0, x1: data.width, y1: data.height };
    const W = data.width, d = data.data;
    const rowsN = Math.min(R.y1 - R.y0, 1600), rStep = (R.y1 - R.y0) / rowsN;
    const colN = Math.min(R.x1 - R.x0, 1000), cStep = (R.x1 - R.x0) / colN;
    const prof = new Float64Array(colN);
    for (let ci = 0; ci < colN; ci++) {
      const x = Math.round(R.x0 + ci * cStep);
      let c = 0;
      for (let ri = 0; ri < rowsN; ri += 2) {
        const p = ((Math.round(R.y0 + ri * rStep) * W) + x) * 4;
        const mx = Math.max(d[p], d[p+1], d[p+2]), mn = Math.min(d[p], d[p+1], d[p+2]);
        if (mx > 60 && mx - mn > 45) c++;
      }
      prof[ci] = c / Math.ceil(rowsN / 2);
    }
    const ts = [], ms = [];
    for (let ri = 0; ri < rowsN; ri++) {
      const y = Math.round(R.y0 + ri * rStep);
      let s = 0, n = 0;
      for (let ci = 0; ci < colN; ci += 2) {
        const x = Math.round(R.x0 + ci * cStep), p = (y * W + x) * 4;
        const mx = Math.max(d[p], d[p+1], d[p+2]), mn = Math.min(d[p], d[p+1], d[p+2]);
        if (mx > 60 && mx - mn > 45) { s += (mx - mn) / 255 * (mx / 255); n++; }
      }
      ts.push(t1 - (t1 - t0) * (ri / (rowsN - 1 || 1)));
      ms.push(n ? s / n : 0);
    }
    const bins = new Float64Array(24), cnt = new Float64Array(24);
    for (let i = 0; i < ts.length; i++) {
      const h = new Date(ts[i]).getUTCHours();
      bins[h] += ms[i]; cnt[h]++;
    }
    const api = window.LORAN_API;
    const night = [];
    for (let h = 0; h < 24; h++)
      night.push(api && sunElev(t0 + h * 3600000, api.receiver.lat, api.receiver.lon) < -6);
    const chart = (arr, w, h, col, nightArr) => {
      const cv = document.createElement("canvas");
      cv.width = w; cv.height = h; cv.style.width = "100%";
      const c = cv.getContext("2d");
      const mx = Math.max(1e-9, ...arr);
      if (nightArr) for (let i = 0; i < nightArr.length; i++) {
        c.fillStyle = nightArr[i] ? "rgba(70,100,200,0.25)" : "rgba(240,180,60,0.15)";
        c.fillRect(i / nightArr.length * w, 0, w / nightArr.length, h);
      }
      c.fillStyle = col;
      for (let i = 0; i < arr.length; i++) {
        const bh = arr[i] / mx * (h - 14);
        c.fillRect(i / arr.length * w, h - 14 - bh, Math.max(1, w / arr.length - 1), bh);
      }
      c.fillStyle = "#8b949e"; c.font = "9px monospace";
      return cv;
    };
    const wl = out.clientWidth || 900;
    out.innerHTML = `<div style="font-size:0.8rem;color:#8b949e;margin-bottom:6px">` +
      `Region ${R.x1 - R.x0}×${R.y1 - R.y0} px — ${fmt(t0)} → ${fmt(t1)} UTC` +
      ` (window ${(t1 - t0) / 3600000 < 48 ? ((t1 - t0) / 3600000).toFixed(1) + " h" : ((t1 - t0) / 86400000).toFixed(1) + " d"})</div>` +
      `<div style="font-size:0.75rem;color:#8b949e">Column activity profile (left→right)</div>`;
    out.appendChild(chart(prof, wl, 90, "#58a6ff"));
    const l1 = document.createElement("div");
    l1.style.cssText = "font-size:0.75rem;color:#8b949e;margin-top:6px";
    l1.textContent = "Signal metric over time (sampled rows)";
    out.appendChild(l1);
    out.appendChild(chart(ms, wl, 130, "#7ee787"));
    const l2 = document.createElement("div");
    l2.style.cssText = "font-size:0.75rem;color:#8b949e;margin-top:6px";
    l2.textContent = "Mean metric per UTC hour (blue = receiver night)";
    out.appendChild(l2);
    const hb = Array.from(bins).map((v, i) => cnt[i] ? v / cnt[i] : 0);
    out.appendChild(chart(hb, wl, 100, "#f0883e", night));
    info.textContent = "region analyzed";
  }

  window.LORAN_TOOLS = { init };
  if (window.LORAN_API) window.LORAN_API.register("tools", window.LORAN_TOOLS);
})();