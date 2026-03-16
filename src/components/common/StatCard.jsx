import React, { useState } from "react";
import { C, shadow, shadowMd } from "../../utils/constants";

export function StatCard({ label, value, icon, iconStyle }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:14, padding:"18px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:hov?shadowMd:shadow, transform:hov?"translateY(-1px)":"none", transition:"all .2s" }}>
      <div>
        <div style={{ fontSize:13, color:C.muted, fontWeight:500, marginBottom:6 }}>{label}</div>
        <div style={{ fontSize:22, fontWeight:800, color:C.text, letterSpacing:"-.5px" }}>{value}</div>
      </div>
      <div style={{ width:42, height:42, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, ...iconStyle }}>{icon}</div>
    </div>
  );
}
