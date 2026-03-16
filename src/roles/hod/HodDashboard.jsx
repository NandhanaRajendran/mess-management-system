import { useState, useMemo } from "react";

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const ALL_STUDENTS = [
  { id: "STU2024001", name: "Aditya Sharma",    sem: "S8" },
  { id: "STU2024002", name: "Bhavna Iyer",       sem: "S8" },
  { id: "STU2024003", name: "Chetan Reddy",      sem: "S8" },
  { id: "STU2024004", name: "Divya Nambiar",     sem: "S8" },
  { id: "STU2024005", name: "Eshan Tiwari",      sem: "S8" },
  { id: "STU2024011", name: "Farhan Shaikh",     sem: "S6" },
  { id: "STU2024012", name: "Gayatri Pillai",    sem: "S6" },
  { id: "STU2024013", name: "Harsh Patel",       sem: "S6" },
  { id: "STU2024014", name: "Ishita Roy",        sem: "S6" },
  { id: "STU2024015", name: "Jai Khandelwal",   sem: "S6" },
  { id: "STU2024021", name: "Kavya Menon",       sem: "S4" },
  { id: "STU2024022", name: "Lokesh Bose",       sem: "S4" },
  { id: "STU2024023", name: "Meera Varma",       sem: "S4" },
  { id: "STU2024024", name: "Nitin Joshi",       sem: "S4" },
  { id: "STU2024025", name: "Ojas Shetty",       sem: "S4" },
  { id: "STU2024031", name: "Priya Nair",        sem: "S2" },
  { id: "STU2024032", name: "Qasim Ali",         sem: "S2" },
  { id: "STU2024033", name: "Riya Gupta",        sem: "S2" },
  { id: "STU2024034", name: "Sahil Desai",       sem: "S2" },
  { id: "STU2024035", name: "Tanvi Kulkarni",    sem: "S2" },
];

const FEE_DATA = {
  S8: [
    { cat: "Tuition fee",    amount: "₹47,000", due: "2025-08-31", status: "Published", remark: "Core academic fee" },
    { cat: "Exam fee",       amount: "₹2,200",  due: "2025-09-15", status: "Published", remark: "Theory & Practical" },
    { cat: "Library fee",   amount: "₹800",    due: "2025-08-31", status: "Published", remark: "Annual access" },
    { cat: "Project fee",    amount: "₹5,000",  due: "2025-10-01", status: "Published", remark: "Final year project" },
    { cat: "Placement fee",  amount: "₹1,500",  due: "2025-09-30", status: "Published", remark: "Training & placement" },
    { cat: "Convocation fee",amount: "₹3,000",  due: "2025-11-01", status: "Pending",   remark: "Graduation ceremony" },
    { cat: "Bus fee",        amount: "₹12,000", due: "2025-08-25", status: "Published", remark: "Optional transport" },
  ],
  S6: [
    { cat: "Tuition fee",  amount: "₹44,000", due: "2025-08-31", status: "Published", remark: "Core academic fee" },
    { cat: "Exam fee",     amount: "₹2,200",  due: "2025-09-15", status: "Published", remark: "Theory & Practical" },
    { cat: "Library fee", amount: "₹800",    due: "2025-08-31", status: "Published", remark: "Annual access" },
    { cat: "Lab fee",      amount: "₹3,500",  due: "2025-09-01", status: "Published", remark: "Lab consumables" },
    { cat: "Bus fee",      amount: "₹12,000", due: "2025-08-25", status: "Published", remark: "Optional transport" },
  ],
  S4: [
    { cat: "Tuition fee",  amount: "₹42,000", due: "2025-08-31", status: "Published", remark: "Core academic fee" },
    { cat: "Exam fee",     amount: "₹2,000",  due: "2025-09-15", status: "Published", remark: "Theory & Practical" },
    { cat: "Library fee", amount: "₹800",    due: "2025-08-31", status: "Published", remark: "Annual access" },
    { cat: "Bus fee",      amount: "₹12,000", due: "2025-08-25", status: "Pending",   remark: "Optional transport" },
  ],
  S2: [
    { cat: "Tuition fee",  amount: "₹40,000", due: "2025-08-31", status: "Published", remark: "Core academic fee" },
    { cat: "Exam fee",     amount: "₹1,800",  due: "2025-09-15", status: "Published", remark: "Theory & Practical" },
    { cat: "Library fee", amount: "₹800",    due: "2025-08-31", status: "Published", remark: "Annual access" },
    { cat: "Bus fee",      amount: "₹12,000", due: "2025-08-25", status: "Published", remark: "Optional transport" },
  ],
};

