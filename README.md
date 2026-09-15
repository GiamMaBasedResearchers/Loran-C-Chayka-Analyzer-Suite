Loran-C / Chayka Analyzer Suite
Modular offline-first tool suite for extracting, visualizing and analyzing Loran-C / Chaykasignal presence from long-term monitor images.

Obviously, there will be several fixes to be made, and the code isn't clean, and you will find entities that appear to be false positives but are not always false positives. I consider the exercise very interesting for various levels of understanding, knowledge and technicalities.

As always, you can use the plain HTML locally 👋👋👋

To preview GitHub HTML files, use these services by pasting the links:

https://raw.githack.com/ (Tested / working)

Fast Link:

https://raw.githack.com/GiamMaBasedResearchers/Loran-C-Chayka-Analyzer-Suite/main/index.html


📡 About LORAN, Loran-C and Chayka

LORAN (Long Range Navigation) is a hyperbolic radio navigation system using low-frequencypulsed transmitters, developed during WWII. Loran-C, its most successful refinement(100 kHz pulsed signals, GRI-based chain identification), provided positioning accuracy oftens of meters over ranges of 1000–3000+ km via groundwave and much farther via night-timeskywave, until GNSS made it largely obsolete. The US network was switched off in 2010 andthe European one in 2015.

Chayka (Чайка, "seagull") is the Russian counterpart, technically very close to Loran-Cand still fully operational, with chains covering the Baltic, the Arctic, the South of Russia,the Russian Far East and — together with active Chinese and Saudi chains — most of Eurasia.

The 100 kHz band used by these systems is a fascinating propagation laboratory: groundwaveis stable day and night, while skywave appears only when the Sun is below the horizon(D-layer absent), making each transmitter→receiver path "breathe" with the terminator.Recent years have seen new chains activated (e.g. the 5970 Urals chain and Nagqu 6250in 2026), making long-term monitoring valuable for propagation research.

This suite processes the monitor displays of a Loran-C/Chayka receiver: images where everycolumn is a transmitter track and time flows vertically — turning pixels into data tables.

🙏 Data source & Acknowledgments

LoranGrabber (DL0AO) — the long-termmonitor display this tool is designed for. All the extracted data shown in this projectcomes from that receiver and its published images. Our sincere thanks for making thisdataset publicly available. https://df6nm.de/LoranView/LoranGrabber_dl0ao.htm
LoranView / LoranView animation (DF6NM)— reference implementation for coverage visualization, seasonality behavior and the worldstation set shown on our map. http://df6nm.bplaced.net/LoranView/LoranView_animation.htm


✨ Features
Tab	What it does

Extractor (core, frozen v1.0)	Loads the monitor image, auto-detects the plot area and the real column structure (active blocks + dark gaps via a global uniform-grid fit), extracts per-track ON/OFF with a noise- and day/night-robust pipeline. Simple & Advanced UI modes. Exports CSV/JSON.


<img width="1852" height="917" alt="image" src="https://github.com/user-attachments/assets/3720bf93-2e79-4149-a02a-f7de1c804b0e" />

<img width="1853" height="922" alt="image" src="https://github.com/user-attachments/assets/8270dbf9-2f71-4d6b-9a66-a89fbe70fb31" />


Map	Leaflet world map (Esri basemaps, auto-fallback): stations, GRI chain links, approximate coverage model (groundwave + night skywave). Advanced section: load the extracted CSV and watch the real signals animate on the map across the whole extract.


<img width="1917" height="921" alt="image" src="https://github.com/user-attachments/assets/0ece475c-5c2a-4839-88ce-9807ed2af658" />


Analysis	Image inspector: zoom/pan, region select, 42-band overlay of the DL0AO track columns, click-a-band deep dive (column profile, signal metric over time, UTC-hour histogram with night shading).


<img width="1893" height="923" alt="image" src="https://github.com/user-attachments/assets/2a2a198b-4d6f-450e-b6b6-f9b8b7622466" />


<img width="1918" height="922" alt="image" src="https://github.com/user-attachments/assets/7475b5be-af18-41ac-9044-abbae42d0c28" />


Season	Real signal seasonality from your CSV: monthly-average and daily heatmaps per station (ON% or normalized level), with a median-of-stations row.


<img width="1916" height="923" alt="image" src="https://github.com/user-attachments/assets/6bda638d-402f-411c-9ec4-57486b521165" />


Engineering	Radio-engineering statistics: solar correlation (Pearson r + best lag), day/night ON% separation, apparent-signal vs distance scatter (click-to-highlight), anomaly detection (daytime openings / night outages), CSV report.


