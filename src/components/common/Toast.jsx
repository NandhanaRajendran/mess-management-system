import React from "react";
import { C } from "../../utils/constants";

export function Toast({ show }) {
  return (
    <div style={{ position:"fixed", bottom:24, left:"50%", transform:`translateX(-50%) translateY(${show?0:80}px)`, background:C.white, border:`1.5px solid ${C.greenBorder}`, borderRadius:12, padding:"12px 20px", zIndex:400, transition:"transform .4s cubic-bezier(.4,0,.2,1)", display:"flex", alignItems:"center", gap:10, boxShadow:"0 8px 24px rgba(0,0,0,.1)", whiteSpace:"nowrap", maxWidth:"90vw" }}>
      <svg width="18" height="18" fill="none" stroke={C.green} strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span style={{ fontSize:13, fontWeight:700, color:C.green }}>Payment successful! Receipt sent to your email.</span>
    </div>
  );
}