const DUE_DATA = [
  { id:"STU2024001", name:"Aditya Sharma",   sem:"S8", tuition:0,     exam:2200, library:0,   bus:12000, fine:200,  total:14400 },
  { id:"STU2024002", name:"Bhavna Iyer",      sem:"S8", tuition:47000, exam:0,    library:800, bus:0,     fine:0,    total:47800 },
  { id:"STU2024003", name:"Chetan Reddy",     sem:"S8", tuition:0,     exam:0,    library:0,   bus:0,     fine:0,    total:0     },
  { id:"STU2024004", name:"Divya Nambiar",    sem:"S8", tuition:47000, exam:2200, library:800, bus:12000, fine:0,    total:62000 },
  { id:"STU2024005", name:"Eshan Tiwari",     sem:"S8", tuition:0,     exam:2200, library:0,   bus:12000, fine:500,  total:14700 },
  { id:"STU2024011", name:"Farhan Shaikh",    sem:"S6", tuition:44000, exam:0,    library:800, bus:12000, fine:0,    total:56800 },
  { id:"STU2024012", name:"Gayatri Pillai",   sem:"S6", tuition:0,     exam:2200, library:0,   bus:0,     fine:0,    total:2200  },
  { id:"STU2024013", name:"Harsh Patel",      sem:"S6", tuition:0,     exam:0,    library:0,   bus:0,     fine:0,    total:0     },
  { id:"STU2024014", name:"Ishita Roy",       sem:"S6", tuition:44000, exam:2200, library:800, bus:12000, fine:300,  total:59300 },
  { id:"STU2024015", name:"Jai Khandelwal",  sem:"S6", tuition:0,     exam:2200, library:0,   bus:0,     fine:500,  total:2700  },
  { id:"STU2024021", name:"Kavya Menon",      sem:"S4", tuition:42000, exam:2000, library:800, bus:12000, fine:0,    total:56800 },
  { id:"STU2024022", name:"Lokesh Bose",      sem:"S4", tuition:0,     exam:0,    library:800, bus:0,     fine:1200, total:2000  },
  { id:"STU2024023", name:"Meera Varma",      sem:"S4", tuition:0,     exam:0,    library:0,   bus:0,     fine:0,    total:0     },
  { id:"STU2024024", name:"Nitin Joshi",      sem:"S4", tuition:42000, exam:2000, library:0,   bus:12000, fine:0,    total:56000 },
  { id:"STU2024025", name:"Ojas Shetty",      sem:"S4", tuition:0,     exam:2000, library:800, bus:0,     fine:0,    total:2800  },
  { id:"STU2024031", name:"Priya Nair",       sem:"S2", tuition:40000, exam:1800, library:800, bus:12000, fine:0,    total:54600 },
  { id:"STU2024032", name:"Qasim Ali",        sem:"S2", tuition:0,     exam:0,    library:0,   bus:0,     fine:300,  total:300   },
  { id:"STU2024033", name:"Riya Gupta",       sem:"S2", tuition:40000, exam:1800, library:800, bus:12000, fine:0,    total:54600 },
  { id:"STU2024034", name:"Sahil Desai",      sem:"S2", tuition:0,     exam:1800, library:0,   bus:0,     fine:0,    total:1800  },
  { id:"STU2024035", name:"Tanvi Kulkarni",   sem:"S2", tuition:0,     exam:0,    library:0,   bus:0,     fine:0,    total:0     },
];

const RECENT_FINES = [
  { id:"STU2024001", name:"Aditya Sharma",  sem:"S8", cat:"Library Fine",      amt:"₹200",   due:"2026-03-20", status:"Pending" },
  { id:"STU2024015", name:"Jai Khandelwal",sem:"S6", cat:"Late Fee",           amt:"₹500",   due:"2026-03-18", status:"Pending" },
  { id:"STU2024022", name:"Lokesh Bose",    sem:"S4", cat:"Lab Damage",         amt:"₹1,200", due:"2026-03-15", status:"Paid"    },
  { id:"STU2024032", name:"Qasim Ali",      sem:"S2", cat:"Disciplinary Fine",  amt:"₹300",   due:"2026-03-25", status:"Pending" },
];

