import React from "react";
import { C } from "../../utils/constants";
import { useWindowWidth } from "../../hooks/useWindowWidth";
import { XIcon } from "../icons";

export function ProfileDrawer({ open, onClose }) {
  const w = useWindowWidth();
  const drawerW = w < 480 ? "100vw" : "360px";
  const details = [
    ["Department","Computer Science"],["Course","B.Tech CSE"],
    ["Semester","4th Semester"],["Batch","2022 – 2026"],
  ];
  const fullDetails = [
    ["Email","tiyana.kk@unipay.edu"],
    ["Hostel","Block B – Room 204"],
    ["Phone","+91 98765 43210"],
  ];
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.4)", backdropFilter:"blur(2px)", zIndex:200, opacity:open?1:0, pointerEvents:open?"all":"none", transition:"opacity .3s" }} />
      <div style={{ position:"fixed", top:0, right:open?0:-400, width:drawerW, height:"100vh", background:C.white, borderLeft:`1.5px solid ${C.border}`, zIndex:201, transition:"right .32s cubic-bezier(.4,0,.2,1)", overflowY:"auto", padding:24, display:"flex", flexDirection:"column", gap:16, boxShadow:"-8px 0 32px rgba(37,99,235,.1)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:12, fontWeight:700, color:C.accent, textTransform:"uppercase", letterSpacing:".8px" }}>Student Profile</span>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:C.bg, border:`1.5px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:C.muted }}>
            <XIcon />
          </button>
        </div>
        <div style={{ width:64, height:64, borderRadius:14, background:`linear-gradient(135deg,${C.accent},${C.accent2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:"#fff", margin:"0 auto", boxShadow:"0 6px 18px rgba(37,99,235,.25)" }}>TK</div>
        <div style={{ textAlign:"center", fontSize:17, fontWeight:800 }}>TIYANA K K</div>
        <div style={{ textAlign:"center", fontSize:12, color:C.muted, fontWeight:500 }}>Admission No: ZXX2024CS001</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
          {details.map(([l,v]) => (
            <div key={l} style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:10, padding:"11px 13px" }}>
              <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".6px", marginBottom:3 }}>{l}</div>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{v}</div>
            </div>
          ))}
          {fullDetails.map(([l,v]) => (
            <div key={l} style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:10, padding:"11px 13px", gridColumn:"1/-1" }}>
              <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".6px", marginBottom:3 }}>{l}</div>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{v}</div>
            </div>
          ))}
          <div style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:10, padding:"11px 13px", gridColumn:"1/-1" }}>
            <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".6px", marginBottom:3 }}>Status</div>
            <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:C.greenBg, color:C.green, border:`1px solid ${C.greenBorder}`, fontSize:12, fontWeight:600 }}>● Active</span>
          </div>
        </div>
      </div>
    </>
  );
}
