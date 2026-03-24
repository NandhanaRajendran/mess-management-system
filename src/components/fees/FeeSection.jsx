import React, { useState, useMemo } from "react";

const styleTag = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

/* ── colour tokens (inline so no external dep needed) ── */
const C = {
  white: "#fff", bg: "#f8fafc", border: "#e2e8f0", border2: "#cbd5e1",
  text: "#0f172a", text2: "#475569", muted: "#64748b", muted2: "#94a3b8",
  accent: "#2563eb", accent2: "#1d4ed8", accentLight: "#eff6ff",
  green: "#16a34a", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
  gold: "#d97706", goldBg: "#fffbeb", goldBorder: "#fde68a",
  red: "#dc2626", redBg: "#fef2f2", redBorder: "#fecaca",
  orange: "#ea580c",
  tooltipBg: "rgba(15,23,42,.92)",
};

const CAT_STYLE = {
  Academic:  { bg:"#eff6ff", color:"#1d4ed8", border:"#bfdbfe" },
  Hostel:    { bg:"#f0fdf4", color:"#166534", border:"#bbf7d0" },
  Library:   { bg:"#fdf4ff", color:"#7e22ce", border:"#e9d5ff" },
  Sports:    { bg:"#fff7ed", color:"#c2410c", border:"#fed7aa" },
  PTA:       { bg:"#ecfeff", color:"#0e7490", border:"#a5f3fc" },
  Transport: { bg:"#f0fdf4", color:"#15803d", border:"#bbf7d0" },
};

/* ── helper to determine real status from fee object ── */
function resolveStatus(f) {
  if (f.status === "paid") return "paid";
  if (f.status === "pending_verification") return "pending_verification";
  if (f.status === "overdue") return "overdue";
  return f.status || "notpaid";
}

