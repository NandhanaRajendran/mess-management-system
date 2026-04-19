import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const FINE_CATS = [
  "Dept.Library Fine",
  "Lab Damage",
  "Disciplinary Fine",
  "Other",
];
/* ─────────────────────────────────────────────
   STYLE CONSTANTS  (inline style objects)
───────────────────────────────────────────── */
const C = {
  sky50: "#f0f9ff",
  sky100: "#e0f2fe",
  sky200: "#bae6fd",
  sky300: "#7dd3fc",
  sky400: "#38bdf8",
  sky500: "#0ea5e9",
  sky600: "#0284c7",
  sky700: "#0369a1",
  sky800: "#075985",
  sky900: "#0c4a6e",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate700: "#334155",
  slate900: "#0f172a",
  green100: "#dcfce7",
  green700: "#15803d",
  amber100: "#fef3c7",
  amber900: "#78350f",
  red50: "#fff1f2",
  red100: "#fee2e2",
  red500: "#ef4444",
  red700: "#b91c1c",
  white: "#ffffff",
};

/* ─────────────────────────────────────────────
   SMALL REUSABLE COMPONENTS
───────────────────────────────────────────── */

function Badge({ status }) {
  const styles = {
    Published: { bg: C.green100, color: C.green700 },
    Pending: { bg: C.amber100, color: C.amber900 },
    Paid: { bg: C.green100, color: C.green700 },
    Due: { bg: C.red100, color: C.red700 },
  };
  const s = styles[status] || { bg: C.sky100, color: C.sky700 };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: ".72rem",
        fontWeight: 700,
        background: s.bg,
        color: s.color,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "currentColor",
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}

function Chip({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 12,
        fontSize: ".72rem",
        fontWeight: 700,
        background: C.sky100,
        color: C.sky700,
      }}
    >
      {children}
    </span>
  );
}

function Btn({
  children,
  variant = "primary",
  size = "md",
  onClick,
  style = {},
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    border: "none",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    fontWeight: 600,
    cursor: "pointer",
    borderRadius: 8,
    transition: "all .18s",
    ...style,
  };
  const sizes = {
    md: { padding: "9px 18px", fontSize: ".875rem" },
    sm: { padding: "6px 13px", fontSize: ".78rem" },
  };
  const variants = {
    primary: {
      background: C.sky600,
      color: C.white,
      boxShadow: "0 2px 8px rgba(2,132,199,.25)",
    },
    outline: {
      background: C.white,
      color: C.sky700,
      border: `1px solid ${C.sky300}`,
    },
    danger: {
      background: C.red500,
      color: C.white,
      boxShadow: "0 2px 8px rgba(239,68,68,.25)",
    },
    ghost: {
      background: "transparent",
      color: C.slate500,
      border: `1px solid ${C.slate200}`,
    },
  };
  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant] }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 18,
        border: `1px solid ${C.sky100}`,
        boxShadow: "0 1px 3px rgba(14,165,233,.08)",
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value, accent = "sky", style = {} }) {
  const colors = {
    sky: { border: C.sky200, val: C.sky600 },
    green: { border: "#bbf7d0", val: "#16a34a" },
    amber: { border: "#fed7aa", val: "#d97706" },
    red: { border: C.red100, val: C.red500 },
  };
  const c = colors[accent] || colors.sky;
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 12,
        padding: "18px 20px",
        border: `2px solid ${c.border}`,
        boxShadow: "0 1px 3px rgba(14,165,233,.08)",
        ...style,
      }}
    >
      <div
        style={{
          fontSize: ".7rem",
          fontWeight: 700,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: C.slate500,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Sora',sans-serif",
          fontSize: "1.8rem",
          fontWeight: 700,
          color: c.val,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: ".78rem", fontWeight: 600, color: C.slate700 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: "9px 12px",
  border: `1px solid ${C.sky200}`,
  borderRadius: 8,
  fontFamily: "'Plus Jakarta Sans',sans-serif",
  fontSize: ".875rem",
  color: C.slate900,
  background: C.white,
  outline: "none",
  width: "100%",
};

function Input(props) {
  return <input style={inputStyle} {...props} />;
}

function Select({ children, ...props }) {
  return (
    <select style={{ ...inputStyle, cursor: "pointer" }} {...props}>
      {children}
    </select>
  );
}

function TableWrap({ children }) {
  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: 10,
        border: `1px solid ${C.sky100}`,
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        {children}
      </table>
    </div>
  );
}

