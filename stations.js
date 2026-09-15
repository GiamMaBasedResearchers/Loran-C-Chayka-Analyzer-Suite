/* stations.js — Loran-C / Chayka world DB (DL0AO monitored set + historical
   chains shown on the DF6NM world map). Sources: DL0AO grabber track list,
   Wikipedia chain tables (Loran-C en/it, Chayka), DF6NM LoranView label strip.
   v:1 = documented coordinates; v:0 = position and/or GRI/role to verify.
   "historical" = off-air (US chains 2010, EU chains 2015 or earlier).
   The four NEW entries went on air 2026-09-10, after the extract ends. */
"use strict";
window.LORAN_STATIONS = [
  /* ── monitoring site ── */
  { id:"gps",  name:"GPS control (ALS162 40pps)", gri:"-",   role:"R", lat:48.10, lon:11.58, v:1, note:"Control GPS receiver at the monitoring site" },

  /* ── NW Europe (historical, off-air 2015) ── */
  { id:"ant_m",name:"Anthorn",       gri:"6731", role:"M", lat:54.91, lon:-3.27,  v:1, note:"off-air Dec 2015" },
  { id:"ant_y",name:"Anthorn (Y)",   gri:"6731", role:"Y", lat:54.91, lon:-3.27,  v:1, note:"second DL0AO track; chain assignment (6731Y/7499Y) to verify" },
  { id:"les",  name:"Lessay",        gri:"7499", role:"X", lat:49.68, lon:-1.51,  v:0, note:"France — historical, off-air 2015; GRI (7499/6731) to verify" },
  { id:"syl",  name:"Sylt (Rantum)", gri:"7499", role:"M", lat:54.83, lon:8.55,   v:0, note:"Germany — historical; GRI/role to verify" },

  /* ── Norwegian Sea 7270 (historical) ── */
  { id:"eide", name:"Eiði",          gri:"7270", role:"M", lat:62.30, lon:-7.07,  v:0, note:"Faroe Islands — historical" },
  { id:"bo",   name:"Bø",            gri:"7270", role:"W", lat:58.94, lon:5.66,   v:0, note:"Norway — historical; role to verify" },
  { id:"jan",  name:"Jan Mayen",     gri:"7270", role:"X", lat:70.93, lon:-8.70,  v:0, note:"historical; role to verify" },
  { id:"vae",  name:"Værlandet",     gri:"7270", role:"Y", lat:61.58, lon:4.90,   v:0, note:"Norway — historical; role to verify" },

  /* ── Mediterranean 7990 (historical) ── */
  { id:"kar",  name:"Kargaburun",    gri:"7990", role:"M", lat:36.63, lon:36.35,  v:0, note:"Turkey — historical Med chain; GRI/role to verify" },
  { id:"est",  name:"Estartit",      gri:"7990", role:"X", lat:42.06, lon:3.22,   v:0, note:"Spain — historical; to verify" },
  { id:"sel",  name:"Sellia Marina", gri:"7990", role:"Y", lat:39.10, lon:16.74,  v:0, note:"Italy — historical; to verify" },
  { id:"lam",  name:"Lampedusa",     gri:"7990", role:"Z", lat:35.51, lon:12.58,  v:0, note:"Italy — historical; to verify" },

  /* ── Russian Chayka (active, monitored) ── */
  { id:"bry",  name:"Bryansk",       gri:"8000", role:"M", lat:53.06, lon:34.42,  v:1 },
  { id:"pet",  name:"Petrozavodsk",  gri:"8000", role:"W", lat:61.79, lon:34.36,  v:1 },
  { id:"slo",  name:"Slonim",        gri:"8000", role:"X", lat:53.09, lon:25.33,  v:1 },
  { id:"sim",  name:"Simferopol",    gri:"8000", role:"Y", lat:44.77, lon:33.88,  v:1 },
  { id:"syz",  name:"Syzran",        gri:"8000", role:"Z", lat:53.15, lon:46.60,  v:1 },
  { id:"int",  name:"Inta",          gri:"5960", role:"M", lat:66.03, lon:60.27,  v:1 },
  { id:"tum",  name:"Tumanny Pen",   gri:"5960", role:"X", lat:68.90, lon:35.20,  v:1 },
  { id:"nor",  name:"Norilsk",       gri:"5960", role:"Z", lat:69.38, lon:88.15,  v:1 },
  { id:"kot",  name:"Kotelnikovo",   gri:"5990", role:"M", lat:47.62, lon:42.83,  v:1 },
  { id:"pol",  name:"Poltavskaya",   gri:"5990", role:"X", lat:45.36, lon:38.19,  v:1 },
  { id:"ast",  name:"Astrakhan",     gri:"5990", role:"Y", lat:46.42, lon:48.05,  v:1 },
  { id:"bal",  name:"Balashov",      gri:"5990", role:"Z", lat:51.55, lon:43.16,  v:1 },
  { id:"ale",  name:"Aleksandrovsk", gri:"7950", role:"M", lat:50.88, lon:142.15, v:1 },
  { id:"petk", name:"Petropavlovsk", gri:"7950", role:"W", lat:53.10, lon:157.50, v:1 },
  { id:"uss7", name:"Ussuriisk",     gri:"7950", role:"X", lat:43.80, lon:132.20, v:1 },

  /* ── new 2026 chains (after the extract) ── */
  { id:"yum",  name:"Yuzhno-Uralsk", gri:"5970", role:"M", lat:54.50, lon:61.50,  v:0, note:"NEW — on air 2026-09-10, no data in extract" },
  { id:"yek",  name:"Yekaterinburg", gri:"5970", role:"X", lat:56.60, lon:61.00,  v:0, note:"NEW — on air 2026-09-10 (position to verify)" },
  { id:"ors",  name:"Orsk",          gri:"5970", role:"Z", lat:51.00, lon:58.50,  v:0, note:"NEW — on air 2026-09-10" },
  { id:"nag",  name:"Nagqu",         gri:"6250", role:"M", lat:31.48, lon:92.06,  v:0, note:"NEW — on air 2026-09-10" },

  /* ── East Asia (active, monitored) ── */
  { id:"pch6", name:"Pucheng",       gri:"6000", role:"M", lat:34.95, lon:109.60, v:1 },
  { id:"hex",  name:"Hexian",        gri:"6780", role:"M", lat:24.48, lon:111.35, v:0, note:"position to verify" },
  { id:"rao6", name:"Raoping",       gri:"6780", role:"X", lat:23.70, lon:117.00, v:1 },
  { id:"cho",  name:"Chongzuo",      gri:"6780", role:"Y", lat:22.40, lon:107.40, v:0, note:"position to verify" },
  { id:"xua",  name:"Xuancheng",     gri:"8390", role:"M", lat:30.95, lon:118.76, v:1 },
  { id:"rao8", name:"Raoping",       gri:"8390", role:"X", lat:23.70, lon:117.00, v:1 },
  { id:"ron8", name:"Rongcheng",     gri:"8390", role:"Y", lat:37.20, lon:122.50, v:1 },
  { id:"ron7", name:"Rongcheng",     gri:"7430", role:"M", lat:37.20, lon:122.50, v:1 },
  { id:"pch7", name:"Pucheng",       gri:"7430", role:"X", lat:34.95, lon:109.60, v:1 },
  { id:"hel",  name:"Helong",        gri:"7430", role:"Y", lat:42.51, lon:129.40, v:1 },
  { id:"poh",  name:"Pohang",        gri:"9930", role:"M", lat:36.10, lon:129.40, v:1 },
  { id:"kwa",  name:"Kwang Ju",      gri:"9930", role:"W", lat:35.20, lon:126.80, v:1 },
  { id:"uss9", name:"Ussuriisk",     gri:"9930", role:"Z", lat:43.80, lon:132.20, v:1 },

  /* ── Saudi 8830 (active, monitored) ── */
  { id:"afi",  name:"Afif",          gri:"8830", role:"M", lat:23.94, lon:42.89,  v:1 },
  { id:"sal",  name:"Salwa",         gri:"8830", role:"W", lat:24.73, lon:50.73,  v:0, note:"position to verify" },
  { id:"ash",  name:"Ash Shaykh H.", gri:"8830", role:"Y", lat:28.02, lon:34.85,  v:0, note:"position to verify" },
  { id:"muw",  name:"Al Muwassam",   gri:"8830", role:"Z", lat:19.98, lon:41.72,  v:0, note:"position to verify" },

  /* ── US historical chains (off-air Feb 2010) ── */
  { id:"sen",  name:"Seneca",        gri:"9960", role:"M", lat:42.72, lon:-76.82, v:1, note:"historical NE US" },
  { id:"nan",  name:"Nantucket",     gri:"9960", role:"X", lat:41.28, lon:-70.10, v:1, note:"historical" },
  { id:"cbw",  name:"Carolina Beach",gri:"9960", role:"Y", lat:34.06, lon:-77.90, v:1, note:"historical; also 8290M (to verify)" },
  { id:"dan",  name:"Dana",          gri:"9960", role:"Z", lat:40.99, lon:-86.06, v:1, note:"historical; also 8970M" },
  { id:"bau",  name:"Baudette",      gri:"8970", role:"X", lat:48.61, lon:-94.53, v:1, note:"historical Great Lakes" },
  { id:"wil",  name:"Williams Lake", gri:"8970", role:"Y", lat:52.19, lon:-122.03,v:1, note:"historical Great Lakes" },
  { id:"boy",  name:"Boise City",    gri:"8970", role:"Z", lat:36.77, lon:-102.51,v:1, note:"historical Great Lakes; also 9610M (to verify)" },
  { id:"gil",  name:"Gilchrist",     gri:"9610", role:"X", lat:29.60, lon:-94.74, v:0, note:"historical South Central; GRI/role to verify" },
  { id:"mid",  name:"Middletown",    gri:"9940", role:"M", lat:38.78, lon:-122.49,v:1, note:"historical West Coast" },
  { id:"sea",  name:"Searchlight",   gri:"9940", role:"X", lat:35.32, lon:-114.81,v:1, note:"historical West Coast; role to verify" },
  { id:"geo",  name:"George",        gri:"5990", role:"N", lat:47.08, lon:-120.03,v:1, note:"monitored by DL0AO as 5990N; historic 9940" },
  { id:"fal",  name:"Fallon",        gri:"5990", role:"O", lat:39.57, lon:-118.83,v:1, note:"monitored by DL0AO as 5990O; historic 9940" },
  { id:"hav",  name:"Havre",         gri:"5990", role:"P", lat:48.55, lon:-109.72,v:1, note:"monitored by DL0AO as 5990P; historic 9940" },
  { id:"jup",  name:"Jupiter",       gri:"8290", role:"X", lat:27.03, lon:-80.20, v:1, note:"historical SE US; chain/role to verify" },
  { id:"car",  name:"Caribou",       gri:"5930", role:"M", lat:46.79, lon:-67.91, v:1, note:"historical Canadian East" },
  { id:"fox",  name:"Fox Harbor",    gri:"5930", role:"W", lat:52.37, lon:-55.44, v:1, note:"historical Canadian East; role to verify" },

  /* ── Alaska / Pacific historical ── */
  { id:"sp",   name:"Saint Paul",    gri:"8930", role:"M", lat:57.16, lon:-170.27,v:1, note:"historical North Pacific" },
  { id:"pcl",  name:"Port Clarence", gri:"8930", role:"W", lat:65.25, lon:-166.85,v:1, note:"historical" },
  { id:"tok",  name:"Tok",           gri:"8930", role:"X", lat:63.34, lon:-142.99,v:1, note:"historical" },
  { id:"nrc",  name:"Narrow Cape",   gri:"8930", role:"Y", lat:57.42, lon:-153.43,v:0, note:"Kodiak — historical; role to verify" },
  { id:"shc",  name:"Shoal Cove",    gri:"7960", role:"X", lat:55.42, lon:-131.35,v:0, note:"historical Gulf of Alaska; GRI/role to verify" },
  { id:"att",  name:"Attu",          gri:"?",    role:"M", lat:52.83, lon:173.18, v:0, note:"historical Aleutian; GRI to verify" },
  { id:"upl",  name:"Upolu Point",   gri:"9970", role:"M", lat:20.25, lon:-155.87,v:0, note:"historical Hawaii; role to verify" },
  { id:"kur",  name:"Kure",          gri:"9970", role:"X", lat:28.42, lon:-178.33,v:0, note:"historical Hawaii; role to verify" },

  /* ── Atlantic historical ── */
  { id:"sao",  name:"São Tomé",      gri:"?",    role:"M", lat:0.29,  lon:6.70,   v:0, note:"historical USCG transmitter (off-air ~1990s), shown on DF6NM map; NOT monitored; GRI to verify — delete this line if only active stations are wanted" }
];