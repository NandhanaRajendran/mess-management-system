import React, { useState } from "react";
import { C, CAT_STYLE, shadow } from "../../utils/constants";
import { buildMonthPills, resolveStatus, fmtCurrency } from "../../utils/helpers";
import { useWindowWidth } from "../../hooks/useWindowWidth";
import { CalIcon } from "../icons";

function StatusBadge({ status }) {
  const cfg = {
    paid:    { bg:C.greenBg, color:C.green, border:C.greenBorder, label:"✓ Paid" },
    notpaid: { bg:C.goldBg,  color:C.gold,  border:C.goldBorder,  label:"⏱ Pending" },
    overdue: { bg:C.redBg,   color:C.red,   border:C.redBorder,   label:"⚠ Overdue" },
  }[status] || { bg:C.goldBg, color:C.gold, border:C.goldBorder, label:"—" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, fontSize:11.5, fontWeight:700, whiteSpace:"nowrap" }}>
      {cfg.label}
    </span>
  );
}

function CatPill({ cat }) {
  const s = CAT_STYLE[cat] || CAT_STYLE.Academic;
  return (
    <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:"nowrap" }}>
      {cat}
    </span>
  );
}

function PayNowBtn({ overdue, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ padding:"7px 16px", borderRadius:8, border:"none", fontFamily:"inherit", background:overdue?`linear-gradient(135deg,${C.red},${C.orange})`:C.accent, color:"#fff", fontWeight:700, fontSize:12.5, cursor:"pointer", transform:hov?"scale(1.04)":"none", boxShadow:hov?(overdue?"0 4px 12px rgba(220,38,38,.3)":"0 4px 12px rgba(37,99,235,.3)"):"none", transition:"all .18s", whiteSpace:"nowrap" }}>
      Pay Now
    </button>
  );
}

function FeeTableDesktop({ rows, onPayNow }) {
  const th = { padding:"12px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".6px", whiteSpace:"nowrap", background:C.bg };
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:750 }}>
        <thead>
          <tr style={{ borderBottom:`1.5px solid ${C.border}` }}>
            {["Fee ID","Fee Type","Category","Amount","Published Date","Due Date","Status","Paid Date","Action"].map(h => (
              <th key={h} style={th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={9} style={{ padding:"32px 14px", textAlign:"center", color:C.muted, fontSize:13 }}>No fees found for selected period.</td></tr>
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
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background:hov?C.bg:C.white, transition:"background .15s" }}>
      <td style={td}><span style={{ fontSize:12, fontWeight:700, color:C.muted }}>{f.id}</span></td>
      <td style={td}><span style={{ fontWeight:700, fontSize:13.5, color:C.text }}>{f.type}</span></td>
      <td style={td}><CatPill cat={f.cat} /></td>
      <td style={td}><span style={{ fontSize:14, fontWeight:800, color:C.text }}>{fmtCurrency(f.amt)}</span></td>
      <td style={td}><span style={{ fontSize:12.5, color:C.text2, fontWeight:500 }}>{f.pub}</span></td>
      <td style={td}><span style={{ fontSize:12.5, color:st!=="paid"?C.red:C.text2, fontWeight:st!=="paid"?600:500 }}>{f.due}</span></td>
      <td style={td}><StatusBadge status={st} /></td>
      <td style={td}><span style={{ fontSize:12.5, color:C.text2 }}>{f.paidDate}</span></td>
      <td style={td}>
        {st==="paid" ? <span style={{ fontSize:12, color:C.muted2 }}>—</span> : <PayNowBtn overdue={st==="overdue"} onClick={() => onPayNow?.(f.id)} />}
      </td>
    </tr>
  );
}

function FeeCardMobile({ f, onPayNow }) {
  const st = resolveStatus(f);
  return (
    <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, padding:16, display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, marginBottom:3 }}>{f.id}</div>
          <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{f.type}</div>
        </div>
        <StatusBadge status={st} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <div>
          <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".5px", marginBottom:2 }}>Category</div>
          <CatPill cat={f.cat} />
        </div>
        <div>
          <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".5px", marginBottom:2 }}>Amount</div>
          <div style={{ fontSize:15, fontWeight:800, color:C.text }}>{fmtCurrency(f.amt)}</div>
        </div>
        <div>
          <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".5px", marginBottom:2 }}>Published</div>
          <div style={{ fontSize:12.5, color:C.text2 }}>{f.pub}</div>
        </div>
        <div>
          <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".5px", marginBottom:2 }}>Due Date</div>
          <div style={{ fontSize:12.5, color:st!=="paid"?C.red:C.text2, fontWeight:st!=="paid"?600:400 }}>{f.due}</div>
        </div>
        {f.paidDate !== "-" && (
          <div>
            <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".5px", marginBottom:2 }}>Paid On</div>
            <div style={{ fontSize:12.5, color:C.green, fontWeight:600 }}>{f.paidDate}</div>
          </div>
        )}
      </div>
      {st !== "paid" && (
        <div style={{ paddingTop:4 }}>
          <PayNowBtn overdue={st==="overdue"} onClick={() => onPayNow?.(f.id)} />
        </div>
      )}
    </div>
  );
}

function MonthFilterPill({ pill, selected, feeStatus, onClick }) {
  const [hov, setHov] = useState(false);
  const { val, label } = pill;
  let dotType = feeStatus;
  let bg = C.bg, color = C.muted, border = C.border;
  if (selected) {
    bg = dotType==="overdue" ? C.red : dotType==="notpaid" ? C.gold : C.accent;
    color = "#fff"; border = bg;
  } else if (dotType === "overdue") {
    bg = C.redBg; color = C.red; border = C.redBorder;
  } else if (dotType === "notpaid") {
    bg = C.goldBg; color = C.gold; border = C.goldBorder;
  } else if (hov && val !== "all") {
    bg = C.accentLight; color = C.accent; border = C.accent;
  }
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ position:"relative", padding:"4px 11px", borderRadius:20, fontSize:11.5, fontWeight:600, cursor:"pointer", border:`1.5px solid ${border}`, background:bg, color, transition:"all .18s", whiteSpace:"nowrap" }}>
      {label}
      {!selected && (dotType === "overdue" || dotType === "notpaid") && (
        <span style={{ position:"absolute", top:2, right:2, width:5, height:5, borderRadius:"50%", background:dotType==="overdue"?C.red:C.gold }} />
      )}
    </div>
  );
}

export function FeeSection({ fees, onPayNow = () => {} }) {
  const [monthFilter, setMonthFilter] = useState("all");
  const w = useWindowWidth();
  const isMobile = w < 700;

  const monthPills = buildMonthPills(fees);

  function getMonthStatus(monthVal) {
    if (monthVal === "all") return null;
    const monthFees = fees.filter(f => f.month === monthVal);
    if (monthFees.length === 0) return null;
    const statuses = monthFees.map(f => resolveStatus(f));
    if (statuses.includes("overdue")) return "overdue";
    if (statuses.includes("notpaid")) return "notpaid";
    return null;
  }

  const filtered = monthFilter === "all" ? fees : fees.filter(f => f.month === monthFilter);

  return (
    <div className="fade-up" style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:16, overflow:"hidden", boxShadow:shadow }}>
      <div style={{ padding:"18px 20px 14px", borderBottom:`1.5px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:14 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800 }}>Fee Log</div>
            <div style={{ fontSize:12.5, color:C.muted, marginTop:3 }}>Complete history of your fee payments</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11.5, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:".6px", marginRight:2, flexShrink:0 }}>
            <CalIcon /> Month:
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
