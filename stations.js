/* stations.js — Loran-C / Chayka world DB.
   Sources: DL0AO grabber track list (operational GRI/roles), Wikipedia chain
   tables, DF6NM LoranView world map, and the American Loran Consortium
   station table (https://www.alcpress.org/comm/loran/) for site existence
   (C = Loran-C, Y = Chayka). ALC lists no GRI/roles/coordinates: GRI/role
   stay from DL0AO where monitored, otherwise "to verify"; coordinates of
   non-monitored sites are town-level approximations (v:0).
   "historical" = off-air (US 2010, EU 2015 or earlier). The four NEW entries
   went on air 2026-09-10, after the current extract ends. */
"use strict";
window.LORAN_STATIONS = [
  /* ── monitoring site ── */
  { id:"gps",  name:"GPS control (ALS162 40pps)", gri:"-",   role:"R", lat:48.10, lon:11.58, v:1, note:"Control GPS receiver at the monitoring site" },

  /* ── NW Europe (historical, off-air 2015; sites ALC-confirmed) ── */
  { id:"ant_m",name:"Anthorn",       gri:"6731", role:"M", lat:54.91, lon:-3.27,  v:1, note:"off-air Dec 2015" },
  { id:"ant_y",name:"Anthorn (Y)",   gri:"6731", role:"Y", lat:54.91, lon:-3.27,  v:1, note:"second DL0AO track; chain assignment to verify" },
  { id:"les",  name:"Lessay",        gri:"7499", role:"X", lat:49.68, lon:-1.51,  v:1, note:"ALC-confirmed C site; GRI (7499/6731) to verify" },
  { id:"syl",  name:"Sylt (Rantum)", gri:"7499", role:"M", lat:54.83, lon:8.55,   v:1, note:"ALC-confirmed C site; GRI/role to verify" },
  { id:"sou",  name:"Soustons",      gri:"?",    role:"?", lat:43.75, lon:-1.35,  v:0, note:"France — ALC-confirmed C site; GRI/role to verify" },

  /* ── Norwegian Sea 7270 (historical; all sites ALC-confirmed) ── */
  { id:"eide", name:"Eiði",          gri:"7270", role:"M", lat:62.30, lon:-7.07,  v:1, note:"Faroe Islands — ALC-confirmed" },
  { id:"bo",   name:"Bø",            gri:"7270", role:"W", lat:58.94, lon:5.66,   v:1, note:"Norway — ALC-confirmed; role to verify" },
  { id:"jan",  name:"Jan Mayen",     gri:"7270", role:"X", lat:70.93, lon:-8.70,  v:1, note:"ALC-confirmed; role to verify" },
  { id:"vae",  name:"Værlandet",     gri:"7270", role:"Y", lat:61.58, lon:4.90,   v:1, note:"ALC-confirmed; role to verify" },
  { id:"ber",  name:"Berlevåg",      gri:"7270", role:"?", lat:70.86, lon:29.09,  v:0, note:"Norway — ALC-confirmed C site; chain/role to verify" },

  /* ── Mediterranean 7990 (historical; sites ALC-confirmed) ── */
  { id:"kar",  name:"Kargaburun",    gri:"7990", role:"M", lat:36.63, lon:36.35,  v:1, note:"Turkey — ALC-confirmed; GRI/role to verify" },
  { id:"est",  name:"Estartit",      gri:"7990", role:"X", lat:42.06, lon:3.22,   v:1, note:"Spain — ALC-confirmed; role to verify" },
  { id:"sel",  name:"Sellia Marina", gri:"7990", role:"Y", lat:39.10, lon:16.74,  v:1, note:"Italy — ALC-confirmed; role to verify" },
  { id:"lam",  name:"Lampedusa",     gri:"7990", role:"Z", lat:35.51, lon:12.58,  v:1, note:"Italy — ALC-confirmed; role to verify" },
  { id:"esv",  name:"Estaca de Vares", gri:"?",  role:"?", lat:43.78, lon:-7.69,  v:0, note:"Spain — ALC-confirmed C site; chain/role to verify" },

  /* ── Iceland / Greenland (historical) ── */
  { id:"hel",  name:"Hellissandu",   gri:"?",    role:"?", lat:64.87, lon:-23.93, v:0, note:"Iceland — ALC-confirmed C site; GRI/role to verify" },
  { id:"ang",  name:"Angissoq",      gri:"?",    role:"?", lat:60.53, lon:-45.40, v:0, note:"Greenland — ALC-confirmed C site; GRI/role to verify" },

  /* ── Russian Chayka (active, monitored by DL0AO) ── */
  { id:"bry",  name:"Bryansk",       gri:"8000", role:"M", lat:53.06, lon:34.42,  v:1, note:"ALC: 'Ryasniki, Bryansk Oblast' site" },
  { id:"pet",  name:"Petrozavodsk",  gri:"8000", role:"W", lat:61.79, lon:34.36,  v:1 },
  { id:"slo",  name:"Slonim",        gri:"8000", role:"X", lat:53.09, lon:25.33,  v:1 },
  { id:"sim",  name:"Simferopol",    gri:"8000", role:"Y", lat:44.77, lon:33.88,  v:1 },
  { id:"syz",  name:"Syzran",        gri:"8000", role:"Z", lat:53.15, lon:46.60,  v:1 },
  { id:"int",  name:"Inta",          gri:"5960", role:"M", lat:66.03, lon:60.27,  v:1 },
  { id:"tum",  name:"Tumanny Pen",   gri:"5960", role:"X", lat:68.90, lon:35.20,  v:1 },
  { id:"nor",  name:"Norilsk",       gri:"5960", role:"Z", lat:69.38, lon:88.15,  v:1, note:"ALC lists 'Dudinka' (Norilsk port) nearby — likely same site" },

  /* ── other ALC-listed Chayka sites (not monitored; GRI/role unknown) ── */
  { id:"dud",  name:"Dudinka",       gri:"?",    role:"?", lat:69.36, lon:86.19,  v:0, note:"ALC Chayka site; may be the DL0AO 'Norilsk' 5960Z site" },
  { id:"tay",  name:"Taymylyr",      gri:"?",    role:"?", lat:71.50, lon:86.40,  v:0, note:"ALC Chayka site (Taymyr); position approx" },
  { id:"kur",  name:"Kurgan",        gri:"?",    role:"?", lat:55.44, lon:65.33,  v:0, note:"ALC Chayka site" },
  { id:"okh",  name:"Okhotsk",       gri:"?",    role:"?", lat:59.36, lon:143.20, v:0, note:"ALC Chayka site" },
  { id:"pan",  name:"Pankratiev Island", gri:"?", role:"?", lat:73.80, lon:124.60, v:0, note:"ALC Chayka site; position approx" },
  { id:"karc", name:"Karachev",      gri:"?",    role:"?", lat:53.13, lon:36.13,  v:0, note:"ALC Chayka site (Bryansk Oblast); possibly old Bryansk site" },

  /* ── new 2026 chains (after the extract; sites ALC-known as Chayka) ── */
  { id:"yum",  name:"Yuzhno-Uralsk", gri:"5970", role:"M", lat:54.50, lon:61.50,  v:0, note:"NEW — on air 2026-09-10, no data in extract; ALC-confirmed Chayka site" },
  { id:"yek",  name:"Yekaterinburg", gri:"5970", role:"X", lat:56.60, lon:61.00,  v:0, note:"NEW — on air 2026-09-10; ALC-confirmed Chayka site, position approx" },
  { id:"ors",  name:"Orsk",          gri:"5970", role:"Z", lat:51.00, lon:58.50,  v:0, note:"NEW — on air 2026-09-10; not in ALC list" },
  { id:"nag",  name:"Nagqu",         gri:"6250", role:"M", lat:31.48, lon:92.06,  v:0, note:"NEW — on air 2026-09-10; not in ALC list" },

  /* ── East Asia (active, monitored) ── */
  { id:"pch6", name:"Pucheng",       gri:"6000", role:"M", lat:34.95, lon:109.60, v:1, note:"not in ALC list — DL0AO operational evidence" },
  { id:"hex",  name:"Hexian",        gri:"6780", role:"M", lat:24.48, lon:111.35, v:1, note:"ALC-confirmed C site" },
  { id:"rao6", name:"Raoping",       gri:"6780", role:"X", lat:23.70, lon:117.00, v:1, note:"ALC-confirmed" },
  { id:"cho",  name:"Chongzuo",      gri:"6780", role:"Y", lat:22.40, lon:107.40, v:1, note:"ALC-confirmed C site; position approx" },
  { id:"xua",  name:"Xuancheng",     gri:"8390", role:"M", lat:30.95, lon:118.76, v:1, note:"ALC-confirmed" },
  { id:"rao8", name:"Raoping",       gri:"8390", role:"X", lat:23.70, lon:117.00, v:1, note:"ALC-confirmed" },
  { id:"ron8", name:"Rongcheng",     gri:"8390", role:"Y", lat:37.20, lon:122.50, v:1, note:"ALC-confirmed" },
  { id:"ron7", name:"Rongcheng",     gri:"7430", role:"M", lat:37.20, lon:122.50, v:1, note:"ALC-confirmed" },
  { id:"pch7", name:"Pucheng",       gri:"7430", role:"X", lat:34.95, lon:109.60, v:1, note:"not in ALC list — DL0AO operational evidence" },
  { id:"hel",  name:"Helong",        gri:"7430", role:"Y", lat:42.51, lon:129.40, v:1, note:"ALC-confirmed" },
  { id:"poh",  name:"Pohang",        gri:"9930", role:"M", lat:36.10, lon:129.40, v:1, note:"ALC-confirmed" },
  { id:"kwa",  name:"Kwang Ju",      gri:"9930", role:"W", lat:35.20, lon:126.80, v:1, note:"ALC-confirmed" },
  { id:"uss9", name:"Ussuriisk",     gri:"9930", role:"Z", lat:43.80, lon:132.20, v:1, note:"ALC-confirmed" },

  /* ── Japan / West Pacific (historical C sites, ALC-confirmed) ── */
  { id:"ges",  name:"Gesashi",       gri:"9930", role:"X", lat:26.73, lon:128.29, v:0, note:"Okinawa — historical; former 9930 master (pre-Pohang); role/GRI to verify" },
  { id:"tok",  name:"Tokachibuto",   gri:"?",    role:"?", lat:42.72, lon:143.50, v:0, note:"Hokkaido — ALC lists C and Y; GRI/role to verify" },
  { id:"nii",  name:"Niijima",       gri:"?",    role:"?", lat:34.37, lon:139.27, v:0, note:"Japan — ALC-confirmed C site; GRI/role to verify" },
  { id:"min",  name:"Minami-Tori-shima", gri:"?", role:"?", lat:24.28, lon:153.98, v:0, note:"Marcus I. — ALC-confirmed C site; GRI/role to verify" },
  { id:"yap",  name:"Yap",           gri:"?",    role:"?", lat:9.55,  lon:138.18, v:0, note:"Micronesia — ALC-confirmed C site; GRI/role to verify" },
  { id:"bar",  name:"Barrigada",     gri:"?",    role:"?", lat:13.46, lon:144.82, v:0, note:"Guam — ALC-confirmed C site; GRI/role to verify" },

  /* ── Saudi 8830 (active, monitored; 2 extra ALC sites) ── */
  { id:"afi",  name:"Afif",          gri:"8830", role:"M", lat:23.94, lon:42.89,  v:1, note:"ALC-confirmed" },
  { id:"sal",  name:"Salwa",         gri:"8830", role:"W", lat:24.73, lon:50.73,  v:0, note:"ALC-confirmed site; position approx" },
  { id:"ash",  name:"Ash Shaykh H.", gri:"8830", role:"Y", lat:28.02, lon:34.85,  v:0, note:"ALC-confirmed site; position approx" },
  { id:"muw",  name:"Al Muwassam",   gri:"8830", role:"Z", lat:19.98, lon:41.72,  v:0, note:"ALC-confirmed site; position approx" },
  { id:"kha",  name:"Al Khamasin",   gri:"?",    role:"?", lat:19.90, lon:44.10,  v:0, note:"ALC-confirmed C site (extra, not monitored); position approx" },
  { id:"aru",  name:"Ar Ruqi",       gri:"?",    role:"?", lat:31.70, lon:38.60,  v:0, note:"ALC-confirmed C site (extra, not monitored); position approx" },

  /* ── North America — historical chains (off-air 2010) ── */
  { id:"sen",  name:"Seneca",        gri:"9960", role:"M", lat:42.72, lon:-76.82, v:1, note:"historical NE US" },
  { id:"nan",  name:"Nantucket",     gri:"9960", role:"X", lat:41.28, lon:-70.10, v:1, note:"historical" },
  { id:"cbw",  name:"Carolina Beach",gri:"9960", role:"Y", lat:34.06, lon:-77.90, v:1, note:"historical; also 8290M (to verify)" },
  { id:"dan",  name:"Dana",          gri:"9960", role:"Z", lat:40.99, lon:-86.06, v:1, note:"historical; also 8970M" },
  { id:"bau",  name:"Baudette",      gri:"8970", role:"X", lat:48.61, lon:-94.53, v:1, note:"historical Great Lakes" },
  { id:"wil",  name:"Williams Lake", gri:"8970", role:"Y", lat:52.19, lon:-122.03,v:1, note:"historical Great Lakes; also 5990 Canadian West Coast" },
  { id:"boy",  name:"Boise City",    gri:"8970", role:"Z", lat:36.77, lon:-102.51,v:1, note:"historical Great Lakes; also 9610M (to verify)" },
  { id:"gil",  name:"Gilchrist",     gri:"9610", role:"X", lat:29.60, lon:-94.74, v:0, note:"historical South Central; GRI/role to verify" },
  { id:"mid",  name:"Middletown",    gri:"9940", role:"M", lat:38.78, lon:-122.49,v:1, note:"historical West Coast" },
  { id:"sea",  name:"Searchlight",   gri:"9940", role:"X", lat:35.32, lon:-114.81,v:1, note:"historical West Coast; role to verify" },
  { id:"geo",  name:"George",        gri:"5990", role:"N", lat:47.08, lon:-120.03,v:1, note:"monitored by DL0AO as 5990N; historic 9940" },
  { id:"fal",  name:"Fallon",        gri:"5990", role:"O", lat:39.57, lon:-118.83,v:1, note:"monitored by DL0AO as 5990O; historic 9940" },
  { id:"hav",  name:"Havre",         gri:"5990", role:"P", lat:48.55, lon:-109.72,v:1, note:"monitored by DL0AO as 5990P; historic 9940" },
  { id:"jup",  name:"Jupiter",       gri:"8290", role:"X", lat:27.03, lon:-80.20, v:1, note:"historical SE US; chain/role to verify" },
  { id:"car",  name:"Caribou",       gri:"5930", role:"M", lat:46.79, lon:-67.91, v:1, note:"historical Canadian East" },
  { id:"fox",  name:"Fox Harbour",   gri:"5930", role:"W", lat:52.37, lon:-55.44, v:1, note:"historical Canadian East; ALC-confirmed" },
  { id:"cra",  name:"Cape Race",     gri:"5930", role:"X", lat:46.66, lon:-53.07, v:0, note:"Newfoundland — ALC-confirmed C; role to verify" },
  { id:"com",  name:"Comfort Cove",  gri:"5930", role:"Y", lat:49.40, lon:-54.85, v:0, note:"Newfoundland — ALC-confirmed C; role to verify" },
  { id:"phd",  name:"Port Hardy",    gri:"5990", role:"X", lat:50.72, lon:-127.49,v:0, note:"BC — ALC-confirmed C (5990 Canadian West Coast); role to verify" },
  { id:"spr",  name:"Spring Island", gri:"5990", role:"Y", lat:49.72, lon:-127.60,v:0, note:"BC — ALC-confirmed C; role to verify; position approx" },

  /* ── Alaska / Pacific historical ── */
  { id:"sp",   name:"Saint Paul",    gri:"8930", role:"M", lat:57.16, lon:-170.27,v:1, note:"historical North Pacific" },
  { id:"pcl",  name:"Port Clarence", gri:"8930", role:"W", lat:65.25, lon:-166.85,v:1, note:"historical" },
  { id:"tok",  name:"Tok",           gri:"8930", role:"X", lat:63.34, lon:-142.99,v:1, note:"historical" },
  { id:"nrc",  name:"Narrow Cape",   gri:"8930", role:"Y", lat:57.42, lon:-153.43,v:1, note:"Kodiak — ALC-confirmed C site" },
  { id:"shc",  name:"Shoal Cove",    gri:"7960", role:"X", lat:55.42, lon:-131.35,v:1, note:"ALC-confirmed C site; GRI/role to verify" },
  { id:"att",  name:"Attu",          gri:"?",    role:"M", lat:52.83, lon:173.18, v:1, note:"ALC-confirmed C site; GRI/role to verify" },
  { id:"upl",  name:"Upolu Point",   gri:"9970", role:"M", lat:20.25, lon:-155.87,v:1, note:"Hawaii — ALC-confirmed C site; role to verify" },
  { id:"kur",  name:"Kure",          gri:"9970", role:"X", lat:28.42, lon:-178.33,v:0, note:"NOT in ALC list — verify existence" },

  /* ── India (historical C chain, ALC-confirmed; GRI unknown) ── */
  { id:"bal",  name:"Balasore",      gri:"?",    role:"?", lat:21.49, lon:86.93,  v:0, note:"India — ALC-confirmed C site" },
  { id:"bil",  name:"Bilimora",      gri:"?",    role:"?", lat:20.76, lon:72.96,  v:0, note:"India — ALC-confirmed C site" },
  { id:"dhr",  name:"Dhrangadhra",   gri:"?",    role:"?", lat:22.99, lon:71.46,  v:0, note:"India — ALC-confirmed C site" },
  { id:"dia",  name:"Diamond Harbor",gri:"?",    role:"?", lat:22.19, lon:88.19,  v:0, note:"India — ALC-confirmed C site" },
  { id:"pat",  name:"Patapur",       gri:"?",    role:"?", lat:19.80, lon:85.20,  v:0, note:"India — ALC-confirmed C site; position approx" },
  { id:"ver",  name:"Veraval",       gri:"?",    role:"?", lat:20.90, lon:70.37,  v:0, note:"India — ALC-confirmed C site" }
];