function fmtCurrency(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

/* ── build month pill list from fee array ── */
function buildMonthPills(fees) {
  const monthSet = new Set(fees.map(f => f.month));
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const years = [...new Set(
    fees.map(f => f.month).filter(m => m && m.includes(" ")).map(m => m.split(" ")[1])
  )].sort();
  const pills = [{ label: "All", val: "all" }];
  if (years.length === 0) {
    [...monthSet].forEach(m => { if (m) pills.push({ label: m, val: m }); });
    return pills;
  }
  years.forEach(yr => {
    MONTHS.forEach(mo => {
      const val = `${mo} ${yr}`;
      pills.push({ label: val, val, empty: !monthSet.has(val) });
    });
  });
  return pills;
}

/* ── sub-components ── */
function StatusBadge({ status }) {
  const cfg = {
    paid:                 { bg: C.greenBg, color: C.green,  border: C.greenBorder, label: "✓ Paid" },
    notpaid:              { bg: C.goldBg,  color: C.gold,   border: C.goldBorder,  label: "⏱ Due" },
    overdue:              { bg: C.redBg,   color: C.red,    border: C.redBorder,   label: "⚠ Overdue" },
    pending_verification: { bg: C.orange+"22", color: C.orange, border: C.orange+"44", label: "⏳ Verifying" },
  }[status] || { bg: C.goldBg, color: C.gold, border: C.goldBorder, label: "—" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px",
      borderRadius:20, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`,
      fontSize:11.5, fontWeight:700, whiteSpace:"nowrap" }}>
      {cfg.label}
    </span>
  );
}

function CatPill({ cat }) {
  const s = CAT_STYLE[cat] || CAT_STYLE.Academic;
  return (
    <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11,
      fontWeight:600, background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:"nowrap" }}>
      {cat}
    </span>
  );
}

function PayNowBtn({ overdue, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{ padding:"7px 16px", borderRadius:8, border:"none", fontFamily:"inherit",
        background: overdue ? `linear-gradient(135deg,${C.red},${C.orange})` : C.accent,
        color:"#fff", fontWeight:700, fontSize:12.5, cursor:"pointer",
        transform: hov ? "scale(1.04)" : "none",
        boxShadow: hov ? (overdue?"0 4px 12px rgba(220,38,38,.3)":"0 4px 12px rgba(37,99,235,.3)") : "none",
        transition:"all .18s", whiteSpace:"nowrap" }}>
      Pay Now
    </button>
  );
}

function MonthFilterPill({ pill, selected, feeStatus, onClick }) {
  const [hov, setHov] = useState(false);
  const { val, label } = pill;
  const DOT = { overdue:"#dc2626", notpaid:"#d97706", pending_verification:"#ea580c", paid:"#16a34a" };
  let bg = C.bg, color = C.muted, border = C.border;
  if (selected) { bg = C.accent; color = "#fff"; border = C.accent; }
  else if (hov && val !== "all") { bg = C.accentLight; color = C.accent; border = C.accent; }
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ position:"relative", padding:"6px 14px", borderRadius:20, fontSize:11.5,
        fontWeight:600, cursor:"pointer", border:`1.5px solid ${border}`, background:bg, color,
        transition:"all .18s", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6 }}>
      {label}
      {feeStatus && val !== "all" && (
        <span style={{ width:7, height:7, borderRadius:"50%", background: DOT[feeStatus] || "transparent", flexShrink:0 }} />
      )}
    </div>
  );
}

/* ── open receipt helper ── */
function openReceipt(receiptUrl) {
  if (!receiptUrl) return;
  if (receiptUrl.startsWith('data:')) {
    // base64 — convert to blob and open
    const [header, base64] = receiptUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const bytes = atob(base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: mime });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } else {
    window.open(receiptUrl, '_blank');
  }
}

/* ── desktop table ── */
function FeeTableDesktop({ rows, onPayNow }) {
  const th = { padding:"12px 14px", textAlign:"left", fontSize:11, fontWeight:700,
    color:C.muted, textTransform:"uppercase", letterSpacing:".6px", whiteSpace:"nowrap", background:C.bg };
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:750 }}>
        <thead>
          <tr style={{ borderBottom:`1.5px solid ${C.border}` }}>
            {["Fee Type","Category","Amount","Published Date","Due Date","Status","Paid Date","Action"].map(h => (
              <th key={h} style={th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={8} style={{ padding:"32px 14px", textAlign:"center", color:C.muted, fontSize:13 }}>No fees found for selected period.</td></tr>
            : rows.map((f, i) => <FeeRowDesktop key={f.id} f={f} isLast={i===rows.length-1} onPayNow={onPayNow} />)
          }
        </tbody>
      </table>
    </div>
  );
}

function FeeRowDesktop({ f, isLast, onPayNow }) {
  const [hov, setHov] = useState(false);
  const st = resolveStatus(f);
  const td = { padding:"13px 14px", verticalAlign:"middle", borderBottom:isLast?"none":`1px solid ${C.border}` };
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:hov?C.bg:C.white, transition:"background .15s" }}>
      <td style={td}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <span style={{ fontWeight:700, fontSize:13.5, color:C.text, cursor: f.remark ? "help" : "default" }}>
            {f.type}
          </span>
          {f.remark && hov && (
            <div style={{
              position: "absolute", bottom: "100%", left: "0", marginBottom: 8,
              background: C.tooltipBg, color: "#fff", padding: "6px 12px", borderRadius: 8,
              fontSize: 11, fontWeight: 500, width: "max-content", maxWidth: 200,
              boxShadow: "0 4px 12px rgba(0,0,0,.15)", zIndex: 50, pointerEvents: "none",
              animation: "fadeIn .2s ease"
            }}>
              <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 10, color: C.accent }}>HOD REMARK:</div>
              {f.remark}
            </div>
          )}
        </div>
      </td>
      <td style={td}><CatPill cat={f.cat} /></td>
      <td style={td}><span style={{ fontSize:14, fontWeight:800, color:C.text }}>{fmtCurrency(f.amt)}</span></td>
      <td style={td}><span style={{ fontSize:12.5, color:C.text2, fontWeight:500 }}>{f.pub}</span></td>
      <td style={td}><span style={{ fontSize:12.5, color:st!=="paid"?C.red:C.text2, fontWeight:st!=="paid"?600:500 }}>{f.due}</span></td>
      <td style={td}><StatusBadge status={st} /></td>
      <td style={td}><span style={{ fontSize:12.5, color:C.text2 }}>{f.paidDate || "—"}</span></td>
      <td style={td}>
        {st === "paid"
          ? <span style={{ fontSize:12, color:C.muted2 }}>—</span>
          : st === "pending_verification"
            ? <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <span style={{ fontSize:12, color:C.muted2, fontWeight:600 }}>Waiting for verification from authority</span>
                {f.receiptUrl && (
                  <button onClick={() => openReceipt(f.receiptUrl)}
                    style={{ background:"none", border:"none", padding:0, cursor:"pointer",
                      fontSize:11, color:C.accent, textDecoration:"underline", textAlign:"left" }}>
                    View Receipt ↗
                  </button>
                )}
              </div>
            : <PayNowBtn overdue={st==="overdue"} onClick={() => onPayNow(f.id)} />
        }
      </td>
    </tr>
  );
}

/* ── mobile card ── */
function FeeCardMobile({ f, onPayNow }) {
  const st = resolveStatus(f);
  return (
    <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, padding:16,
      display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{f.type}</div>
          {f.remark && (
            <div style={{ fontSize:11, color:C.muted, marginTop:2, background:C.bg, padding:"3px 8px", borderRadius:6, border:`1px solid ${C.border}` }}>
              💡 {f.remark}
            </div>
          )}
        </div>
        <StatusBadge status={st} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {[["Category", <CatPill cat={f.cat} />], ["Amount", <span style={{ fontSize:15, fontWeight:800, color:C.text }}>{fmtCurrency(f.amt)}</span>],
          ["Published", <span style={{ fontSize:12.5, color:C.text2 }}>{f.pub}</span>],
          ["Due Date", <span style={{ fontSize:12.5, color:st!=="paid"?C.red:C.text2, fontWeight:st!=="paid"?600:400 }}>{f.due}</span>]
        ].map(([lbl, node]) => (
          <div key={lbl}>
            <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".5px", marginBottom:2 }}>{lbl}</div>
            {node}
          </div>
        ))}
        {f.paidDate && f.paidDate !== "-" && (
          <div>
            <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".5px", marginBottom:2 }}>Paid On</div>
            <div style={{ fontSize:12.5, color:C.green, fontWeight:600 }}>{f.paidDate}</div>
          </div>
        )}
      </div>
      {st !== "paid" && st !== "pending_verification" && (
        <div style={{ paddingTop:4 }}><PayNowBtn overdue={st==="overdue"} onClick={() => onPayNow(f.id)} /></div>
      )}
      {st === "pending_verification" && (
        <div style={{ paddingTop:4, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, color:C.muted2, fontWeight:600 }}>Waiting for verification from authority</span>
          {f.receiptUrl && (
            <button onClick={() => openReceipt(f.receiptUrl)}
              style={{ background:"none", border:"none", padding:0, cursor:"pointer",
                fontSize:11, color:C.accent, textDecoration:"underline" }}>
              View Receipt ↗
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── main export ── */
export function FeeSection({ fees, onPayNow }) {
  const [monthFilter, setMonthFilter] = useState("all");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);

  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const monthPills = useMemo(() => buildMonthPills(fees), [fees]);

  function getMonthStatus(monthVal) {
    if (monthVal === "all") return null;
    const monthFees = fees.filter(f => f.month === monthVal);
    if (monthFees.length === 0) return null;
    const statuses = monthFees.map(f => resolveStatus(f));
    if (statuses.includes("overdue")) return "overdue";
    if (statuses.includes("notpaid")) return "notpaid";
    if (statuses.includes("pending_verification")) return "pending_verification";
    return "paid";
  }

  const filtered = useMemo(
    () => monthFilter === "all" ? fees : fees.filter(f => f.month === monthFilter),
    [monthFilter, fees]
  );

  return (
    <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:16,
      overflow:"hidden", boxShadow:"0 1px 8px rgba(37,99,235,.07)" }}>
      <style dangerouslySetInnerHTML={{ __html: styleTag }} />
      {/* Header */}
      <div style={{ padding:"18px 20px 14px", borderBottom:`1.5px solid ${C.border}` }}>
        <div style={{ fontSize:17, fontWeight:800, color:C.text, marginBottom:4 }}>Fee Log</div>
        <div style={{ fontSize:12.5, color:C.muted, marginBottom:14 }}>Complete history of your fee payments</div>
        {/* Month pills */}
        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11.5, color:C.muted,
            fontWeight:700, textTransform:"uppercase", letterSpacing:".6px", marginRight:2, flexShrink:0 }}>
            🗓 Month:
          </div>
          {monthPills.filter(p => !p.empty).map(p => (
            <MonthFilterPill
              key={p.val} pill={p}
              selected={monthFilter === p.val}
              feeStatus={getMonthStatus(p.val)}
              onClick={() => setMonthFilter(p.val)}
            />
          ))}
        </div>
      </div>
      {/* Table / Cards */}
      {isMobile
        ? <div style={{ padding:14, display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.length === 0
              ? <div style={{ padding:"24px 0", textAlign:"center", color:C.muted, fontSize:13 }}>No fees for this period.</div>
              : filtered.map(f => <FeeCardMobile key={f.id} f={f} onPayNow={onPayNow} />)
            }
          </div>
        : <FeeTableDesktop rows={filtered} onPayNow={onPayNow} />
      }
    </div>
  );
}
