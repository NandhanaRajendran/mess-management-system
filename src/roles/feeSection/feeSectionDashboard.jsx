import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── COLORS (matches HOD/Admin style) ─── */
const C = {
  sky50: "#f0f9ff", sky100: "#e0f2fe", sky200: "#bae6fd",
  sky600: "#0284c7", sky700: "#0369a1", sky900: "#0c4a6e",
  slate200: "#e2e8f0", slate400: "#94a3b8", slate500: "#64748b",
  slate700: "#334155", slate900: "#0f172a",
  green100: "#dcfce7", green700: "#15803d",
  amber100: "#fef3c7", amber900: "#78350f",
  red100: "#fee2e2", red500: "#ef4444", red700: "#b91c1c",
  white: "#ffffff",
};

/* ─── REUSABLE COMPONENTS ─── */
function Badge({ status }) {
  const map = {
    pending: { bg: C.red100, color: C.red700, label: "Due" },
    paid: { bg: C.green100, color: C.green700, label: "Paid" },
  };
  const s = map[status] || { bg: C.sky100, color: C.sky700, label: status };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px",
      borderRadius:20, fontSize:".72rem", fontWeight:700, background:s.bg, color:s.color }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:"currentColor", display:"inline-block" }} />
      {s.label}
    </span>
  );
}

function Chip({ children }) {
  return <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:12,
    fontSize:".72rem", fontWeight:700, background:C.sky100, color:C.sky700 }}>{children}</span>;
}

function Card({ children, style = {} }) {
  return <div style={{ background:C.white, borderRadius:18, border:`1px solid ${C.sky100}`,
    boxShadow:"0 1px 3px rgba(14,165,233,.08)", padding:24, ...style }}>{children}</div>;
}

function StatCard({ label, value, accent = "sky" }) {
  const colors = {
    sky: { border: C.sky200, val: C.sky600 },
    green: { border: "#bbf7d0", val: "#16a34a" },
    red: { border: C.red100, val: C.red500 },
    amber: { border: "#fed7aa", val: "#d97706" },
  };
  const c = colors[accent] || colors.sky;
  return (
    <div style={{ background:C.white, borderRadius:12, padding:"18px 20px",
      border:`2px solid ${c.border}`, boxShadow:"0 1px 3px rgba(14,165,233,.08)" }}>
      <div style={{ fontSize:".7rem", fontWeight:700, letterSpacing:".08em",
        textTransform:"uppercase", color:C.slate500, marginBottom:8 }}>{label}</div>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.8rem",
        fontWeight:700, color:c.val, lineHeight:1 }}>{value}</div>
    </div>
  );
}

const inputStyle = { padding:"9px 12px", border:`1px solid ${C.sky200}`, borderRadius:8,
  fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".875rem", color:C.slate900,
  background:C.white, outline:"none", width:"100%" };

function Input(props) { return <input style={inputStyle} {...props} />; }
function Select({ children, ...props }) {
  return <select style={{ ...inputStyle, cursor:"pointer" }} {...props}>{children}</select>;
}
function FormGroup({ label, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:".78rem", fontWeight:600, color:C.slate700 }}>{label}</label>
      {children}
    </div>
  );
}