<img width="1895" height="920" alt="image" src="https://github.com/user-attachments/assets/f0fe6862-8dcc-4a2b-85df-c58cd6ef3d81" />


<img width="1895" height="928" alt="image" src="https://github.com/user-attachments/assets/aca5fa8c-8e11-40f8-8f03-85dd810d0c03" />


Info	Roadmap and external-resources evaluation.


<img width="1918" height="912" alt="image" src="https://github.com/user-attachments/assets/d8b0c0fa-94db-40b3-95af-edc90de6b762" />


Runs 100% client-side — no server, no data leaves your machine (basemap tiles excepted).


🚀 Installation / Quick start

🚀 Installation / Quick start
1. Download / clone the repository — file list:
index.html            shell: tabs, module loader, shared APIcore_extractor.html   extraction core (frozen v1.0, runs in an iframe)stations.js           world station database (~70 entries)map.js                Leaflet map + real-signal animationseason.js             monthly / daily signal heatmapstools.js              image inspector (zoom, bands, deep dive)engineering.js        engineering statistics & report
2. Open index.html in a modern browser (Chrome/Edge/Firefox). No build, no server needed.Internet is required only for the map basemap tiles (the map degrades gracefully to"No basemap" offline; everything else is fully offline).
3. The dataset window is configured in one place — LORAN_API.dataset insideindex.html (start / end, default 2026-01-01 / 2026-08-30 to match theexample extract). Change it when you process a different grab.

Typical workflow

1. Extractor → drop the monitor image (grab time auto-filled from file timestamp)2. Simple mode → ANALYZE → check "Verify on image" (green/red/blue mask must match the picture)3. Export "Signal metric CSV" (recommended) and/or "Full data CSV"4. Season  → load the CSV → monthly/daily heatmaps5. Map     → Advanced → load the CSV → play the extract over the world map6. Engineering → load the metric CSV → statistics, scatter, anomalies, report7. Analysis → load the same image → zoom, bands, single-station deep dive


🔬 How the extraction works

1. Area detection — uniform outer frame trimmed; plot area auto-detected (manualdrag in Advanced).
2. Column structure — a per-pixel-column activity profile is computed over the fullheight; a global uniform-grid fit (origin + integer multiples of the pitch, outlierrejection) maps the track list to the real columns. The dark/active classification isbased on the peak column activity inside each band, so dashed traces stay active andtrue black gaps go dark. Manual column overrides (on:19 dark:20-23) are hard switches.
3. Per-row metric — a compact-streak score (best mean over a small sliding window) pertrack per row: a real trace is a contiguous vertical streak, isolated display speckle isdiluted.
4. Temporal median — a sliding median over rows kills sporadic noise, keeps coherent signal.
5. Dual threshold — fraction of the station's own peak (99.5th percentile) AND an absolutefloor vs the typical peak of all stations AND an adaptive per-row noise floor. A darkcolumn cannot "self-justify" from its own noise (this is what prevents absent stationsfrom being reported ON).
6. Presence & duty gates — stations whose peak is far below the network typical level, orwhose duty cycle after first detection is negligible (neighbor bleed), are flaggedNO SIGNAL and excluded from OFF tables.
7. ND (no data) — rows before a station's first detection are labeled ND, not OFF(stations activated mid-extract — e.g. the 2026-09-10 GRI — are reported correctly).
8. Day/night robustness — weak daytime signal (D-layer absorption) still counts as ON ifabove threshold; thresholds are tunable in Advanced.


Summary columns explained

- Col act / Col max — mean / peak activity of the image column (black ≈ 0–2 %, bleed5–15 %, active 30–100 %)
- First ON — chronologically first detection (activation date for late-added stations)
- Duty — ON fraction after First ON (real stations 30–100 %)
- NO SIGNAL / OK* / DARK* — auto-gated / forced-on by override / forced-dark by override


📤 Export formats

- loran_off_periods.csv — station, off_from, off_to, duration_min
- loran_full_data.csv — timestamp, station, state (ON/OFF/ND)
- loran_signal_metric.csv — timestamp, station, metric, metric_filt, metric_norm, state
- loran_data.json — parameters, per-station stats, OFF periods


🗺 Map notes

