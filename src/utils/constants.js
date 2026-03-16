export const C = {
  bg: "#f0f6ff", white: "#ffffff", border: "#d1e3f8", border2: "#bdd5f5",
  accent: "#2563eb", accentLight: "#eff6ff", accent2: "#0ea5e9", accentHover: "#1d4ed8",
  green: "#16a34a", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
  gold: "#d97706", goldBg: "#fffbeb", goldBorder: "#fde68a",
  red: "#dc2626", redBg: "#fef2f2", redBorder: "#fecaca", orange: "#ea580c",
  purple: "#7c3aed", purpleBg: "#f5f3ff", purpleBorder: "#ddd6fe",
  violet: "#9333ea", violetBg: "#fdf4ff", violetBorder: "#e9d5ff",
  teal: "#059669", tealBg: "#ecfdf5", tealBorder: "#a7f3d0",
  text: "#0f172a", text2: "#334155", muted: "#64748b", muted2: "#94a3b8",
};

export const shadow = `0 1px 3px rgba(37,99,235,.07), 0 4px 14px rgba(37,99,235,.05)`;
export const shadowMd = `0 4px 16px rgba(37,99,235,.13), 0 1px 4px rgba(0,0,0,.05)`;

export const HOSTEL_SEQ = [
  "present", "present", "messcut", "absent", "absent-messcut",
  "present", "leave",   "present", "messcut","present",
  "present", "absent",  "present", "present","messcut",
];

export const HOSTEL_STATUS_CFG = {
  present:        { label: "Present",        bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", dot: "#16a34a" },
  messcut:        { label: "Mess Cut",        bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", dot: "#2563eb" },
  absent:         { label: "Absent",          bg: "#fef2f2", color: "#dc2626", border: "#fecaca", dot: "#dc2626" },
  "absent-messcut":{ label: "Absent+Mess Cut",bg: "#fff1f2", color: "#be123c", border: "#fecdd3", dot: "#be123c" },
  leave:          { label: "Leave",           bg: "#fffbeb", color: "#d97706", border: "#fde68a", dot: "#d97706" },
};

export const INITIAL_FEES = [
  { id:"FEE001", type:"Tuition Fee - Semester 1", cat:"Academic", amt:25000, pub:"15/01/2024", due:"28/02/2024", status:"paid",    paidDate:"20/02/2024", month:"Jan 2024" },
  { id:"FEE002", type:"Library Fee",              cat:"Library",  amt:1500,  pub:"15/01/2024", due:"28/02/2024", status:"paid",    paidDate:"20/02/2024", month:"Jan 2024" },
  { id:"FEE003", type:"Sports Fee - PTA",         cat:"PTA",      amt:2000,  pub:"15/01/2024", due:"28/02/2024", status:"paid",    paidDate:"25/02/2024", month:"Jan 2024" },
  { id:"FEE004", type:"Examination Fee",          cat:"Academic", amt:3500,  pub:"01/03/2024", due:"31/03/2024", status:"notpaid", paidDate:"-",          month:"Mar 2024" },
  { id:"FEE005", type:"Hostel Fee - Q1",          cat:"Hostel",   amt:4500,  pub:"01/03/2024", due:"15/03/2024", status:"notpaid", paidDate:"-",          month:"Mar 2024" },
  { id:"FEE006", type:"Sports Fee - Annual",      cat:"Sports",   amt:800,   pub:"01/09/2024", due:"30/09/2024", status:"notpaid", paidDate:"-",          month:"Sep 2024" },
];

export const CAT_STYLE = {
  Academic: { bg: C.accentLight,  color: C.accent,  border: "#bfdbfe" },
  Library:  { bg: C.purpleBg,     color: C.purple,  border: C.purpleBorder },
  PTA:      { bg: C.violetBg,     color: C.violet,  border: C.violetBorder },
  Hostel:   { bg: C.tealBg,       color: C.teal,    border: C.tealBorder },
  Sports:   { bg: "#fff7ed",      color: C.orange,  border: "#fed7aa" },
};

export const MONTHS_LONG = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