const SEMS = ["S2", "S4", "S6", "S8"];
const FINE_CATS = ["Library Fine", "Late Fee", "Lab Damage", "Disciplinary Fine", "Other"];

/* ─────────────────────────────────────────────
   STYLE CONSTANTS  (inline style objects)
───────────────────────────────────────────── */
const C = {
  sky50:  "#f0f9ff", sky100: "#e0f2fe", sky200: "#bae6fd",
  sky300: "#7dd3fc", sky400: "#38bdf8", sky500: "#0ea5e9",
  sky600: "#0284c7", sky700: "#0369a1", sky800: "#075985", sky900: "#0c4a6e",
  slate50:"#f8fafc", slate100:"#f1f5f9", slate200:"#e2e8f0",
  slate400:"#94a3b8", slate500:"#64748b", slate700:"#334155", slate900:"#0f172a",
  green100:"#dcfce7", green700:"#15803d",
  amber100:"#fef3c7", amber900:"#78350f",
  red50:"#fff1f2", red100:"#fee2e2", red500:"#ef4444", red700:"#b91c1c",
  white:"#ffffff",
};

/* ─────────────────────────────────────────────
   SMALL REUSABLE COMPONENTS
───────────────────────────────────────────── */

function Badge({ status }) {
  const styles = {
    Published: { bg: C.green100, color: C.green700 },
    Pending:   { bg: C.amber100, color: C.amber900 },
    Paid:      { bg: C.green100, color: C.green700 },
    Due:       { bg: C.red100,   color: C.red700   },
  };
  const s = styles[status] || { bg: C.sky100, color: C.sky700 };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:20, fontSize:".72rem", fontWeight:700,
      background: s.bg, color: s.color,
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:"currentColor", display:"inline-block" }} />
      {status}
    </span>
  );
}

function Chip({ children }) {
  return (
    <span style={{
      display:"inline-block", padding:"2px 8px", borderRadius:12,
      fontSize:".72rem", fontWeight:700, background: C.sky100, color: C.sky700,
    }}>{children}</span>
  );
}

function Btn({ children, variant="primary", size="md", onClick, style={} }) {
  const base = {
    display:"inline-flex", alignItems:"center", gap:7, border:"none",
    fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600, cursor:"pointer",
    borderRadius:8, transition:"all .18s", ...style,
  };
  const sizes = { md:{ padding:"9px 18px", fontSize:".875rem" }, sm:{ padding:"6px 13px", fontSize:".78rem" }};
  const variants = {
    primary: { background:C.sky600, color:C.white, boxShadow:"0 2px 8px rgba(2,132,199,.25)" },
    outline:  { background:C.white, color:C.sky700, border:`1px solid ${C.sky300}` },
    danger:   { background:C.red500, color:C.white, boxShadow:"0 2px 8px rgba(239,68,68,.25)" },
    ghost:    { background:"transparent", color:C.slate500, border:`1px solid ${C.slate200}` },
  };
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant] }} onClick={onClick}>
      {children}
    </button>
  );
}

function Card({ children, style={} }) {
  return (
    <div style={{
      background: C.white, borderRadius:18, border:`1px solid ${C.sky100}`,
      boxShadow:"0 1px 3px rgba(14,165,233,.08)", padding:24, ...style,
    }}>{children}</div>
  );
}

