import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "../../components/Layout";
import AlertToast from "../../components/Alerttoast";

//const API = "http://localhost:8000";
const API = "https://mess-management-system-q6us.onrender.com";
// Staff salary rules
const STAFF_RULES = {
  "Cook Salary": { ratePerDay: 710, label: "Cook", maxDays: (dim) => dim - 1 },
  "Matron Salary": { ratePerDay: 800, label: "Matron", maxDays: () => 27 },
};

export default function Expenses() {

  // ─── MODERN SELECT (inline) ────────────────────────────────
function ModernSelect({ value, onChange, options, style, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOpt = options.find((o) => String(o.value) === String(value)) || options[0];

  return (
    <div ref={containerRef} style={{ ...style, position: "relative", display: "inline-block" }}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          padding: "8px 14px", paddingRight: "32px", borderRadius: "8px",
          border: isOpen ? "1px solid #3b82f6" : "1px solid #e2e8f0",
          backgroundColor: disabled ? "#f1f5f9" : "#ffffff",
          color: disabled ? "#94a3b8" : "#334155",
          fontSize: "13px", fontWeight: "600",
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
          boxShadow: isOpen ? "0 0 0 3px rgba(59,130,246,0.1)" : "0 1px 2px rgba(0,0,0,0.05)",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "14px",
          opacity: disabled ? 0.65 : 1, width: "100%", boxSizing: "border-box", minHeight: "36px",
          display: "flex", alignItems: "center",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOpt ? selectedOpt.label : "Select"}
        </span>
      </div>

      {isOpen && !disabled && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0,
          width: "100%", minWidth: "120px", maxHeight: "250px", overflowY: "auto",
          backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          zIndex: 9999, padding: "4px", boxSizing: "border-box",
        }}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onChange({ target: { value: opt.value } }); setIsOpen(false); }}
              onMouseEnter={(e) => { if (String(opt.value) !== String(value)) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
              onMouseLeave={(e) => { if (String(opt.value) !== String(value)) e.currentTarget.style.backgroundColor = "transparent"; }}
              style={{
                padding: "8px 12px", fontSize: "13px", fontWeight: "500",
                color: String(opt.value) === String(value) ? "#1d4ed8" : "#334155",
                backgroundColor: String(opt.value) === String(value) ? "#eff6ff" : "transparent",
                borderRadius: "6px", cursor: "pointer", transition: "background-color 0.15s",
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fileInputRef = useRef();

  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [quantity, setQuantity] = useState("");
  const [bill, setBill] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [prevBalance, setPrevBalance] = useState("");
  const [prevMonth, setPrevMonth] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [staffType, setStaffType] = useState("");
  const [staffAmount, setStaffAmount] = useState("");
  const [staffSaving, setStaffSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [toast, setToast] = useState(null);

  // Staff attendance — dailyRecords map from DB
  const [staffAtt, setStaffAtt] = useState({ "Cook Salary": {}, "Matron Salary": {} });

  const isFrozen = isLocked || isPublished;
  const showToast = (message, type = "info") => setToast({ message, type });

  // Days in selected month
  const [selY, selM] = selectedMonth.split("-").map(Number);
  const daysInMonth = new Date(selY, selM, 0).getDate();

  // Monthly count from dailyRecords (capped by rule)
  const calcSalary = (type) => {
    const records = staffAtt[type] || {};
    const actual = Object.entries(records).filter(([d, p]) => d.startsWith(selectedMonth) && p).length;
    const max = STAFF_RULES[type].maxDays(daysInMonth);
    const days = Math.min(actual, max);
    return { actual, days, max, salary: days * STAFF_RULES[type].ratePerDay };
  };

  // ─── FETCH EXPENSES ────────────────────────────────────────
  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API}/api/expenses`);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      setExpenses(await res.json());
    } catch (err) {
      setError("Could not load expenses. Is the server running?");
    }
  };

  const getPrevMonthKey = (monthStr) => {
    const d = new Date(monthStr + "-01");
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  };

  // ─── FETCH BALANCE + PUBLISH STATUS + STAFF ATTENDANCE ─────
  const fetchBalance = useCallback(async () => {
    try {
      const prevMonthKey = getPrevMonthKey(selectedMonth);
      setPrevMonth(prevMonthKey);

      const [res, prevRes, billRes, staffRes] = await Promise.all([
        fetch(`${API}/api/balance/${selectedMonth}`),
        fetch(`${API}/api/balance/${prevMonthKey}`),
        fetch(`${API}/api/bill/${selectedMonth}`),
        fetch(`${API}/api/staff-attendance/${selectedMonth}`),
      ]);

      const data = await res.json();
      const prevData = await prevRes.json();
      const billData = billRes.ok ? await billRes.json() : {};
      const staffData = staffRes.ok ? await staffRes.json() : [];

      setClosingBalance(data?.closingBalance || "");
      setPrevBalance(prevData?.closingBalance || "");

      const [selYear, selMon] = selectedMonth.split("-").map(Number);
      const [curYear, curMon] = currentMonth.split("-").map(Number);
      const monthsDiff = (curYear - selYear) * 12 + (curMon - selMon);
      setIsLocked(monthsDiff >= 2 && Number(data?.closingBalance || 0) > 0);
      setIsPublished(billData?.published || false);
      setSaveStatus("");

      // Populate staffAtt dailyRecords from DB
      const map = { "Cook Salary": {}, "Matron Salary": {} };
      staffData.forEach((r) => {
        if (map[r.staffType] !== undefined) map[r.staffType] = r.dailyRecords || {};
      });
      setStaffAtt(map);
    } catch (err) {
      console.error("Balance fetch error:", err);
    }
  }, [selectedMonth, currentMonth]);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  // ─── SAVE CLOSING BALANCE ──────────────────────────────────
  const saveBalance = async () => {
    if (isFrozen) return;
    setSaveStatus("saving");
    try {
      const res = await fetch(`${API}/api/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          prevBalance: Number(prevBalance || 0),
          closingBalance: Number(closingBalance || 0),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaveStatus("saved");
      const [selYear, selMon] = selectedMonth.split("-").map(Number);
      const [curYear, curMon] = currentMonth.split("-").map(Number);
      if ((curYear - selYear) * 12 + (curMon - selMon) >= 2 && Number(closingBalance) > 0) {
        setIsLocked(true);
      }
      setTimeout(() => setSaveStatus(""), 2500);
    } catch (err) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 2500);
    }
  };



  // ─── ADD STAFF SALARY TO CHARGES ──────────────────────────
  async function addStaffSalary(type) {
    if (isPublished) {
      showToast("Bill is published. Cannot add charges.", "warning");
      return;
    }
    const { days, salary } = calcSalary(type);
    if (salary <= 0) {
      showToast("Days worked is 0. Enter attendance first.", "warning");
      return;
    }
    const alreadyAdded = expenses.some(
      (e) => e.isStaff && e.billMonth === selectedMonth && e.title === type
    );
    if (alreadyAdded) {
      showToast(`"${type}" already added for ${selectedMonth}. Delete it first to change.`, "warning");
      return;
    }
    setStaffSaving(true);
    try {
      const res = await fetch(`${API}/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: type, amount: salary, date: today,
          billMonth: selectedMonth, quantity: `${days} days`, isStaff: true,
        }),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setExpenses([...expenses, saved]);
      showToast(`${type} ₹${salary} added for ${days} days.`, "success");
    } catch {
      showToast("Error adding salary.", "error");
    } finally {
      setStaffSaving(false);
    }
  }

  const handleViewBill = (expense) => setSelectedBill(expense);

  // ─── ADD EXPENSE ───────────────────────────────────────────
  async function addExpense() {
    if (isPublished) { showToast(`Bill for ${selectedMonth} is published. Expenses cannot be added.`, "warning"); return; }
    if (!title || !amount || !bill) { showToast("Please fill all fields and upload bill.", "warning"); return; }
    if (Number(amount) <= 0) { showToast("Amount must be greater than 0.", "warning"); return; }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("amount", Number(amount));
    formData.append("date", date);
    formData.append("billMonth", selectedMonth);
    formData.append("quantity", quantity);
    formData.append("bill", bill);
    formData.append("isStaff", "false");

    try {
      const res = await fetch(`${API}/api/expenses`, { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      setExpenses([...expenses, await res.json()]);
      setTitle(""); setAmount(""); setDate(today); setBill(null); setQuantity("");
      fileInputRef.current.value = "";
    } catch {
      showToast("Error adding expense. Is the server running?", "error");
    }
  }

  // ─── ADD STAFF CHARGE (manual) ─────────────────────────────
  async function addStaffCharge() {
    if (isPublished) { showToast(`Bill for ${selectedMonth} is published. Staff charges cannot be added.`, "warning"); return; }
    if (!staffType || !staffAmount || Number(staffAmount) <= 0) return;
    const alreadyAdded = expenses.some((e) => e.isStaff && e.billMonth === selectedMonth && e.title === staffType);
    if (alreadyAdded) { showToast(`"${staffType}" already added for ${selectedMonth}. Delete it first.`, "warning"); return; }

    setStaffSaving(true);
    try {
      const res = await fetch(`${API}/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: staffType, amount: Number(staffAmount), date: today, billMonth: selectedMonth, quantity: "", isStaff: true }),
      });
      if (!res.ok) throw new Error();
      setExpenses([...expenses, await res.json()]);
      setStaffType(""); setStaffAmount("");
    } catch {
      showToast("Error saving staff charge. Is the server running?", "error");
    } finally {
      setStaffSaving(false);
    }
  }

  // ─── DELETE EXPENSE ────────────────────────────────────────
  async function deleteExpense(id) {
    if (isPublished) { showToast(`Bill for ${selectedMonth} is published. Expenses cannot be deleted.`, "warning"); return; }
    try {
      await fetch(`${API}/api/expenses/${id}`, { method: "DELETE" });
      setExpenses(expenses.filter((e) => e._id !== id));
    } catch {
      showToast("Error deleting expense.", "error");
    }
  }

  const monthlyAll = expenses.filter((e) => e.billMonth === selectedMonth);
  const monthlyExpenses = monthlyAll.filter((e) => !e.isStaff);
  const monthlyStaff = monthlyAll.filter((e) => e.isStaff);

  const nowM = new Date().getMonth() + 1;
  const nowY = new Date().getFullYear();
  const prevM = nowM === 1 ? 12 : nowM - 1;
  const prevY = nowM === 1 ? nowY - 1 : nowY;

  const PERIOD_OPTIONS = [
    { label: `${MONTHS[prevM - 1]} ${prevY}`, value: `${prevY}-${String(prevM).padStart(2, "0")}` },
    { label: `${MONTHS[nowM - 1]} ${nowY}`, value: `${nowY}-${String(nowM).padStart(2, "0")}` },
  ];

  const disabledStyle = { cursor: "not-allowed", background: "#f1f5f9", color: "#94a3b8" };
  const btnBase = {
    border: "none", borderRadius: "8px", cursor: "pointer",
    fontWeight: "600", fontSize: "13px", fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: "opacity 0.15s, transform 0.15s",
  };

  return (
    <Layout>
      
      <div className="expenses-container">
        <h2>Mess Expenses</h2>

        {/* TOP CONTROLS */}
        <div className="top-controls">
          <div>
  <label>Period</label>
  <ModernSelect
    value={selectedMonth}
    onChange={(e) => { setSelectedMonth(e.target.value); setDate(today); }}
    options={PERIOD_OPTIONS}
    style={{ width: "100%" }}
  />
</div>

          <div>
            <label>Closing Balance of {prevMonth}</label>
            <input type="number" value={prevBalance} disabled style={disabledStyle} />
          </div>

          <div>
            <label>
              Closing Balance of {selectedMonth}
              {isLocked && !isPublished && <span style={{ color: "#ef4444", fontSize: "11px", marginLeft: "6px" }}>🔒 Locked</span>}
              {isPublished && <span style={{ color: "#ef4444", fontSize: "11px", marginLeft: "6px" }}>🔒 Published</span>}
            </label>
            <input
              type="number" value={closingBalance} disabled={isFrozen}
              placeholder="Enter closing balance"
              style={isFrozen ? disabledStyle : {}}
              onChange={(e) => { setClosingBalance(e.target.value); setSaveStatus(""); }}
            />
          </div>

          {!isFrozen && (
            <div style={{ alignSelf: "flex-end" }}>
              <button
                onClick={saveBalance} disabled={saveStatus === "saving"}
                style={{
                  ...btnBase,
                  background: saveStatus === "saved" ? "linear-gradient(135deg,#22c55e,#16a34a)"
                    : saveStatus === "error" ? "linear-gradient(135deg,#ef4444,#dc2626)"
                      : "linear-gradient(135deg,#2f6bff,#1d4fd8)",
                  color: "white", padding: "9px 20px", height: "38px",
                  boxShadow: "0 2px 8px rgba(47,107,255,0.28)",
                  opacity: saveStatus === "saving" ? 0.75 : 1,
                }}
              >
                {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "✓ Saved" : saveStatus === "error" ? "✗ Failed" : "Save Balance"}
              </button>
            </div>
          )}
        </div>

        {isPublished && (
          <div style={{ background: "#fef9c3", border: "1px solid #fde047", color: "#854d0e", padding: "10px 16px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px", fontWeight: "600" }}>
            🔒 Bill for {selectedMonth} has been published. All fields are frozen and cannot be modified.
          </div>
        )}

        {error && (
          <div style={{ color: "#dc2626", background: "#fee2e2", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* ADD EXPENSE FORM */}
        <div className="card">
          <h4>Add Expense</h4>
          <div className="form-row">
            <input placeholder="Expense title" value={title} disabled={isPublished} style={isPublished ? disabledStyle : {}} onChange={(e) => setTitle(e.target.value)} />
            <input placeholder="Quantity" value={quantity} disabled={isPublished} style={isPublished ? disabledStyle : {}} onChange={(e) => setQuantity(e.target.value)} />
            <input type="number" placeholder="Amount" value={amount} min="0.01" step="0.01" disabled={isPublished} style={isPublished ? disabledStyle : {}}
              onChange={(e) => { const v = e.target.value; if (v === "" || Number(v) > 0) setAmount(v); }} />
          </div>
          <div className="form-row">
            <input type="file" ref={fileInputRef} disabled={isPublished} style={isPublished ? { cursor: "not-allowed", opacity: 0.5 } : {}} onChange={(e) => setBill(e.target.files[0])} />
            <button onClick={addExpense} disabled={isPublished} style={isPublished ? { cursor: "not-allowed", opacity: 0.5 } : {}}>Add Expense</button>
          </div>
        </div>

        {/* ── STAFF SALARY (auto-calculated from attendance) ──── */}
        <div className="card">
          <h4>Staff Salary</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {Object.entries(STAFF_RULES).map(([type, rule]) => {
              const { actual, days, max, salary } = calcSalary(type);
              const isCapped = actual > max;
              const alreadySaved = expenses.some((e) => e.isStaff && e.billMonth === selectedMonth && e.title === type);

              return (
                <div key={type} style={{ background: "#ffffff", border: "1px solid #e4e8f5", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ display: "flex", flex: 1, gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: "700", fontSize: "14px", color: "#0f1523" }}>{rule.label}</span>
                      <span style={{ marginLeft: "8px", fontSize: "12px", color: "#7b84a3" }}>₹{rule.ratePerDay}/day</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#3d4663" }}>
                      <span style={{ color: "#7b84a3" }}>Attendance: </span>
                      <strong>{actual} days</strong>
                      {isCapped && (
                        <span style={{ marginLeft: "6px", fontSize: "11px", background: "#fff7ed", color: "#9a3412", border: "1px solid #fdba74", borderRadius: "5px", padding: "2px 6px" }}>
                          counted {days} (max {max})
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "13px", color: "#3d4663" }}>
                      <span style={{ color: "#7b84a3" }}>Salary: </span>
                      <strong style={{ color: "#166534", fontSize: "15px" }}>₹{salary.toLocaleString()}</strong>
                    </div>
                  </div>

                  {alreadySaved ? (
                    <span style={{ fontSize: "12px", color: "#166534", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "6px", padding: "5px 12px", fontWeight: "600", whiteSpace: "nowrap" }}>
                      ✓ Added to charges
                    </span>
                  ) : (
                    <button
                      onClick={() => addStaffSalary(type)}
                      disabled={isPublished || salary <= 0}
                      style={{
                        ...btnBase,
                        background: "linear-gradient(135deg,#6366f1,#4338ca)",
                        color: "white", padding: "7px 18px",
                        boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                        opacity: (isPublished || salary <= 0) ? 0.5 : 1,
                        cursor: (isPublished || salary <= 0) ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Add ₹{salary.toLocaleString()} to Charges
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {Object.keys(STAFF_RULES).every((type) => calcSalary(type).actual === 0) && (
            <p style={{ margin: "12px 0 0", fontSize: "12px", color: "#94a3b8" }}>
              Mark Cook and Matron attendance on the Attendance page to calculate salary.
            </p>
          )}
        </div>

        {/* STAFF CHARGES (Temporary Staff manual entry) */}
        <div className="card">
          <h4>Other Staff Charges</h4>
          <div className="form-row">
            <ModernSelect
  value={staffType}
  onChange={(e) => setStaffType(e.target.value)}
  disabled={isPublished}
  options={[
    { label: "Select type", value: "" },
    { label: "Temporary Staff", value: "Temporary Staff" },
  ]}
  style={isPublished ? { ...disabledStyle, minWidth: "160px" } : { minWidth: "160px" }}
/>
            <input type="number" placeholder="Amount" value={staffAmount} min="0.01" disabled={isPublished} style={isPublished ? disabledStyle : {}} onChange={(e) => setStaffAmount(e.target.value)} />
            <button onClick={addStaffCharge} disabled={staffSaving || isPublished} style={isPublished ? { cursor: "not-allowed", opacity: 0.5 } : {}}>
              {staffSaving ? "Saving..." : "Add"}
            </button>
          </div>

          {monthlyStaff.filter((s) => s.title === "Temporary Staff").map((s) => (
            <div key={s._id} className="staff-item">
              {s.title} — ₹{s.amount}
              {!isPublished && (
                <button onClick={() => deleteExpense(s._id)} style={{ marginLeft: "10px", background: "#fee2e2", color: "#dc2626", border: "none", padding: "2px 8px", borderRadius: "5px", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}>✕</button>
              )}
            </div>
          ))}
        </div>

        {/* EXPENSE TABLE */}
        <div className="card">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Action</th>
                <th>Bill</th>
              </tr>
            </thead>
            <tbody>
              {monthlyExpenses.map((exp) => (
                <tr key={exp._id}>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td>{exp.title}</td>
                  <td>{exp.quantity || "-"}</td>
                  <td>₹{exp.amount}</td>
                  <td>{!isPublished ? <button onClick={() => deleteExpense(exp._id)}>Delete</button> : <span style={{ color: "#94a3b8", fontSize: "12px" }}>—</span>}</td>
                  <td>{exp.bill ? <button onClick={() => handleViewBill(exp)}>View</button> : "-"}</td>
                </tr>
              ))}
              {monthlyStaff.map((s) => (
                <tr key={s._id}>
                  <td>{new Date(s.date).toLocaleDateString()}</td>
                  <td style={{ color: "#9333ea", fontWeight: "600" }}>{s.title}</td>
                  <td>{s.quantity || "-"}</td>
                  <td>₹{s.amount}</td>
                  <td>{!isPublished ? <button onClick={() => deleteExpense(s._id)}>Delete</button> : <span style={{ color: "#94a3b8", fontSize: "12px" }}>—</span>}</td>
                  <td>-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <AlertToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {selectedBill && (
        <div className="bill-overlay">
          <div className="bill-modal">
            <button onClick={() => setSelectedBill(null)}>✕</button>
            {selectedBill.bill.endsWith(".pdf") ? (
              <iframe src={selectedBill.bill} title="Bill" />
            ) : (
              <img src={selectedBill.bill} alt="Bill" />
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}