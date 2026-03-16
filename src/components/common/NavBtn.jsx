import React, { useState } from "react";
import { C } from "../../utils/constants";

export function NavBtn({ onClick, children, title }) {
  const [hov, setHov] = useState(false);
  return (
    <div title={title} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ width:30, height:30, borderRadius:8, background:hov?C.accentLight:C.white, border:`1.5px solid ${hov?C.accent:C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:hov?C.accent:C.muted, transition:"all .18s", flexShrink:0 }}>
      {children}
    </div>
  );
}