function StatCard({ label, value, accent="sky", style={} }) {
  const colors = {
    sky:   { border: C.sky200,    val: C.sky600   },
    green: { border: "#bbf7d0",   val: "#16a34a"  },
    amber: { border: "#fed7aa",   val: "#d97706"  },
    red:   { border: C.red100,    val: C.red500   },
  };
  const c = colors[accent] || colors.sky;
  return (
    <div style={{
      background: C.white, borderRadius:12, padding:"18px 20px",
      border:`2px solid ${c.border}`, boxShadow:"0 1px 3px rgba(14,165,233,.08)", ...style,
    }}>
      <div style={{ fontSize:".7rem", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:C.slate500, marginBottom:8 }}>{label}</div>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.8rem", fontWeight:700, color:c.val, lineHeight:1 }}>{value}</div>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:".78rem", fontWeight:600, color:C.slate700 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  padding:"9px 12px", border:`1px solid ${C.sky200}`, borderRadius:8,
  fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".875rem", color:C.slate900,
  background:C.white, outline:"none", width:"100%",
};

function Input(props) {
  return <input style={inputStyle} {...props} />;
}

function Select({ children, ...props }) {
  return <select style={{ ...inputStyle, cursor:"pointer" }} {...props}>{children}</select>;
}

function TableWrap({ children }) {
  return (
    <div style={{ overflowX:"auto", borderRadius:10, border:`1px solid ${C.sky100}` }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>{children}</table>
    </div>
  );
}

function Th({ children, style={} }) {
  return (
    <th style={{
      padding:"11px 16px", textAlign:"left", fontSize:".72rem", fontWeight:700,
      letterSpacing:".06em", textTransform:"uppercase", color:C.sky700,
      background:C.sky50, whiteSpace:"nowrap", ...style,
    }}>{children}</th>
  );
}

function Td({ children, style={} }) {
  return (
    <td style={{
      padding:"12px 16px", borderTop:`1px solid ${C.sky50}`,
      fontSize:".875rem", color:C.slate700, verticalAlign:"middle", ...style,
    }}>{children}</td>
  );
}

/* ─────────────────────────────────────────────
   SVG ICON HELPERS
───────────────────────────────────────────── */
const Icon = {
  Plus: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Warn: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Logout: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  Logo: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" fill="#0284c7" opacity=".15"/>
      <path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" stroke="#0284c7" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M12 3V21M4 7L12 11M20 7L12 11" stroke="#0284c7" strokeWidth="1.5"/>
    </svg>
  ),
  Info: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink:0 }}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function Toast({ message, type, visible }) {
  const bg = type === "success" ? "#166534" : type === "error" ? "#7f1d1d" : C.slate900;
  const border = type === "success" ? "#22c55e" : type === "error" ? C.red500 : C.sky500;
  return (
    <div style={{
      position:"fixed", bottom:28, right:24, background:bg, color:C.white,
      padding:"12px 20px", borderRadius:10, fontSize:".85rem", fontWeight:500,
      zIndex:300, borderLeft:`4px solid ${border}`,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      opacity: visible ? 1 : 0, transition:"all .3s", pointerEvents:"none",
    }}>{message}</div>
  );
}

/* ─────────────────────────────────────────────
   MODAL
───────────────────────────────────────────── */
function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, background:"rgba(15,23,42,.45)",
        backdropFilter:"blur(3px)", zIndex:200,
        display:"flex", alignItems:"center", justifyContent:"center", padding:16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:C.white, borderRadius:24, padding:28,
          width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto",
          boxShadow:"0 10px 32px rgba(14,165,233,.16)",
        }}
      >
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <span style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.1rem", fontWeight:700 }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"1.5rem", color:C.slate400, cursor:"pointer", lineHeight:1 }}>×</button>
        </div>
        {children}
        {footer && <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:22 }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FEE MANAGEMENT TAB