- Coverage rings are an approximate model: groundwave ≈ 1200 km, night skywave ≈ 4300 km(E-layer) shown only when the sun is below threshold at the path midpoint. Not afield-strength computation — see LoranViewfor a fully rendered reference.
- Advanced real-data mode aggregates the CSV in 15-minute buckets; green = majority ON,red = majority OFF, gray = no samples; marker size grows with the normalized signal level.
- Orange fill = position to verify (v:0 in stations.js); green outline = on air2026-09-10, absent from the current extract; historical (off-air 2010/2015) chains areincluded because they appear on the DF6NM world map, and are flagged in the popup.


⚠️ Limitations & known issues

- Pixel resolution: extraction precision is bounded by image resolution (e.g. an 8-monthextract at 34 k rows ≈ 1 min/row).
- Grab-time calibration: the top edge of the plot must match the moment the image wasgenerated (not saved). An error here scales linearly across the time axis.
- Column alignment: the auto grid fit reports its pitch/RMS in the Advanced panel; if itfalls back to uniform bands, results may be misaligned — use column overrides or adjustthe area. Verify with "Verify on image" / the mask every time.
- Threshold tuning: strongly degraded or very short extracts may need the ON threshold(0.12 default) and the noise multiplier tuned; the Summary tab is the health check.
- Coverage model is illustrative, not an ITU-grade field prediction.
- OSM tiles are blocked for file:// pages (403): the map starts with Esri providers andfalls back automatically; OSM works when the page is served over http(s).
- Historical stations in the DB have document-verified coordinates but are off-air;several v:0 positions (Salwa, Ash Shaykh, Al Muwassam, Hexian, Chongzuo, the new 5970chain members…) are approximations to be verified against official sources.
- Very large images in Simple mode are row-sampled (>8000 rows) to bound runtime; useAdvanced → Row step to control this.


🔗 References & further reading

- LoranGrabber (DL0AO) — data sourcehttps://df6nm.de/LoranView/LoranGrabber_dl0ao.htm
- LoranView animation (DF6NM) — seasonality & coverage referencehttp://df6nm.bplaced.net/LoranView/LoranView_animation.htm
- Wikipedia — system history and chain tables:Loran-C (en): https://en.wikipedia.org/wiki/Loran-CLORAN (it): https://it.wikipedia.org/wiki/LORANLORAN (en): https://en.wikipedia.org/wiki/LORANChayka (en): https://en.wikipedia.org/wiki/CHAYKAChayka (it): https://it.wikipedia.org/wiki/Chayka
- ClimateViewer ELF/ULF/VLF transmission sites — transmitter coordinates sourcehttps://climateviewer.org/history-and-science/atmospheric-sensors-and-emf-sites/maps/extremely-low-frequency-elf-ulf-vlf-transmission-sites/
- Russian LF/VLF field modeling paper (VSU) — theory backgroundhttps://www.cs.vsu.ru/ipmt-conf/conf/2021/works/5.%20%D0%9F%D1%80%D0%B8%D0%BA%D0%BB%D0%B0%D0%B4%D0%BD%D0%BE%D0%B5%20%D0%BC%D0%BE%D0%B4%D0%B5%D0%BB%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5%20%D0%B8%20E-business/1696.pres.pdf
- Evaluated, not integrated:PSKReporter — https://pskreporter.info/pskmap.html(ham-band automated spots only — no VLF/Loran reporting network exists; our extracted data IS the VLF dataset)hf.dxview.org — https://hf.dxview.org/map(stops at 1.8 MHz, no VLF)



🛣 Roadmap

 Core extraction (frozen v1.0)
 World station DB + interactive map
 Real-signal map animation
 Signal seasonality (monthly/daily)
 Engineering statistics & anomaly report
 Per-station detail view (monthly trend chart)
 Direct extractor→modules data handoff (postMessage, no CSV round-trip)
 Refined coverage model (land/sea routing per azimuth, DF6NM-style blobs)
 Station coordinates verification (v:0 entries)


🔗 Extra File:

 
- loran_data.json
json ready to import - 01012026 to 30082026

- lorvw_260101-0430.jpg
Image spectrum from 01/01/2026 to 30/08/2026

- lorvwold.jpg
image spectrum from 10/09/2026 to 14/09/2026

The CSV files are too large to be included here, but you can generate them from the code.

📄 License & disclaimer

This tool is provided for research and educational purposes. Extracted states arepixel-derived estimates, not authoritative service status. Use the data accordingly.

License: (choose — e.g. MIT / CC-BY — before publishing)

This application is for educational and navigation enthusiast purposes only. Loran-C data is crowdsourced and may contain errors or incomplete information. Do not use this tool for navigation or critical operations.

This code provide from: "GiamMa-based researchers SDR R&D IoT" | @GiammaIoT2 License

This project is provided for research and educational purposes.
