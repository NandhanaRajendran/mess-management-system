import React, { useState } from "react";
import { C } from "../../utils/constants";
import { useWindowWidth } from "../../hooks/useWindowWidth";
import { XIcon } from "../icons";

export function PaymentModal({ modalData, onClose, onConfirm }) {
  const [method, setMethod] = useState(0);
  const [hovConfirm, setHovConfirm] = useState(false);
  const w = useWindowWidth();
  if (!modalData) return null;
  const methods = [
    { icon:"📱", label:"UPI / QR" }, { icon:"🏦", label:"Net Banking" },
    { icon:"💳", label:"Debit / Credit" }, { icon:"👛", label:"Wallet" },
  ];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.45)", backdropFilter:"blur(3px)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:20, padding:w<480?22:30, width:"100%", maxWidth:420, boxShadow:"0 20px 60px rgba(37,99,235,.18)", position:"relative", animation:"fadeUp .28s ease" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:14, width:30, height:30, borderRadius:8, background:C.bg, border:`1.5px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:C.muted }}>
          <XIcon />
        </button>
        <div style={{ fontSize:16, fontWeight:800, marginBottom:3, paddingRight:32 }}>{modalData.title}</div>
        <div style={{ fontSize:12.5, color:C.muted, marginBottom:18 }}>{modalData.sub}</div>
        <div style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:11, padding:"14px 16px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, color:C.muted, fontWeight:600 }}>Amount Due</span>
          <span style={{ fontSize:22, fontWeight:800, color:C.accent }}>{modalData.amount}</span>
        </div>
        <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:".6px", marginBottom:10 }}>Select Payment Method</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
          {methods.map((m,i) => (
            <div key={m.label} onClick={() => setMethod(i)}
              style={{ background:method===i?C.accentLight:C.bg, border:`2px solid ${method===i?C.accent:C.border}`, borderRadius:10, padding:"10px 8px", textAlign:"center", cursor:"pointer", fontSize:12.5, fontWeight:600, color:method===i?C.accent:C.text2, transition:"all .18s" }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{m.icon}</div>{m.label}
            </div>
          ))}
        </div>
        <button
          onMouseEnter={() => setHovConfirm(true)} onMouseLeave={() => setHovConfirm(false)}
          onClick={onConfirm}
          style={{ width:"100%", padding:12, borderRadius:11, border:"none", background:`linear-gradient(135deg,${C.accent},${C.accent2})`, color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit", transform:hovConfirm?"translateY(-1px)":"none", boxShadow:hovConfirm?`0 6px 20px rgba(37,99,235,.38)`:`0 4px 14px rgba(37,99,235,.28)`, transition:"all .2s" }}>
          Confirm Payment →
        </button>
      </div>
    </div>
  );
}