───────────────────────────────────────────── */
function FeeManagement({ toast }) {
  const [fineMode, setFineMode]       = useState("individual");
  const [indvSem, setIndvSem]         = useState("");
  const [indvStudent, setIndvStudent] = useState("");
  const [selSem, setSelSem]           = useState("");
  const [selected, setSelected]       = useState({});
  const [classSem, setClassSem]       = useState("");
  const [fineCat, setFineCat]         = useState(FINE_CATS[0]);
  const [amount, setAmount]           = useState("");
  const [dueDate, setDueDate]         = useState("");
  const [remark, setRemark]           = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const semStudents = useMemo(
    () => ALL_STUDENTS.filter(s => !selSem || s.sem === selSem),
    [selSem]
  );
  const indvStudents = useMemo(
    () => ALL_STUDENTS.filter(s => !indvSem || s.sem === indvSem),
    [indvSem]
  );

  const selCount = Object.values(selected).filter(Boolean).length;

  const toggleOne = id => setSelected(p => ({ ...p, [id]: !p[id] }));
  const toggleAll = e => {
    const nxt = {};
    semStudents.forEach(s => (nxt[s.id] = e.target.checked));
    setSelected(nxt);
  };
  const allChecked = semStudents.length > 0 && semStudents.every(s => selected[s.id]);

  const modeBtn = (mode, label) => (
    <button
      key={mode}
      onClick={() => setFineMode(mode)}
      style={{
        padding:"7px 16px", border:`1px solid ${fineMode===mode ? C.sky600 : C.sky200}`,
        borderRadius:20, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".8rem",
        fontWeight:600, cursor:"pointer", transition:"all .18s",
        background: fineMode===mode ? C.sky600 : C.white,
        color: fineMode===mode ? C.white : C.slate500,
      }}
    >{label}</button>
  );

  return (
    <>
      <Card>
        <div style={{ marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.15rem", fontWeight:700, marginBottom:4 }}>Add Fine / Penalty</h2>
          <p style={{ fontSize:".82rem", color:C.slate500 }}>Assign fines to individual students, selected students, or an entire class</p>
        </div>

        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
          {modeBtn("individual","Individual Student")}
          {modeBtn("selected","Selected Students")}
          {modeBtn("class","Entire Class")}
        </div>

        {/* ── INDIVIDUAL ── */}
        {fineMode === "individual" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, marginBottom:18 }}>
              <FormGroup label="Semester">
                <Select value={indvSem} onChange={e => { setIndvSem(e.target.value); setIndvStudent(""); }}>
                  <option value="">Select Semester</option>
                  {SEMS.map(s => <option key={s}>{s}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Student">
                <Select value={indvStudent} onChange={e => setIndvStudent(e.target.value)} disabled={!indvSem}>
                  <option value="">{indvSem ? "Select Student" : "— select semester first —"}</option>
                  {indvStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Fine Category">
                <Select value={fineCat} onChange={e => setFineCat(e.target.value)}>
                  {FINE_CATS.map(c => <option key={c}>{c}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Amount (₹)">
                <Input type="number" placeholder="e.g. 500" min="1" value={amount} onChange={e => setAmount(e.target.value)} />
              </FormGroup>
              <FormGroup label="Due Date">
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </FormGroup>
              <FormGroup label="Remark">
                <Input type="text" placeholder="Optional note" value={remark} onChange={e => setRemark(e.target.value)} />
              </FormGroup>
            </div>
            <Btn onClick={() => { toast("Fine added successfully!", "success"); }}>
              <Icon.Plus /> Add Fine
            </Btn>
          </div>
        )}

        {/* ── SELECTED STUDENTS ── */}
        {fineMode === "selected" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, marginBottom:18 }}>
              <FormGroup label="Semester">
                <Select value={selSem} onChange={e => { setSelSem(e.target.value); setSelected({}); }}>
                  <option value="">Select Semester</option>
                  {SEMS.map(s => <option key={s}>{s}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Fine Category">
                <Select value={fineCat} onChange={e => setFineCat(e.target.value)}>
                  {FINE_CATS.map(c => <option key={c}>{c}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Amount (₹)">
                <Input type="number" placeholder="500" min="1" value={amount} onChange={e => setAmount(e.target.value)} />
              </FormGroup>
              <FormGroup label="Due Date">
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </FormGroup>
            </div>
            <TableWrap>
              <thead>
                <tr>
                  <Th><input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ accentColor:C.sky600 }} /></Th>
                  <Th>Adm No</Th><Th>Name</Th><Th>Semester</Th><Th>Section</Th>
                </tr>
              </thead>
              <tbody>
                {semStudents.length === 0 ? (
                  <tr><Td style={{ textAlign:"center", color:C.slate400 }} colSpan={5}>Select a semester to load students</Td></tr>
                ) : semStudents.map(s => (
                  <tr key={s.id} style={{ cursor:"pointer" }} onClick={() => toggleOne(s.id)}>
                    <Td><input type="checkbox" checked={!!selected[s.id]} onChange={() => toggleOne(s.id)} style={{ accentColor:C.sky600 }} onClick={e => e.stopPropagation()} /></Td>
                    <Td style={{ fontSize:".78rem", color:C.slate400 }}>{s.id}</Td>
                    <Td style={{ fontWeight:500 }}>{s.name}</Td>
                    <Td><Chip>{s.sem}</Chip></Td>
                    <Td>A</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ display:"flex", gap:12, alignItems:"center", marginTop:16, flexWrap:"wrap" }}>
              <span style={{ fontSize:".82rem", color:C.slate500 }}>{selCount} student{selCount !== 1 ? "s" : ""} selected</span>
              <Btn onClick={() => toast(`Fine added to ${selCount} student(s)!`, "success")}>
                <Icon.Plus /> Add Fine to Selected
              </Btn>
            </div>
          </div>
        )}

        {/* ── ENTIRE CLASS ── */}
        {fineMode === "class" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, marginBottom:18 }}>
              <FormGroup label="Semester">
                <Select value={classSem} onChange={e => setClassSem(e.target.value)}>
                  <option value="">Select Semester</option>
                  {SEMS.map(s => <option key={s}>{s}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Fine Category">
                <Select value={fineCat} onChange={e => setFineCat(e.target.value)}>
                  {FINE_CATS.map(c => <option key={c}>{c}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Amount per Student (₹)">
                <Input type="number" placeholder="500" min="1" value={amount} onChange={e => setAmount(e.target.value)} />
              </FormGroup>
              <FormGroup label="Due Date">
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </FormGroup>
              <FormGroup label="Remark" style={{ gridColumn:"1/-1" }}>
                <Input type="text" placeholder="e.g. Library dues – March 2026" value={remark} onChange={e => setRemark(e.target.value)} />
              </FormGroup>
            </div>
            <div style={{
              background:C.amber100, borderRadius:8, padding:"12px 16px",
              fontSize:".82rem", color:C.amber900, marginBottom:16,
              display:"flex", gap:8, alignItems:"flex-start",
            }}>
              <Icon.Warn />
              This will apply the fine to <strong>&nbsp;all students&nbsp;</strong> in the selected semester class.
            </div>
            <Btn variant="danger" onClick={() => setConfirmOpen(true)}>
              <Icon.Warn /> Add Fine to Entire Class
            </Btn>
          </div>
        )}
      </Card>

      {/* Recent Fines */}
      <Card style={{ marginTop:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          <div>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:"1rem", fontWeight:700 }}>Recent Fines</h3>
            <p style={{ fontSize:".78rem", color:C.slate500, marginTop:2 }}>Last 10 fine entries across all classes</p>
          </div>
          <Btn variant="outline" size="sm" onClick={() => toast("Downloading…", "success")}><Icon.Download /> Download</Btn>
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th>Adm No</Th><Th>Name</Th><Th>Semester</Th>
              <Th>Category</Th><Th>Amount</Th><Th>Due Date</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {RECENT_FINES.map((r, i) => (
              <tr key={i}>
                <Td style={{ fontSize:".78rem", color:C.slate400 }}>{r.id}</Td>
                <Td style={{ fontWeight:500 }}>{r.name}</Td>
                <Td><Chip>{r.sem}</Chip></Td>
                <Td>{r.cat}</Td>
                <Td style={{ fontWeight:700, color: r.status==="Paid" ? C.slate700 : C.red500 }}>{r.amt}</Td>
                <Td style={{ color:C.slate500, fontSize:".82rem" }}>{r.due}</Td>
                <Td><Badge status={r.status} /></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>

      {/* Confirm Modal */}
      <Modal
        open={confirmOpen}
        title="Confirm Class-Wide Fine"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <Btn variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => { setConfirmOpen(false); toast("Fine applied to entire class!", "success"); }}>
              Yes, Apply Fine
            </Btn>
          </>
        }
      >
        <p style={{ fontSize:".9rem", color:C.slate600, lineHeight:1.6 }}>
          You are about to apply a fine to <strong>all students</strong> in the selected semester.
          This action cannot be undone automatically. Are you sure?
        </p>
      </Modal>
    </>
  );
}

/* ─────────────────────────────────────────────
   FEE CATEGORIES TAB
───────────────────────────────────────────── */
function FeeCategories() {
  const [sem, setSem] = useState("S8");
  const rows = FEE_DATA[sem] || [];
  const published = rows.filter(r => r.status === "Published").length;
  const pending   = rows.filter(r => r.status === "Pending").length;
  const totalAmt  = "₹71,500";

  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        <StatCard label="Total Payable" value={totalAmt} accent="sky" />
        <StatCard label="Categories"   value={rows.length} accent="sky" />
        <StatCard label="Published"    value={published}   accent="green" />
        <StatCard label="Pending"      value={pending}     accent="amber" />
      </div>
      <Card>
        <p style={{ fontSize:".82rem", color:C.slate500, marginBottom:16 }}>Published fee structure by semester — B.Tech</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:18 }}>
          <div style={{ display:"flex", gap:6 }}>
            {SEMS.map(s => (
              <button
                key={s}
                onClick={() => setSem(s)}
                style={{
                  padding:"6px 14px", border:`1px solid ${sem===s ? C.sky900 : C.sky200}`,
                  borderRadius:20, fontFamily:"'Plus Jakarta Sans',sans-serif",
                  fontSize:".8rem", fontWeight:600, cursor:"pointer", transition:"all .18s",
                  background: sem===s ? C.sky900 : C.white,
                  color: sem===s ? C.white : C.slate500,
                }}
              >{s}</button>
            ))}
          </div>
          <span style={{ fontSize:".8rem", color:C.slate500 }}>CSE · Semester {sem.slice(1)}</span>
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th>Fee Category</Th><Th>Amount (₹)</Th><Th>Due Date</Th><Th>Status</Th><Th>Remarks</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <Td style={{ fontWeight:600 }}>{r.cat}</Td>
                <Td style={{ fontWeight:700, color:C.sky700 }}>{r.amount}</Td>
                <Td style={{ color:C.slate500, fontSize:".82rem" }}>{r.due}</Td>
                <Td><Badge status={r.status} /></Td>
                <Td style={{ color:C.slate500, fontSize:".82rem" }}>{r.remark}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>
    </>
  );
}

/* ─────────────────────────────────────────────
   DUE SHEET TAB
───────────────────────────────────────────── */
function DueSheet({ toast }) {
  const [sem,    setSem]    = useState("");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return DUE_DATA.filter(d => {
      if (sem && d.sem !== sem) return false;
      if (q && !d.name.toLowerCase().includes(q) && !d.id.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sem, search]);

  const totalDue    = rows.reduce((a, r) => a + r.total, 0);
  const withDue     = rows.filter(r => r.total > 0).length;
  const clearCount  = rows.length - withDue;
  const rate        = rows.length ? Math.round((clearCount / rows.length) * 100) : 0;

  const fmt = v => v
    ? <span style={{ color:C.red500, fontWeight:700 }}>₹{v.toLocaleString()}</span>
    : <span style={{ color:C.slate400 }}>—</span>;

  return (
    <Card>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.15rem", fontWeight:700, marginBottom:4 }}>Due Sheet Management</h2>
          <p style={{ fontSize:".82rem", color:C.slate500 }}>View outstanding dues per class / semester</p>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <Btn variant="outline" size="sm" onClick={() => toast("Downloading due sheet…", "success")}>
            <Icon.Download /> Download
          </Btn>
          <Btn size="sm" onClick={() => toast("Due sheet published!", "success")}>
            <Icon.Check /> Publish Due Sheet
          </Btn>
        </div>
      </div>

      <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:20, alignItems:"flex-end" }}>
        <div style={{ flex:1, minWidth:160 }}>
          <FormGroup label="Semester / Class">
            <Select value={sem} onChange={e => setSem(e.target.value)}>
              <option value="">All Semesters</option>
              {SEMS.map(s => <option key={s}>{s}</option>)}
            </Select>
          </FormGroup>
        </div>
        <div style={{ flex:3, minWidth:220 }}>
          <FormGroup label="Search">
            <Input
              type="text"
              placeholder="Search by name or admission number…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </FormGroup>
        </div>
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>Adm No</Th><Th>Name</Th><Th>Sem</Th>
            <Th>Tuition</Th><Th>Exam</Th><Th>Library</Th>
            <Th>Bus</Th><Th>Fine</Th><Th>Total Due</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={9} style={{ textAlign:"center", padding:32, color:C.slate400 }}>No records found</td></tr>
          ) : rows.map(r => (
            <tr key={r.id}>
              <Td style={{ fontSize:".78rem", color:C.slate400 }}>{r.id}</Td>
              <Td style={{ fontWeight:600 }}>{r.name}</Td>
              <Td><Chip>{r.sem}</Chip></Td>
              <Td>{fmt(r.tuition)}</Td>
              <Td>{fmt(r.exam)}</Td>
              <Td>{fmt(r.library)}</Td>
              <Td>{fmt(r.bus)}</Td>
              <Td>{fmt(r.fine)}</Td>
              <Td>
                <strong style={{ color: r.total ? C.red500 : C.slate400 }}>
                  {r.total ? `₹${r.total.toLocaleString()}` : "—"}
                </strong>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginTop:20 }}>
        {[
          { label:"Total Students",    value:rows.length,                       col:C.sky700  },
          { label:"Students with Dues",value:withDue,                           col:C.red500  },
          { label:"Total Dues Amount", value:`₹${totalDue.toLocaleString()}`,   col:C.red500  },
          { label:"Collection Rate",   value:`${rate}%`,                        col:"#0d9488" },
        ].map(({ label, value, col }) => (
          <div key={label} style={{ background:C.sky50, border:`1px solid ${C.sky100}`, borderRadius:12, padding:"14px 16px" }}>
            <div style={{ fontSize:".72rem", fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", color:C.slate500, marginBottom:4 }}>{label}</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.4rem", fontWeight:700, color:col }}>{value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab] = useState("fee-mgmt");
  const [toastMsg,  setToastMsg]  = useState("");
  const [toastType, setToastType] = useState("");
  const [toastVis,  setToastVis]  = useState(false);

  const toast = (msg, type = "") => {
    setToastMsg(msg); setToastType(type); setToastVis(true);
    setTimeout(() => setToastVis(false), 2800);
  };

  const tabs = [
    { id:"fee-mgmt", label:"Fee Management" },
    { id:"fee-cat",  label:"Fee Categories" },
    { id:"due-sheet",label:"Due Sheet"       },
  ];

  return (
    <>
      {/* Google Fonts */}
      <style>{`
       
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        background:C.white, borderBottom:`1px solid ${C.sky200}`,
        padding:"0 24px", height:60,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:100,
        boxShadow:"0 1px 3px rgba(14,165,233,.08)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Icon.Logo />
          <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:"1.25rem", color:C.sky600, letterSpacing:"-.5px" }}>UNIPAY</span>
          <span style={{ background:C.sky100, color:C.sky700, fontSize:".7rem", fontWeight:700, padding:"3px 10px", borderRadius:20, letterSpacing:".5px" }}>HOD</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:".85rem", fontWeight:600 }}>Head of Department</div>
            <div style={{ fontSize:".75rem", color:C.slate500 }}>CSE Department</div>
          </div>
          <div style={{ width:36, height:36, borderRadius:"50%", background:C.sky100, display:"flex", alignItems:"center", justifyContent:"center", color:C.sky600 }}>
            <Icon.User />
          </div>
          <button
            onClick={() => toast("Logged out", "success")}
            style={{
              display:"flex", alignItems:"center", gap:6, background:"none",
              border:`1px solid ${C.slate200}`, borderRadius:8, padding:"6px 14px",
              fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".8rem",
              fontWeight:500, color:C.slate500, cursor:"pointer",
            }}
          >
            <Icon.Logout /> Logout
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.8rem", fontWeight:700 }}>HOD Dashboard</h1>
          <p style={{ fontSize:".9rem", color:C.slate500, marginTop:4 }}>Manage Academic, Lab, Examination and view due sheets · CSE Department</p>
        </div>

        {/* Tab bar */}
        <div style={{
          display:"flex", gap:4, background:C.white, borderRadius:12, padding:5,
          border:`1px solid ${C.sky100}`, boxShadow:"0 1px 3px rgba(14,165,233,.08)",
          marginBottom:28, width:"fit-content",
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding:"8px 20px", border:"none", borderRadius:8,
                fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".875rem",
                fontWeight:500, cursor:"pointer", transition:"all .18s",
                background: activeTab===t.id ? C.sky600 : "transparent",
                color: activeTab===t.id ? C.white : C.slate500,
                boxShadow: activeTab===t.id ? "0 2px 8px rgba(2,132,199,.3)" : "none",
              }}
            >{t.label}</button>
          ))}
        </div>

        {activeTab === "fee-mgmt"  && <FeeManagement toast={toast} />}
        {activeTab === "fee-cat"   && <FeeCategories />}
        {activeTab === "due-sheet" && <DueSheet toast={toast} />}
      </div>

      <Toast message={toastMsg} type={toastType} visible={toastVis} />
    </>
  );
}