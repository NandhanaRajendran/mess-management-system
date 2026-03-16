import React, { useState } from "react";
import { C, HOSTEL_STATUS_CFG, MONTHS_LONG, shadow } from "../../utils/constants";
import { genAttendance } from "../../utils/helpers";
import { useWindowWidth } from "../../hooks/useWindowWidth";
import { ChevLeft, ChevRight } from "../icons";
import { NavBtn } from "../common/NavBtn";

export function HostelSection() {
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(2); 
  const w = useWindowWidth();
  const isMobile = w < 600;
  const isSmall = w < 480;

  const changeMonth = (dir) => {
    setMonth(m => {
      const nm = m + dir;
      if (nm > 11) { setYear(y => y + 1); return 0; }
      if (nm < 0) { setYear(y => y - 1); return 11; }
      return nm;
    });
  };

  const data = genAttendance(year, month);
  const days = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const vals = Object.values(data);

  const counts = {
    present: vals.filter(v => v === "present").length,
    messcut: vals.filter(v => v === "messcut").length,
    absent:  vals.filter(v => v === "absent").length,
    "absent-messcut": vals.filter(v => v === "absent-messcut").length,
    leave:   vals.filter(v => v === "leave").length,
  };
  const pct = Math.round(counts.present / days * 100);

  const today = new Date();

  const attStats = [
    { label:"Present",        val:counts.present,          color:C.green },
    { label:"Mess Cut",       val:counts.messcut,           color:C.accent },
    { label:"Absent",         val:counts.absent,            color:C.red },
    { label:"Absent+Mess Cut",val:counts["absent-messcut"], color:"#be123c" },
    { label:"Leave",          val:counts.leave,             color:C.gold },
    { label:"Attendance %",   val:`${pct}%`,                color:C.accent2 },
  ];

  return (
    <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ fontSize:17, fontWeight:800 }}>Hostel Attendance</div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <NavBtn onClick={() => changeMonth(-1)} title="Previous month"><ChevLeft /></NavBtn>
          <div style={{ padding:"6px 16px", borderRadius:8, background:C.white, border:`1.5px solid ${C.border}`, fontSize:13.5, fontWeight:700, minWidth:isMobile?120:145, textAlign:"center" }}>
            {MONTHS_LONG[month]} {year}
          </div>
          <NavBtn onClick={() => changeMonth(1)} title="Next month"><ChevRight /></NavBtn>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:isSmall?"1fr 1fr":isMobile?"repeat(3,1fr)":"repeat(6,1fr)", gap:10 }}>
        {attStats.map(s => (
          <div key={s.label} style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"14px 12px", textAlign:"center", boxShadow:shadow }}>
            <div style={{ fontSize:isSmall?22:26, fontWeight:800, color:s.color, lineHeight:1, marginBottom:4 }}>{s.val}</div>
            <div style={{ fontSize:10.5, color:C.muted, fontWeight:500, lineHeight:1.3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:14, padding:isMobile?16:22, boxShadow:shadow }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:isMobile?3:5, marginBottom:6 }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} style={{ textAlign:"center", fontSize:isMobile?10:11, fontWeight:700, color:C.muted, padding:4, textTransform:"uppercase" }}>{d}</div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:isMobile?3:5 }}>
          {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length:days }, (_,i) => i+1).map(d => {
            const st = data[d] || "present";
            const cfg = HOSTEL_STATUS_CFG[st];
            const isToday = today.getFullYear()===year && today.getMonth()===month && today.getDate()===d;
            return (
              <div key={d} title={cfg.label}
                style={{ aspectRatio:1, borderRadius:isMobile?6:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:isMobile?11:12.5, fontWeight:700, background:cfg.bg, color:cfg.color, border:`1.5px solid ${cfg.border}`, boxShadow:isToday?`0 0 0 2.5px ${C.accent}`:"none", cursor:"default" }}>
                {d}
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:isMobile?8:14, flexWrap:"wrap", marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
          {Object.entries(HOSTEL_STATUS_CFG).map(([k, cfg]) => (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11.5, color:C.muted, fontWeight:500 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:cfg.dot, flexShrink:0 }} />
              {cfg.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