function Th({ children, style = {} }) {
  return (
    <th
      style={{
        padding: "11px 16px",
        textAlign: "left",
        fontSize: ".72rem",
        fontWeight: 700,
        letterSpacing: ".06em",
        textTransform: "uppercase",
        color: C.sky700,
        background: C.sky50,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, style = {} }) {
  return (
    <td
      style={{
        padding: "12px 16px",
        borderTop: `1px solid ${C.sky50}`,
        fontSize: ".875rem",
        color: C.slate700,
        verticalAlign: "middle",
        ...style,
      }}
    >
      {children}
    </td>
  );
}

/* ─────────────────────────────────────────────
   SVG ICON HELPERS
───────────────────────────────────────────── */
const Icon = {
  Plus: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Download: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Check: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Cross: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Warn: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ flexShrink: 0, marginTop: 1 }}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Logout: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  User: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  Logo: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" fill="#0284c7" opacity=".15" />
      <path
        d="M12 3L20 7V17L12 21L4 17V7L12 3Z"
        stroke="#0284c7"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 3V21M4 7L12 11M20 7L12 11"
        stroke="#0284c7"
        strokeWidth="1.5"
      />
    </svg>
  ),
  Info: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
};

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function Toast({ message, type, visible }) {
  const bg =
    type === "success" ? "#166534" : type === "error" ? "#7f1d1d" : C.slate900;
  const border =
    type === "success" ? "#22c55e" : type === "error" ? C.red500 : C.sky500;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 24,
        background: bg,
        color: C.white,
        padding: "12px 20px",
        borderRadius: 10,
        fontSize: ".85rem",
        fontWeight: 500,
        zIndex: 300,
        borderLeft: `4px solid ${border}`,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        opacity: visible ? 1 : 0,
        transition: "all .3s",
        pointerEvents: "none",
      }}
    >
      {message}
    </div>
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
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.45)",
        backdropFilter: "blur(3px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.white,
          borderRadius: 24,
          padding: 28,
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 32px rgba(14,165,233,.16)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "1.1rem",
              fontWeight: 700,
            }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              color: C.slate400,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
        {footer && (
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 22,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

const API = "https://mess-management-system-q6us.onrender.com"
//const API = "http://localhost:8000"

/* ─────────────────────────────────────────────
   FEE MANAGEMENT TAB
───────────────────────────────────────────── */
function FeeManagement({
  toast,
  finesHistory,
  onAddFines,
  onDeleteFine,
  students,
  sems,
  depts,
  currentRefId,
}) {
  const [fineMode, setFineMode] = useState("individual");
  const [indvSem, setIndvSem] = useState("");
  const [indvDept, setIndvDept] = useState("");
  const [indvStudent, setIndvStudent] = useState("");
  const [selSem, setSelSem] = useState("");
  const [selDept, setSelDept] = useState("");
  const [selected, setSelected] = useState({});
  const [classSem, setClassSem] = useState("");
  const [classDept, setClassDept] = useState("");
  const [fineCat, setFineCat] = useState(FINE_CATS[0]);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [remark, setRemark] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [finesClassFilter, setFinesClassFilter] = useState("");
  const [finesDeptFilter] = useState("");
  const [finesSearch, setFinesSearch] = useState("");
  const [finesExportModal, setFinesExportModal] = useState(false);


  const handleDeleteFine = async (fineId) => {
    if (!window.confirm("Are you sure you want to delete this fine?")) return;

    console.log("Deleting fine:", fineId);

    try {
      const res = await fetch(`${API}/api/admin/delete-fine`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ fineId }),
      });

      console.log("Delete response status:", res.status);
      const data = await res.json();
      console.log("Delete response data:", data);

      if (!res.ok) {
        toast(data.message || "Failed to delete fine", "error");
        return;
      }

      toast("Fine deleted!", "success");
      onDeleteFine(fineId);
    } catch (err) {
      console.log("Delete fine error:", err.message); // ✅ add
      toast("Network error", "error");
    }
  };

  const generateFinesPdf = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.text(`Fines & Fees Report`, 14, 15);
    const tableColumn = [
      "Adm No",
      "Name",
      "Dept",
      "Semester",
      "Remarks / Category",
      "Amount",
      "Due Date",
      "Status",
      "Charged By",
    ];
    const tableRows = filteredFines.map((r) => [
      r.id,
      r.name,
      r.dept,
      r.sem,
      r.remark || r.cat,
      r.amt,
      r.due,
      r.status,
      r.addedByDept || "N/A",
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 9, cellPadding: 4, textColor: [30, 41, 59] },
      headStyles: {
        fillColor: [2, 132, 199],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      theme: "grid",
    });
    doc.save(`Fines_Report.pdf`);
    toast("PDF Generated!", "success");
  };

  const generateFinesExcel = () => {
    let csv =
      "data:text/csv;charset=utf-8,Adm No,Name,Dept,Semester,Remarks/Category,Amount,Due Date,Status,Charged By\n";
    filteredFines.forEach((r) => {
      csv += `"${r.id}","${r.name}","${r.dept}","${r.sem}","${r.remark || r.cat}","${r.amt}","${r.due}","${r.status}","${r.addedByDept || "N/A"}"\n`;
    });
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `Fines_Report.csv`;
    link.click();
    toast("Excel Generated!", "success");
  };

  const filteredFines = useMemo(() => {
    let list = finesHistory.filter(
      (f) => f.status !== "Pending Approval" && f.status !== "Rejected",
    );
    if (finesClassFilter) list = list.filter((f) => f.sem === finesClassFilter);
    if (finesDeptFilter) list = list.filter((f) => f.dept === finesDeptFilter);
    if (finesSearch) {
      const q = finesSearch.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q),
      );
    }
    return list;
  }, [finesHistory, finesClassFilter, finesSearch, finesDeptFilter]);

  const pendingApprovals = useMemo(
    () => finesHistory.filter((f) => f.status === "Pending Approval"),
    [finesHistory],
  );

  const handleApprove = async (id, isApprove) => {
    try {
      const payload = {
        fineId: id,
        action: isApprove ? "approve" : "reject",
      };

      const res = await fetch(`${API}/api/admin/approve-fine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast(`Fine ${isApprove ? "Approved" : "Rejected"}!`, "success");
      } else {
        toast("Failed to process approval", "error");
      }
    } catch (e) {
      toast("Network Error", "error");
    }
  };

  const semStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          (!selSem || s.sem === selSem) && (!selDept || s.dept === selDept),
      ),
    [selSem, selDept, students],
  );
  const indvStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          (!indvSem || s.sem === indvSem) && (!indvDept || s.dept === indvDept),
      ),
    [indvSem, indvDept, students],
  );

  const selCount = Object.values(selected).filter(Boolean).length;

  const toggleOne = (id) => setSelected((p) => ({ ...p, [id]: !p[id] }));
  const toggleAll = (e) => {
    const nxt = {};
    semStudents.forEach((s) => (nxt[s.id] = e.target.checked));
    setSelected(nxt);
  };
  const allChecked =
    semStudents.length > 0 && semStudents.every((s) => selected[s.id]);

  const modeBtn = (mode, label) => (
    <button
      key={mode}
      onClick={() => setFineMode(mode)}
      style={{
        padding: "7px 16px",
        border: `1px solid ${fineMode === mode ? C.sky600 : C.sky200}`,
        borderRadius: 20,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        fontSize: ".8rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all .18s",
        background: fineMode === mode ? C.sky600 : C.white,
        color: fineMode === mode ? C.white : C.slate500,
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <Card>
        <div style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "1.15rem",
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            Add Fine / Fees
          </h2>
          <p style={{ fontSize: ".82rem", color: C.slate500 }}>
            Assign fines to individual students, selected students, or an entire
            class
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          {modeBtn("individual", "Individual Student")}
          {modeBtn("selected", "Selected Students")}
          {modeBtn("class", "Entire Class")}
        </div>

        {/* ── INDIVIDUAL ── */}
        {fineMode === "individual" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <FormGroup label="Department">
                <Select
                  value={indvDept}
                  onChange={(e) => {
                    setIndvDept(e.target.value);
                    setIndvStudent("");
                  }}
                >
                  <option value="">All Departments</option>
                  {depts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Semester">
                <Select
                  value={indvSem}
                  onChange={(e) => {
                    setIndvSem(e.target.value);
                    setIndvStudent("");
                  }}
                >
                  <option value="">Select Semester</option>
                  {sems.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Student">
                <Select
                  value={indvStudent}
                  onChange={(e) => setIndvStudent(e.target.value)}
                >
                  <option value="">Select Student</option>
                  {indvStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Fine Category">
                <Select
                  value={fineCat}
                  onChange={(e) => setFineCat(e.target.value)}
                >
                  {FINE_CATS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Amount (₹)">
                <Input
                  type="number"
                  placeholder="e.g. 500"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Due Date">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </FormGroup>
              <FormGroup label={fineCat === "Other" ? "Remark *" : "Remark"}>
                <Input
                  type="text"
                  placeholder={
                    fineCat === "Other"
                      ? "Required for 'Other'"
                      : "Optional note"
                  }
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </FormGroup>
            </div>
            <Btn
              onClick={() => {
                if (
                  !indvStudent ||
                  !fineCat ||
                  !amount ||
                  !dueDate ||
                  (fineCat === "Other" && !remark)
                ) {
                  toast("Please fill in all required fields", "error");
                  return;
                }
                const student = students.find((s) => s.id === indvStudent);
                const newFine = {
                  id: student.id,
                  name: student.name,
                  sem: student.sem,
                  cat: fineCat,
                  amt: `₹${Number(amount).toLocaleString()}`,
                  due: dueDate || "-",
                  status: "Pending",
                  rawAmount: Number(amount),
                };
                onAddFines([newFine]);
                toast("Fine added successfully!", "success");
                setAmount("");
                setRemark("");
              }}
            >
              <Icon.Plus /> Add Fine
            </Btn>
          </div>
        )}

        {/* ── SELECTED STUDENTS ── */}
        {fineMode === "selected" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <FormGroup label="Department">
                <Select
                  value={selDept}
                  onChange={(e) => {
                    setSelDept(e.target.value);
                    setSelected({});
                  }}
                >
                  <option value="">All Departments</option>
                  {depts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Semester">
                <Select
                  value={selSem}
                  onChange={(e) => {
                    setSelSem(e.target.value);
                    setSelected({});
                  }}
                >
                  <option value="">Select Semester</option>
                  {sems.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Fine Category">
                <Select
                  value={fineCat}
                  onChange={(e) => setFineCat(e.target.value)}
                >
                  {FINE_CATS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Amount (₹)">
                <Input
                  type="number"
                  placeholder="500"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Due Date">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </FormGroup>
              <FormGroup label={fineCat === "Other" ? "Remark *" : "Remark"}>
                <Input
                  type="text"
                  placeholder={
                    fineCat === "Other"
                      ? "Required for 'Other'"
                      : "Optional note"
                  }
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </FormGroup>
            </div>
            <TableWrap>
              <thead>
                <tr>
                  <Th>
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                      style={{ accentColor: C.sky600 }}
                    />
                  </Th>
                  <Th>Adm No</Th>
                  <Th>Name</Th>
                  <Th>Semester</Th>
                </tr>
              </thead>
              <tbody>
                {semStudents.length === 0 ? (
                  <tr>
                    <Td
                      style={{ textAlign: "center", color: C.slate400 }}
                      colSpan={5}
                    >
                      Select a semester to load students
                    </Td>
                  </tr>
                ) : (
                  semStudents.map((s) => (
                    <tr
                      key={s.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleOne(s.id)}
                    >
                      <Td>
                        <input
                          type="checkbox"
                          checked={!!selected[s.id]}
                          onChange={() => toggleOne(s.id)}
                          style={{ accentColor: C.sky600 }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Td>
                      <Td style={{ fontSize: ".78rem", color: C.slate400 }}>
                        {s.id}
                      </Td>
                      <Td style={{ fontWeight: 500 }}>{s.name}</Td>
                      <Td>
                        <Chip>{s.sem}</Chip>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </TableWrap>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginTop: 16,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: ".82rem", color: C.slate500 }}>
                {selCount} student{selCount !== 1 ? "s" : ""} selected
              </span>
              <Btn
                onClick={() => {
                  const selectedIds = Object.keys(selected).filter(
                    (id) => selected[id],
                  );
                  if (
                    selectedIds.length === 0 ||
                    !fineCat ||
                    !amount ||
                    !dueDate ||
                    (fineCat === "Other" && !remark)
                  ) {
                    toast(
                      "Please fill in all required fields and select students",
                      "error",
                    );
                    return;
                  }
                  const newFines = selectedIds.map((id) => {
                    const student = students.find((s) => s.id === id);
                    return {
                      id: student.id,
                      name: student.name,
                      sem: student.sem,
                      cat: fineCat,
                      amt: `₹${Number(amount).toLocaleString()}`,
                      due: dueDate || "-",
                      status: "Pending",
                      rawAmount: Number(amount),
                    };
                  });
                  onAddFines(newFines);
                  toast(`Fine added to ${selCount} student(s)!`, "success");
                  setSelected({});
                  setAmount("");
                  setRemark("");
                }}
              >
                <Icon.Plus /> Add Fine to Selected
              </Btn>
            </div>
          </div>
        )}

        {/* ── ENTIRE CLASS ── */}
        {fineMode === "class" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <FormGroup label="Department">
                <Select
                  value={classDept}
                  onChange={(e) => setClassDept(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {depts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Semester">
                <Select
                  value={classSem}
                  onChange={(e) => setClassSem(e.target.value)}
                >
                  <option value="">Select Semester</option>
                  {sems.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Fine Category">
                <Select
                  value={fineCat}
                  onChange={(e) => setFineCat(e.target.value)}
                >
                  {FINE_CATS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Amount per Student (₹)">
                <Input
                  type="number"
                  placeholder="500"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Due Date">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </FormGroup>
              <FormGroup
                label={fineCat === "Other" ? "Remark *" : "Remark"}
                style={{ gridColumn: "1/-1" }}
              >
                <Input
                  type="text"
                  placeholder={
                    fineCat === "Other"
                      ? "Required for 'Other'"
                      : "e.g. Library dues – March 2026"
                  }
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </FormGroup>
            </div>
            <div
              style={{
                background: C.amber100,
                borderRadius: 8,
                padding: "12px 16px",
                fontSize: ".82rem",
                color: C.amber900,
                marginBottom: 16,
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <Icon.Warn />
              This will apply the fine to{" "}
              <strong>&nbsp;all students&nbsp;</strong> in the selected semester
              class.
            </div>
            <Btn variant="danger" onClick={() => setConfirmOpen(true)}>
              <Icon.Warn /> Add Fine to Entire Class
            </Btn>
          </div>
        )}
      </Card>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card style={{ marginTop: 20, borderColor: C.amber900 }}>
          <div style={{ marginBottom: 16 }}>
            <h3
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1rem",
                fontWeight: 700,
                color: C.amber900,
              }}
            >
              Pending Approvals (Staff Issued)
            </h3>
            <p style={{ fontSize: ".78rem", color: C.slate500, marginTop: 2 }}>
              Fines issued by lab staff or advisors requiring your
              authorization.
            </p>
          </div>
          <TableWrap>
            <thead>
              <tr>
                <Th>Adm No</Th>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Issuer Role</Th>
                <Th>Amount</Th>
                <Th>Due Date</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((r, i) => (
                <tr key={i}>
                  <Td style={{ fontSize: ".78rem", color: C.slate400 }}>
                    {r.id}
                  </Td>
                  <Td style={{ fontWeight: 500 }}>{r.name}</Td>
                  <Td>{r.cat}</Td>
                  <Td>{r.issuer || "Staff Advisor"}</Td>
                  <Td style={{ fontWeight: 700, color: C.red500 }}>{r.amt}</Td>
                  <Td style={{ color: C.slate500, fontSize: ".82rem" }}>
                    {r.due}
                  </Td>
                  <Td style={{ display: "flex", gap: "8px" }}>
                    <Btn
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(r._id || r.rawId, true)}
                      style={{
                        borderColor: "#16a34a",
                        color: "#16a34a",
                        padding: "6px 10px",
                      }}
                      title="Approve"
                    >
                      <Icon.Check />
                    </Btn>
                    <Btn
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(r._id || r.rawId, false)}
                      style={{
                        borderColor: C.red500,
                        color: C.red500,
                        padding: "6px 10px",
                      }}
                      title="Reject"
                    >
                      <Icon.Cross />
                    </Btn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Card>
      )}

      {/* Recent Fines */}
      <Card style={{ marginTop: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              Fines Added
            </h3>
            <p style={{ fontSize: ".78rem", color: C.slate500, marginTop: 2 }}>
              All generated fines and fees
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Select
              value={finesClassFilter}
              onChange={(e) => setFinesClassFilter(e.target.value)}
              style={{ width: 140, padding: "6px 10px", fontSize: ".8rem" }}
            >
              <option value="">All Classes</option>
              {sems.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <Input
              type="text"
              placeholder="Search name or ID..."
              value={finesSearch}
              onChange={(e) => setFinesSearch(e.target.value)}
              style={{ width: 180, padding: "6px 10px", fontSize: ".8rem" }}
            />
            <Btn
              variant="primary"
              size="sm"
              onClick={() => setFinesExportModal(true)}
            >
              <Icon.Download /> Download Options
            </Btn>
          </div>
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th>Adm No</Th>
              <Th>Name</Th>
              <Th>Dept</Th>
              <Th>Semester</Th>
              <Th>Remarks / Category</Th>
              <Th>Amount</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
              <Th>Fine Charged By</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {filteredFines.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    textAlign: "center",
                    padding: 32,
                    color: C.slate400,
                  }}
                >
                  No fines found
                </td>
              </tr>
            ) : (
              filteredFines.map((r, i) => (
                <tr key={i}>
                  <Td style={{ fontSize: ".78rem", color: C.slate400 }}>
                    {r.id}
                  </Td>
                  <Td style={{ fontWeight: 500 }}>{r.name}</Td>
                  <Td style={{ fontSize: ".78rem" }}>{r.dept}</Td>
                  <Td>
                    <Chip>{r.sem}</Chip>
                  </Td>
                  <Td>{r.remark || r.cat}</Td>
                  <Td
                    style={{
                      fontWeight: 700,
                      color: r.status === "Paid" ? C.slate700 : C.red500,
                    }}
                  >
                    {r.amt}
                  </Td>
                  <Td style={{ color: C.slate500, fontSize: ".82rem" }}>
                    {r.due}
                  </Td>
                  <Td>
                    <Badge status={r.status} />
                  </Td>
                  <Td style={{ fontSize: ".72rem", fontWeight: 600, color: C.slate500 }}>
                    <Chip>{r.addedByDept || "N/A"}</Chip>
                  </Td>
                  <Td>
                    {/* ✅ only show delete if this HOD added it */}
                    {r.addedByRef === currentRefId && (
                      <Btn
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFine(r._id || r.rawId)}
                        style={{
                          borderColor: C.red500,
                          color: C.red500,
                          padding: "6px 10px",
                        }}
                        title="Delete Fine"
                      >
                        <Icon.Trash />
                      </Btn>
                    )}
                  </Td>
                </tr>
              ))
            )}
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
            <Btn variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Btn>
            <Btn
              variant="danger"
              onClick={() => {
                setConfirmOpen(false);
                const classStudents = students.filter(
                  (s) =>
                    (!classSem || s.sem === classSem) &&
                    (!classDept || s.dept === classDept),
                );
                if (classStudents.length === 0) {
                  toast("No students matched this filter", "error");
                  return;
                }
                if (
                  !fineCat ||
                  !amount ||
                  !dueDate ||
                  (fineCat === "Other" && !remark)
                ) {
                  toast("Please fill in all required fields", "error");
                  return;
                }
                const newFines = classStudents.map((student) => ({
                  id: student.id,
                  name: student.name,
                  sem: student.sem,
                  cat: fineCat,
                  amt: `₹${Number(amount).toLocaleString()}`,
                  due: dueDate || "-",
                  status: "Pending",
                  rawAmount: Number(amount),
                }));
                onAddFines(newFines);
                toast("Fine applied to entire class!", "success");
                setAmount("");
                setRemark("");
              }}
            >
              Yes, Apply Fine
            </Btn>
          </>
        }
      >
        <p style={{ fontSize: ".9rem", color: C.slate600, lineHeight: 1.6 }}>
          You are about to apply a fine to <strong>all students</strong> in the
          selected semester. This action cannot be undone automatically. Are you
          sure?
        </p>
      </Modal>

      <Modal
        open={finesExportModal}
        title="Select Download Format"
        onClose={() => setFinesExportModal(false)}
      >
        <p style={{ fontSize: ".85rem", color: C.slate500, marginBottom: 20 }}>
          Select the format to export your Fines & Fees tracking view.
        </p>
        <div style={{ display: "flex", gap: 14, flexDirection: "column" }}>
          <Btn
            variant="outline"
            onClick={() => {
              setFinesExportModal(false);
              generateFinesPdf();
            }}
            style={{ justifyContent: "center", padding: "14px" }}
          >
            <span style={{ fontWeight: 800 }}>Download PDF Report</span>
          </Btn>
          <Btn
            variant="outline"
            onClick={() => {
              setFinesExportModal(false);
              generateFinesExcel();
            }}
            style={{ justifyContent: "center", padding: "14px" }}
          >
            <span style={{ fontWeight: 800 }}>Download Excel (CSV)</span>
          </Btn>
        </div>
      </Modal>
    </>
  );
}

/* ─────────────────────────────────────────────
   FEE CATEGORIES TAB
───────────────────────────────────────────── */
function FeeCategories({ feeData, sems }) {
  const [sem, setSem] = useState("");

  // set default to last sem when sems loads
  useEffect(() => {
    if (sems.length > 0) setSem(sems[sems.length - 1]);
  }, [sems]);
  const rows = feeData[sem] || [];
  const published = rows.filter((r) => r.status === "Published").length;
  const pending = rows.filter((r) => r.status === "Pending").length;

  const rawSum = rows.reduce(
    (sum, r) => sum + Number(r.amount.replace(/[^0-9.-]+/g, "")),
    0,
  );
  const totalAmt = `₹${rawSum.toLocaleString("en-IN")}`;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard label="Total Payable" value={totalAmt} accent="sky" />
        <StatCard label="Categories" value={rows.length} accent="sky" />
        <StatCard label="Published" value={published} accent="green" />
        <StatCard label="Pending" value={pending} accent="amber" />
      </div>
      <Card>
        <p style={{ fontSize: ".82rem", color: C.slate500, marginBottom: 16 }}>
          Published fee structure by semester — B.Tech
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            {sems.map((s) => (
              <button
                key={s}
                onClick={() => setSem(s)}
                style={{
                  padding: "6px 14px",
                  border: `1px solid ${sem === s ? C.sky900 : C.sky200}`,
                  borderRadius: 20,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  fontSize: ".8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all .18s",
                  background: sem === s ? C.sky900 : C.white,
                  color: sem === s ? C.white : C.slate500,
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <span style={{ fontSize: ".8rem", color: C.slate500 }}>
            CSE · Semester {sem.slice(1)}
          </span>
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th>Fee Category</Th>
              <Th>Amount (₹)</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
              <Th>Remarks</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <Td style={{ fontWeight: 600 }}>{r.cat}</Td>
                <Td style={{ fontWeight: 700, color: C.sky700 }}>{r.amount}</Td>
                <Td style={{ color: C.slate500, fontSize: ".82rem" }}>
                  {r.due}
                </Td>
                <Td>
                  <Badge status={r.status} />
                </Td>
                <Td style={{ color: C.slate500, fontSize: ".82rem" }}>
                  {r.remark}
                </Td>
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
function DueSheet({ toast, dueData, dueSections, sems }) {
  const [sem, setSem] = useState("");
  const [feeType, setFeeType] = useState("all");
  const [admNo, setAdmNo] = useState("");
  const [exportModal, setExportModal] = useState(false);

  const uniqueAdmNos = useMemo(
    () => Array.from(new Set(dueData.map((d) => d.id))),
    [dueData],
  );

  const rows = useMemo(() => {
    return dueData.filter((d) => {
      if (sem && d.sem !== sem) return false;
      if (admNo && d.id !== admNo) return false;
      if (feeType !== "all" && (!d[feeType] || d[feeType] <= 0)) return false;
      return true;
    });
  }, [sem, admNo, feeType, dueData]);

  const totalDue = rows.reduce((a, r) => a + r.total, 0);
  const withDue = rows.filter((r) => r.total > 0).length;
  const clearCount = rows.length - withDue;
  const rate = rows.length ? Math.round((clearCount / rows.length) * 100) : 0;

  // Calculate dynamic totals for each section
  const sectionTotals = {};
  dueSections.forEach(section => {
    sectionTotals[section] = rows.reduce((a, r) => a + (r[section] || 0), 0);
  });
  const totalAllRows = rows.reduce((a, r) => a + r.total, 0);

  const fmt = (v) =>
    v ? (
      <span style={{ color: C.red500, fontWeight: 700 }}>
        ₹{v.toLocaleString()}
      </span>
    ) : (
      <span style={{ color: C.slate400 }}>—</span>
    );

  const generateDuePdf = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.text(
      `Outstanding Due Sheet ${sem ? "(" + sem + ")" : "(All Semesters)"}`,
      14,
      15,
    );

    const tableColumn = [
      "Adm No",
      "Name",
      "Semester",
      ...dueSections,
      "Total Due",
    ];
    const tableRows = rows.map((r) => [
      r.id,
      r.name,
      r.sem,
      ...dueSections.map((s) => `Rs. ${r[s] || 0}`),
      `Rs. ${r.total}`,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 9, cellPadding: 4, textColor: [30, 41, 59] },
      headStyles: {
        fillColor: [2, 132, 199],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      theme: "grid",
    });
    doc.save(`Due_Sheet_Report_${sem || "All"}.pdf`);
    toast("PDF Generated & Downloaded!", "success");
  };

  const generateDueExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent +=
      `Admission No,Name,Semester,${dueSections.join(",")},Total Due\n`;
    rows.forEach((r) => {
      const sectionVals = dueSections.map(s => r[s] || 0).join(",");
      csvContent += `"${r.id}","${r.name}","${r.sem}",${sectionVals},${r.total}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Due_Sheet_Report_${sem || "All"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Excel (CSV) Downloaded!", "success");
  };

  const handleSharePdf = async () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.text(
      `Outstanding Due Sheet ${sem ? "(" + sem + ")" : "(All Semesters)"}`,
      14,
      15,
    );
    const tableColumn = [
      "Adm No",
      "Name",
      "Semester",
      ...dueSections,
      "Total Due",
    ];
    const tableRows = rows.map((r) => [
      r.id,
      r.name,
      r.sem,
      ...dueSections.map(s => `Rs. ${r[s] || 0}`),
      `Rs. ${r.total}`,
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 9, cellPadding: 4, textColor: [30, 41, 59] },
      headStyles: {
        fillColor: [2, 132, 199],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      theme: "grid",
    });

    const pdfBlob = doc.output("blob");
    const file = new File([pdfBlob], `Due_Sheet_${sem || "All"}.pdf`, {
      type: "application/pdf",
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ title: "Due Sheet Report", files: [file] });
        toast("Shared successfully!", "success");
      } catch (err) {
        console.error(err);
      }
    } else {
      toast("Direct attachment unsupported. Downloading PDF...", "error");
      doc.save(`Due_Sheet_${sem || "All"}.pdf`);
    }
  };

  return (
    <Card>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "1.15rem",
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            Due Sheet Management
          </h2>
          <p style={{ fontSize: ".82rem", color: C.slate500 }}>
            View outstanding dues per class / semester
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Btn variant="primary" size="sm" onClick={() => setExportModal(true)}>
            <Icon.Download /> Download Options
          </Btn>
          <Btn variant="outline" size="sm" onClick={handleSharePdf}>
            Share Report
          </Btn>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 22,
        }}
      >
        <FormGroup label="Filter by Semester">
          <Select value={sem} onChange={(e) => setSem(e.target.value)}>
            <option value="">All Semesters</option>
            {sems.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup label="Filter by Fee Type">
          <Select value={feeType} onChange={(e) => setFeeType(e.target.value)}>
            <option value="all">All Fee Types</option>
            {dueSections.map(s => (
              <option key={s} value={s}>{s} Dues</option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup label="Filter by Admission No">
          <Select value={admNo} onChange={(e) => setAdmNo(e.target.value)}>
            <option value="">All Admission Numbers</option>
            {uniqueAdmNos.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </Select>
        </FormGroup>
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>Adm No</Th>
            <Th>Name</Th>
            <Th>Sem</Th>
            {dueSections.map(s => (
              <Th key={s}>{s}</Th>
            ))}
            <Th>Total Due</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                style={{ textAlign: "center", padding: 32, color: C.slate400 }}
              >
                No records found
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id}>
                <Td style={{ fontSize: ".78rem", color: C.slate400 }}>
                  {r.id}
                </Td>
                <Td style={{ fontWeight: 600 }}>{r.name}</Td>
                <Td>
                  <Chip>{r.sem}</Chip>
                </Td>
                {dueSections.map(s => (
                  <Td key={s}>{fmt(r[s])}</Td>
                ))}
                <Td>
                  <strong style={{ color: r.total ? C.red500 : C.slate400 }}>
                    {r.total ? `₹${r.total.toLocaleString()}` : "—"}
                  </strong>
                </Td>
              </tr>
            ))
          )}
          {rows.length > 0 && (
            <tr
              style={{
                background: C.sky50,
                fontWeight: 700,
                borderTop: `2px solid ${C.sky200}`,
              }}
            >
              <Td></Td>
              <Td></Td>
              <Td
                style={{
                  textAlign: "left",
                  color: C.slate700,
                  fontSize: "1.2rem", // size of total increase
                  fontWeight: 800, // makes it more prominent
                }}
              >
                Total:
              </Td>
              {dueSections.map(s => (
                <Td key={s}>{fmt(sectionTotals[s])}</Td>
              ))}
              <Td>
                <strong style={{ color: totalAllRows ? C.red500 : C.slate400 }}>
                  {totalAllRows ? `₹${totalAllRows.toLocaleString()}` : "—"}
                </strong>
              </Td>
            </tr>
          )}
        </tbody>
      </TableWrap>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
          marginTop: 20,
        }}
      >
        {[
          { label: "Total Students", value: rows.length, col: C.sky700 },
          { label: "Students with Dues", value: withDue, col: C.red500 },
          {
            label: "Total Dues Amount",
            value: `₹${totalDue.toLocaleString()}`,
            col: C.red500,
          },
          { label: "Collection Rate", value: `${rate}%`, col: "#0d9488" },
        ].map(({ label, value, col }) => (
          <div
            key={label}
            style={{
              background: C.sky50,
              border: `1px solid ${C.sky100}`,
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: ".72rem",
                fontWeight: 700,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                color: C.slate500,
                marginBottom: 4,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: col,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Removed Active Filter View Modal functionality per user triple-dropdown request */}
      <Modal
        open={exportModal}
        title="Select Download Format"
        onClose={() => setExportModal(false)}
      >
        <p style={{ fontSize: ".85rem", color: C.slate500, marginBottom: 20 }}>
          Select the format you would like to export the current due sheet view.
        </p>
        <div style={{ display: "flex", gap: 14, flexDirection: "column" }}>
          <Btn
            variant="outline"
            onClick={() => {
              setExportModal(false);
              generateDuePdf();
            }}
            style={{ justifyContent: "center", padding: "14px" }}
          >
            <span style={{ fontWeight: 800 }}>Download PDF Report</span>
          </Btn>
          <Btn
            variant="outline"
            onClick={() => {
              setExportModal(false);
              generateDueExcel();
            }}
            style={{ justifyContent: "center", padding: "14px" }}
          >
            <span style={{ fontWeight: 800 }}>Download Excel (CSV)</span>
          </Btn>
        </div>
      </Modal>
    </Card>
  );
}

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab] = useState("fee-mgmt");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("");
  const [toastVis, setToastVis] = useState(false);
  const [finesHistory, setFinesHistory] = useState([]);
  const [dueData, setDueData] = useState([]);
  const [dueSections, setDueSections] = useState([]);
  const [, setStudents] = useState([]);
  const [feeData, setFeeData] = useState({ S2: [], S4: [], S6: [], S8: [] });
  const [deptName, setDeptName] = useState("");
  const [loading, setLoading] = useState(true);
  const [sems, setSems] = useState([]);
  const [, setDepts] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  const navigate = useNavigate();

  const toast = (msg, type = "") => {
    setToastMsg(msg);
    setToastType(type);
    setToastVis(true);
    setTimeout(() => setToastVis(false), 2800);
  };

  // At top of App() component
  const currentRefId = (() => {
    try {
      const token = sessionStorage.getItem("token");
      return JSON.parse(atob(token.split(".")[1])).refId;
    } catch {
      return null;
    }
  })();

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  });

  useEffect(() => {
    const BASE = `${API}/api/admin`;

    const fetchAll = async () => {
      try {
        const token = sessionStorage.getItem("token");
        JSON.parse(atob(token.split(".")[1]));

        // ── 1. HOD's own students ──
        const studRes = await fetch(`${BASE}/hod-students`, {
          headers: authHeaders(),
        });
        if (studRes.ok) {
          const studJson = await studRes.json();
          setDeptName(studJson.deptName || "");
          const uniqueSems = [
            ...new Set(
              (studJson.students || []).map((s) => s.className).filter(Boolean),
            ),
          ].sort();
          setSems(uniqueSems);
          setDepts([studJson.deptName].filter(Boolean));
          setStudents(
            (studJson.students || []).map((s) => ({
              id: s.admissionNo,
              name: s.name,
              sem: s.className,
              dept: s.department?.name || studJson.deptName || "",
            })),
          );
        }

        // ── 2. All students (for adding fines across departments) ──  ✅ INSIDE fetchAll
        const allStudRes = await fetch(`${BASE}/all-students`, {
          headers: authHeaders(),
        });
        if (allStudRes.ok) {
          const allStudJson = await allStudRes.json();
          setAllStudents(
            (allStudJson || []).map((s) => ({
              id: s.admissionNo,
              name: s.name,
              sem: s.className,
              dept: s.department?.name || "",
            })),
          );
        }

        // ── 3. Due-sheet breakdown + fee categories ──
        const sheetRes = await fetch(`${BASE}/hod-due-sheet`, {
          headers: authHeaders(),
        });
        if (sheetRes.ok) {
          const sheetJson = await sheetRes.json();
          setDueData(sheetJson.rows || []);
          setDueSections(sheetJson.sections || []); // 🔥 add this
          const raw = sheetJson.feeData || {};
          setFeeData({
            S1: raw["S1"] || [],
            S2: raw["S2"] || [],
            S3: raw["S3"] || [],
            S4: raw["S4"] || [],
            S5: raw["S5"] || [],
            S6: raw["S6"] || [],
            S7: raw["S7"] || [],
            S8: raw["S8"] || [],
          });
        }

        // ── 4. Fines / dues history ──
        const duesRes = await fetch(`${BASE}/hod-dues`, {
          headers: authHeaders(),
        });
        if (duesRes.ok) {
          const duesJson = await duesRes.json();
          setFinesHistory(
            duesJson.map((d) => ({
              _id: d._id,
              id: d.student?.admissionNo || "",
              name: d.student?.name || "",
              sem: d.student?.className || "",
              dept: d.deptName || "",
              cat: d.feeSection?.name || "Fee",
              amt: `₹${Number(d.amount).toLocaleString("en-IN")}`,
              due: d.dueDate
                ? new Date(d.dueDate).toISOString().split("T")[0]
                : "-",
              status: d.status === "paid" ? "Paid" : "Due",
              rawAmount: d.amount,
              rawId: d._id,
              addedByRef: d.addedByRef || null,
              addedBy: d.addedBy || null,
              addedByDept: d.addedByDept || "N/A",
              remark: d.remark || "",
            })),
          );
        }
      } catch (err) {
        console.error("HOD Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteFine = (fineId) => {
    setFinesHistory((prev) =>
      prev.filter((f) => (f._id || f.rawId) !== fineId),
    );
  };

  const handleAddFines = async (newFines) => {
    const payload = newFines.map((f) => ({
      admissionNo: f.id,
      amount: f.rawAmount || Number(String(f.amt).replace(/[^0-9.-]+/g, "")),
      feeType: f.cat,
      dueDate: f.due,
    }));

    try {
      const res = await fetch(`${API}/api/admin/add-fine`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("add-fine response:", data); // ✅ for debugging

      if (!res.ok) {
        toast("Failed to save fine: " + (data.error || data.message), "error");
        return; // ✅ stop here, don't update state
      }

      // ✅ only update state after confirmed DB save
      setFinesHistory((prev) => [...newFines, ...prev]);
      toast("Fine saved successfully!", "success");
    } catch (e) {
      console.error("Error adding fines:", e);
      toast("Network error", "error");
    }
  };

  const tabs = [
    { id: "fee-mgmt", label: "Fee Management" },
    { id: "fee-cat", label: "Fee Categories" },
    { id: "due-sheet", label: "Due Sheet" },
  ];

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav
        style={{
          background: C.white,
          borderBottom: `1px solid ${C.sky200}`,
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 3px rgba(14,165,233,.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon.Logo />
          <span
            style={{
              fontFamily: "'Sora',sans-serif",
              fontWeight: 700,
              fontSize: "1.25rem",
              color: C.sky600,
              letterSpacing: "-.5px",
            }}
          >
            UNIPAY
          </span>
          <span
            style={{
              background: C.sky100,
              color: C.sky700,
              fontSize: ".7rem",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
              letterSpacing: ".5px",
            }}
          >
            HOD
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: ".85rem", fontWeight: 600 }}>
              Head of Department
            </div>
            <div style={{ fontSize: ".75rem", color: C.slate500 }}>
              {deptName ? `${deptName} Department` : "Loading…"}
            </div>
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: C.sky100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.sky600,
            }}
          >
            <Icon.User />
          </div>
          <button
            onClick={() => {
              toast("Logged out", "success");
              setTimeout(() => navigate("/login"), 800);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: `1px solid ${C.slate200}`,
              borderRadius: 8,
              padding: "6px 14px",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              fontSize: ".8rem",
              fontWeight: 500,
              color: C.slate500,
              cursor: "pointer",
            }}
          >
            <Icon.Logout /> Logout
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "1.8rem",
              fontWeight: 700,
            }}
          >
            HOD Dashboard
          </h1>
          <p style={{ fontSize: ".9rem", color: C.slate500, marginTop: 4 }}>
            Manage Academic, Lab, Examination and view due sheets ·{" "}
            {deptName || "…"} Department
          </p>
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: C.white,
            borderRadius: 12,
            padding: 5,
            border: `1px solid ${C.sky100}`,
            boxShadow: "0 1px 3px rgba(14,165,233,.08)",
            marginBottom: 28,
            width: "fit-content",
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "8px 20px",
                border: "none",
                borderRadius: 8,
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                fontSize: ".875rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all .18s",
                background: activeTab === t.id ? C.sky600 : "transparent",
                color: activeTab === t.id ? C.white : C.slate500,
                boxShadow:
                  activeTab === t.id ? "0 2px 8px rgba(2,132,199,.3)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: C.slate400,
              fontSize: "1rem",
            }}
          >
            Loading dashboard data…
          </div>
        ) : (
          <>
            {activeTab === "fee-mgmt" && (
              <FeeManagement
                toast={toast}
                finesHistory={finesHistory}
                onAddFines={handleAddFines}
                onDeleteFine={handleDeleteFine}
                students={allStudents} // ✅ all students for adding fines
                sems={[
                  ...new Set(allStudents.map((s) => s.sem).filter(Boolean)),
                ].sort()} // ✅ all sems
                depts={[
                  ...new Set(allStudents.map((s) => s.dept).filter(Boolean)),
                ].sort()} // ✅ all depts
                currentRefId={currentRefId}
              />
            )}
            {activeTab === "fee-cat" && (
              <FeeCategories
                feeData={feeData}
                sems={sems} // ✅
              />
            )}
            {activeTab === "due-sheet" && (
              <DueSheet
                toast={toast}
                dueData={dueData}
                dueSections={dueSections}
                sems={sems} // ✅
              />
            )}
          </>
        )}
      </div>

      <Toast message={toastMsg} type={toastType} visible={toastVis} />
    </>
  );
}