function Btn({ children, variant="primary", size="md", onClick, style={} }) {
  const sizes = { md:{padding:"9px 18px",fontSize:".875rem"}, sm:{padding:"6px 13px",fontSize:".78rem"} };
  const variants = {
    primary: { background:C.sky600, color:C.white, boxShadow:"0 2px 8px rgba(2,132,199,.25)", border:"none" },
    outline: { background:C.white, color:C.sky700, border:`1px solid ${C.sky200}` },
    danger:  { background:C.red500, color:C.white, border:"none" },
  };
  return (
    <button onClick={onClick} style={{ display:"inline-flex", alignItems:"center", gap:7,
      fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600, cursor:"pointer",
      borderRadius:8, transition:"all .18s", ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function TableWrap({ children }) {
  return (
    <div style={{ overflowX:"auto", borderRadius:10, border:`1px solid ${C.sky100}` }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>{children}</table>
    </div>
  );
}
function Th({ children }) {
  return <th style={{ padding:"11px 16px", textAlign:"left", fontSize:".72rem", fontWeight:700,
    letterSpacing:".06em", textTransform:"uppercase", color:C.sky700, background:C.sky50,
    whiteSpace:"nowrap" }}>{children}</th>;
}
function Td({ children, style={} }) {
  return <td style={{ padding:"12px 16px", borderTop:`1px solid ${C.sky50}`,
    fontSize:".875rem", color:C.slate700, verticalAlign:"middle", ...style }}>{children}</td>;
}

function Toast({ message, type, visible }) {
  const bg = type==="success" ? "#166534" : type==="error" ? "#7f1d1d" : C.slate900;
  const border = type==="success" ? "#22c55e" : type==="error" ? C.red500 : C.sky600;
  return (
    <div style={{ position:"fixed", bottom:28, right:24, background:bg, color:C.white,
      padding:"12px 20px", borderRadius:10, fontSize:".85rem", fontWeight:500, zIndex:300,
      borderLeft:`4px solid ${border}`, transform:visible?"translateY(0)":"translateY(20px)",
      opacity:visible?1:0, transition:"all .3s", pointerEvents:"none" }}>{message}</div>
  );
}

const Icon = {
  Logo: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" fill="#0284c7" opacity=".15"/>
      <path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" stroke="#0284c7" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M12 3V21M4 7L12 11M20 7L12 11" stroke="#0284c7" strokeWidth="1.5"/>
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  Logout: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Plus: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Trash: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  ),
};

  //const API = "https://mess-management-system-q6us.onrender.com"
  const API = "http://localhost:8000"
/* ─── ADD FEE TAB ─── */
function AddFeeTab({ toast, feeSectionInfo }) {
  const [mode, setMode] = useState("manual");
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [deptFilter, setDeptFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [remark, setRemark] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const departments = feeSectionInfo?.applicableDepartments || [];
  const classes = ["S1","S2","S3","S4","S5","S6","S7","S8"];



  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  });

  // Fetch students for manual mode
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (deptFilter) params.append("department", deptFilter);
      if (classFilter) params.append("className", classFilter);
      const res = await fetch(`${API}/api/fee-section/students?${params}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setStudents(data || []);
      setSelected([]);
    } catch (err) {
      toast("Failed to load students", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (mode === "manual") fetchStudents();
    // eslint-disable-next-line
  }, [deptFilter, classFilter, mode]);

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(s =>
      s.name.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q)
    );
  }, [students, search]);

  const toggleSelect = (admNo) => {
    setSelected(prev =>
      prev.includes(admNo) ? prev.filter(x => x !== admNo) : [...prev, admNo]
    );
  };

  const toggleAll = (e) => {
    setSelected(e.target.checked ? filteredStudents.map(s => s.admissionNo) : []);
  };

  const handleSubmit = async () => {
    if (!amount || !dueDate) {
      toast("Amount and due date are required", "error");
      return;
    }
    if (mode === "manual" && selected.length === 0) {
      toast("Please select at least one student", "error");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        mode,
        amount: Number(amount),
        dueDate,
        remark,
        ...(mode === "manual" ? { admissionNos: selected } : { department: deptFilter, className: classFilter }),
      };

      const res = await fetch(`${API}/api/fee-section/add-fee`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.message || "Failed to add fee", "error");
      } else {
        toast(data.message, "success");
        setAmount("");
        setDueDate("");
        setRemark("");
        setSelected([]);
      }
    } catch (err) {
      toast("Network error", "error");
    }
    setSubmitting(false);
  };

  const modeBtn = (m, label) => (
    <button key={m} onClick={() => setMode(m)} style={{
      padding:"7px 16px", borderRadius:20, fontFamily:"'Plus Jakarta Sans',sans-serif",
      fontSize:".8rem", fontWeight:600, cursor:"pointer", transition:"all .18s",
      border:`1px solid ${mode===m ? C.sky600 : C.sky200}`,
      background: mode===m ? C.sky600 : C.white,
      color: mode===m ? C.white : C.slate500,
    }}>{label}</button>
  );

  return (
    <Card>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.15rem", fontWeight:700, marginBottom:4 }}>
          Add Fee to Students
        </h2>
        <p style={{ fontSize:".82rem", color:C.slate500 }}>
          Add fee manually to selected students or in bulk using filters
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        {modeBtn("manual", "Manual (Select Students)")}
        {modeBtn("bulk", "Bulk (By Filter)")}
      </div>

      {/* Fee details */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, marginBottom:20 }}>
        <FormGroup label="Filter by Department">
          <Select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </Select>
        </FormGroup>
        <FormGroup label="Filter by Class">
          <Select value={classFilter} onChange={e => setClassFilter(e.target.value)}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c}>{c}</option>)}
          </Select>
        </FormGroup>
        <FormGroup label="Amount (₹)">
          <Input type="number" placeholder="e.g. 5000" min="1"
            value={amount} onChange={e => setAmount(e.target.value)} />
        </FormGroup>
        <FormGroup label="Due Date">
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </FormGroup>
        <FormGroup label="Remark (optional)">
          <Input type="text" placeholder="e.g. Tuition Fee 2025-26"
            value={remark} onChange={e => setRemark(e.target.value)} />
        </FormGroup>
      </div>

      {/* Action Button Area (Moved from bottom to near Remark field) */}
      <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 12, borderBottom: `1px solid ${C.sky50}`, pb: 20 }}>
          {mode === "bulk" && (
              <div style={{ background:C.amber100, borderRadius:8, padding:"12px 16px",
                fontSize:".82rem", color:C.amber900, display:"flex", gap:8, width: "fit-content" }}>
                ⚠️ This will add fee to <strong>&nbsp;all students&nbsp;</strong> matching the filters above.
              </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Btn 
                variant={mode === "bulk" ? "danger" : "primary"}
                onClick={handleSubmit} 
                style={{ opacity: submitting ? 0.7 : 1 }}
              >
                <Icon.Plus /> {submitting ? "Adding…" : mode === "manual" ? `Add Fee to ${selected.length} Student(s)` : "Add Fee in Bulk"}
              </Btn>
              {mode === "manual" && (
                  <span style={{ fontSize:".82rem", color:C.slate500, fontWeight: 600 }}>
                    {selected.length} student{selected.length !== 1 ? "s" : ""} selected for charging
                  </span>
              )}
          </div>
      </div>

      {/* Manual mode — student table */}
      {mode === "manual" && (
        <>
          <div style={{ marginBottom:12 }}>
            <Input type="text" placeholder="Search by name or admission no..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, width:280 }} />
          </div>

          {loading ? (
            <p style={{ color:C.slate400, padding:"20px 0" }}>Loading students…</p>
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th><input type="checkbox" checked={selected.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={toggleAll} style={{ accentColor:C.sky600 }} /></Th>
                  <Th>Adm No</Th><Th>Name</Th><Th>Department</Th><Th>Class</Th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign:"center", padding:32, color:C.slate400 }}>
                    No students found
                  </td></tr>
                ) : filteredStudents.map(s => (
                  <tr key={s._id} style={{ cursor:"pointer" }} onClick={() => toggleSelect(s.admissionNo)}>
                    <Td><input type="checkbox" checked={selected.includes(s.admissionNo)}
                      onChange={() => toggleSelect(s.admissionNo)}
                      onClick={e => e.stopPropagation()} style={{ accentColor:C.sky600 }} /></Td>
                    <Td style={{ fontSize:".78rem", color:C.slate400 }}>{s.admissionNo}</Td>
                    <Td style={{ fontWeight:500 }}>{s.name}</Td>
                    <Td style={{ fontSize:".78rem" }}>{s.department?.name}</Td>
                    <Td><Chip>{s.className}</Chip></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}

        </>
      )}
    </Card>
  );
}

/* ─── DUE SHEET TAB ─── */
function DueSheetTab({ toast, feeSectionInfo }) {
  const [dues, setDues] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [exportModal, setExportModal] = useState(false);

  const departments = feeSectionInfo?.applicableDepartments || [];
  const classes = ["S1","S2","S3","S4","S5","S6","S7","S8"];

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  });

  const fetchDues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (deptFilter) params.append("department", deptFilter);
      if (classFilter) params.append("className", classFilter);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`${API}/api/fee-section/due-sheet?${params}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setDues(data.dues || []);
      setSummary(data.summary || {});
    } catch (err) {
      toast("Failed to load due sheet", "error");
    }
    setLoading(false);
  };

  const handleDelete = async (dueId) => {
    if (!window.confirm("Are you sure you want to delete this fee record?")) return;
    try {
      const res = await fetch(`${API}/api/fee-section/delete-fee`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ dueId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast(data.message, "success");
        fetchDues();
      } else {
        toast(data.message || "Deletion failed", "error");
      }
    } catch (err) {
      toast("Network error", "error");
    }
  };

  useEffect(() => { fetchDues(); }, [deptFilter, classFilter, statusFilter]); // eslint-disable-line

  const filteredDues = useMemo(() => {
    if (!search) return dues;
    const q = search.toLowerCase();
    return dues.filter(d =>
      d.name.toLowerCase().includes(q) || d.admissionNo.toLowerCase().includes(q)
    );
  }, [dues, search]);

  const generatePdf = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.text(`${feeSectionInfo?.name || "Fee Section"} — Due Sheet`, 14, 15);
    autoTable(doc, {
      head: [["Adm No", "Name", "Department", "Class", "Amount", "Due Date", "Status"]],
      body: filteredDues.map(r => [r.admissionNo, r.name, r.department,
        r.className, `Rs. ${r.amount}`, r.dueDate, r.status]),
      startY: 20,
      styles: { fontSize:9, cellPadding:4 },
      headStyles: { fillColor:[2,132,199], textColor:[255,255,255], fontStyle:"bold" },
      alternateRowStyles: { fillColor:[241,245,249] },
      theme: "grid",
    });
    doc.save(`DueSheet_${feeSectionInfo?.name || "FeeSection"}.pdf`);
    toast("PDF downloaded!", "success");
  };

  const generateCsv = () => {
    let csv = "data:text/csv;charset=utf-8,Adm No,Name,Department,Class,Amount,Due Date,Status\n";
    filteredDues.forEach(r => {
      csv += `"${r.admissionNo}","${r.name}","${r.department}","${r.className}",${r.amount},"${r.dueDate}","${r.status}"\n`;
    });
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `DueSheet_${feeSectionInfo?.name || "FeeSection"}.csv`;
    link.click();
    toast("CSV downloaded!", "success");
  };

  return (
    <>
      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        <StatCard label="Total Students" value={summary.total ?? 0} accent="sky" />
        <StatCard label="Pending" value={summary.pending ?? 0} accent="red" />
        <StatCard label="Paid" value={summary.paid ?? 0} accent="green" />
        <StatCard label="Total Due Amount"
          value={`₹${(summary.totalAmount ?? 0).toLocaleString("en-IN")}`} accent="amber" />
      </div>

      <Card>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.15rem", fontWeight:700, marginBottom:4 }}>
              Due Sheet
            </h2>
            <p style={{ fontSize:".82rem", color:C.slate500 }}>
              Students with dues in {feeSectionInfo?.name || "this fee section"}
            </p>
          </div>
          <Btn size="sm" onClick={() => setExportModal(true)}>
            <Icon.Download /> Download
          </Btn>
        </div>

        {/* Filters */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",
          gap:12, marginBottom:18 }}>
          <FormGroup label="Department">
            <Select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Class">
            <Select value={classFilter} onChange={e => setClassFilter(e.target.value)}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c}>{c}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Status">
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </Select>
          </FormGroup>
          <FormGroup label="Search">
            <Input type="text" placeholder="Name or Adm No..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </FormGroup>
        </div>

        {/* Table */}
        {loading ? (
          <p style={{ color:C.slate400, padding:"20px 0" }}>Loading due sheet…</p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Adm No</Th><Th>Name</Th><Th>Department</Th>
                <Th>Class</Th><Th>Amount</Th><Th>Due Date</Th><Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredDues.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign:"center", padding:32, color:C.slate400 }}>
                  No records found
                </td></tr>
              ) : filteredDues.map((r, i) => (
                <tr key={i}>
                  <Td style={{ fontSize:".78rem", color:C.slate400 }}>{r.admissionNo}</Td>
                  <Td style={{ fontWeight:600 }}>{r.name}</Td>
                  <Td style={{ fontSize:".78rem" }}>{r.department}</Td>
                  <Td><Chip>{r.className}</Chip></Td>
                  <Td style={{ fontWeight:700, color: r.status==="pending" ? C.red500 : C.slate700 }}>
                    ₹{r.amount.toLocaleString("en-IN")}
                  </Td>
                  <Td style={{ color:C.slate500, fontSize:".82rem" }}>{r.dueDate}</Td>
                  <Td><Badge status={r.status} /></Td>
                  <Td>
                    {r.status === "pending" && (
                      <button 
                        onClick={() => handleDelete(r._id)}
                        style={{ background:"none", border:"none", color:C.red500, cursor:"pointer", padding:5, borderRadius:6, transition:".2s" }}
                        title="Delete Fee"
                      >
                        <Icon.Trash />
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      {/* Export modal */}
      {exportModal && (
        <div onClick={() => setExportModal(false)} style={{ position:"fixed", inset:0,
          background:"rgba(15,23,42,.45)", backdropFilter:"blur(3px)", zIndex:200,
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:24,
            padding:28, width:"100%", maxWidth:400, boxShadow:"0 10px 32px rgba(14,165,233,.16)" }}>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.1rem", fontWeight:700, marginBottom:20 }}>
              Download Due Sheet
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <Btn variant="outline" onClick={() => { setExportModal(false); generatePdf(); }}
                style={{ justifyContent:"center", padding:14 }}>
                Download PDF
              </Btn>
              <Btn variant="outline" onClick={() => { setExportModal(false); generateCsv(); }}
                style={{ justifyContent:"center", padding:14 }}>
                Download CSV / Excel
              </Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── ROOT ─── */
export default function FeeSectionDashboard() {
  const [activeTab, setActiveTab] = useState("due-sheet");
  const [feeSectionInfo, setFeeSectionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("");
  const [toastVis, setToastVis] = useState(false);
  const navigate = useNavigate();

  const toast = (msg, type = "") => {
    setToastMsg(msg); setToastType(type); setToastVis(true);
    setTimeout(() => setToastVis(false), 2800);
  };

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  });

  useEffect(() => {
    fetch(`${API}/api/fee-section/info`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => { setFeeSectionInfo(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line

  const tabs = [
    { id: "due-sheet", label: "Due Sheet" },
    { id: "add-fee", label: "Add Fee" },
  ];

  return (
    <>
      {/* Navbar */}
      <nav style={{ background:C.white, borderBottom:`1px solid ${C.sky200}`, padding:"0 24px",
        height:60, display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 3px rgba(14,165,233,.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Icon.Logo />
          <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:"1.25rem",
            color:C.sky600, letterSpacing:"-.5px" }}>UNIPAY</span>
          <span style={{ background:C.sky100, color:C.sky700, fontSize:".7rem", fontWeight:700,
            padding:"3px 10px", borderRadius:20, letterSpacing:".5px" }}>FEE SECTION</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:".85rem", fontWeight:600 }}>
              {feeSectionInfo?.name || "Fee Section"}
            </div>
            <div style={{ fontSize:".75rem", color:C.slate500 }}>
              {loading ? "Loading…" :
                `${feeSectionInfo?.applicableDepartments?.length || 0} department(s)`}
            </div>
          </div>
          <div style={{ width:36, height:36, borderRadius:"50%", background:C.sky100,
            display:"flex", alignItems:"center", justifyContent:"center", color:C.sky600 }}>
            <Icon.User />
          </div>
          <button onClick={() => {
            sessionStorage.clear();
            navigate("/login");
          }} style={{ display:"flex", alignItems:"center", gap:6, background:"none",
            border:`1px solid ${C.slate200}`, borderRadius:8, padding:"6px 14px",
            fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".8rem",
            fontWeight:500, color:C.slate500, cursor:"pointer" }}>
            <Icon.Logout /> Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.8rem", fontWeight:700 }}>
            {feeSectionInfo?.name || "Fee Section"} Dashboard
          </h1>
          <p style={{ fontSize:".9rem", color:C.slate500, marginTop:4 }}>
            Manage fee collection and view dues
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display:"flex", gap:4, background:C.white, borderRadius:12, padding:5,
          border:`1px solid ${C.sky100}`, boxShadow:"0 1px 3px rgba(14,165,233,.08)",
          marginBottom:28, width:"fit-content" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding:"8px 20px", border:"none", borderRadius:8,
              fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".875rem",
              fontWeight:500, cursor:"pointer", transition:"all .18s",
              background: activeTab===t.id ? C.sky600 : "transparent",
              color: activeTab===t.id ? C.white : C.slate500,
              boxShadow: activeTab===t.id ? "0 2px 8px rgba(2,132,199,.3)" : "none",
            }}>{t.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:C.slate400 }}>
            Loading…
          </div>
        ) : (
          <>
            {activeTab === "due-sheet" && (
              <DueSheetTab toast={toast} feeSectionInfo={feeSectionInfo} />
            )}
            {activeTab === "add-fee" && (
              <AddFeeTab toast={toast} feeSectionInfo={feeSectionInfo} />
            )}
          </>
        )}
      </div>

      <Toast message={toastMsg} type={toastType} visible={toastVis} />
    </>
  );
}