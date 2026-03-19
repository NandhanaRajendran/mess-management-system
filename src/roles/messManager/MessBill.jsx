import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import AlertToast from "../../components/Alerttoast";

//const API = "http://localhost:5000";
 const API = "https://mess-management-system-q6us.onrender.com"; // ← uncomment for production

export default function MessBill() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [allStudents, setAllStudents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balance, setBalance] = useState({ prevBalance: 0, closingBalance: 0 });

  const [isDrafted, setIsDrafted] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [draftedAt, setDraftedAt] = useState(null);
  const [publishedAt, setPublishedAt] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "info") => setToast({ message, type });

  // ─── FETCH ALL DATA ────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [studentsRes, expensesRes, balanceRes, billStatusRes] = await Promise.all([
          fetch(`${API}/api/students`),
          fetch(`${API}/api/expenses`),
          fetch(`${API}/api/balance/${selectedMonth}`),
          fetch(`${API}/api/bill/${selectedMonth}`),
        ]);

        if (!studentsRes.ok || !expensesRes.ok) throw new Error("Failed to fetch data");

        const studentsData = await studentsRes.json();
        const expensesData = await expensesRes.json();
        const balanceData = balanceRes.ok ? await balanceRes.json() : {};
        const billData = billStatusRes.ok ? await billStatusRes.json() : {};

        setAllStudents(studentsData);
        setExpenses(expensesData);
        setBalance({
          prevBalance: balanceData?.prevBalance || 0,
          closingBalance: balanceData?.closingBalance || 0,
        });
        setIsDrafted(billData?.drafted || false);
        setIsPublished(billData?.published || false);
        setDraftedAt(billData?.draftedAt || null);
        setPublishedAt(billData?.publishedAt || null);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  // ─── ATTENDANCE RULE ───────────────────────────────────────
  // messCut = false → count (regardless of present/absent)
  function calculateAttendance(person) {
    return (person.attendance || []).filter(
      (r) => r.date.startsWith(selectedMonth) && r.messCut === false
    ).length;
  }

  // ─── SPLIT EXPENSES ────────────────────────────────────────
  const monthlyAll = expenses.filter((exp) => exp.billMonth === selectedMonth);
  const foodExpenses = monthlyAll.filter((exp) => !exp.isStaff).reduce((sum, e) => sum + e.amount, 0);
  const staffExpenses = monthlyAll.filter((exp) => exp.isStaff).reduce((sum, e) => sum + e.amount, 0);
//  const totalMonthlyExpense = foodExpenses + staffExpenses;

  const totalAttendance = allStudents.reduce((sum, s) => sum + calculateAttendance(s), 0);
  const totalStudents = allStudents.length;

  const netFoodAmount = foodExpenses + Number(balance.prevBalance || 0) - Number(balance.closingBalance || 0);
  const foodRatePerDay = totalAttendance > 0 ? netFoodAmount / totalAttendance : 0;
  const staffRatePerStudent = totalStudents > 0 ? staffExpenses / totalStudents : 0;

  // ─── SEND DRAFT ────────────────────────────────────────────
  async function sendDraft() {
    // ── CLOSING BALANCE VALIDATION ─────────────────────────
    // Closing balance must not exceed total monthly expenses
    const closingBal = Number(balance.closingBalance || 0);
    if (closingBal > foodExpenses) {
      showToast(`Closing balance (₹${closingBal.toFixed(2)}) exceeds food expenses (₹${foodExpenses.toFixed(2)}). Update it in Expenses page first.`, "warning");
      return;
    }

    // ── CONFIRM ───────────────────────────────────────────
    const confirm = window.confirm(
      `Send draft bill for ${selectedMonth} to students?\n\nStudents will be able to view their estimated bill. You can still edit expenses until you publish.`
    );
    if (!confirm) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/bill/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth }),
      });
      if (!res.ok) throw new Error("Failed to send draft");
      const data = await res.json();
      setIsDrafted(true);
      setDraftedAt(data.draftedAt);
    } catch (err) {
      showToast("Error sending draft. Is the server running?", "error");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  // ─── PUBLISH BILL ──────────────────────────────────────────
  async function publishBill() {
    // Can only publish previous month's bill, not current month
    const currentMonthStr = `${nowY}-${String(nowM).padStart(2,"0")}`;
    if (selectedMonth === currentMonthStr) {
      showToast(`Cannot publish ${MONTHS[nowM - 1]} ${nowY} bill yet — wait until the month ends.`, "warning");
      return;
    }
    const confirm = window.confirm(
      `Publish final mess bill for ${selectedMonth}?\n\n⚠️ Once published:\n• Expenses for this month will be frozen\n• Attendance for this month will be frozen\n• This cannot be undone`
    );
    if (!confirm) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/bill/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth }),
      });
      if (!res.ok) throw new Error("Failed to publish");
      const data = await res.json();
      setIsPublished(true);
      setPublishedAt(data.publishedAt);
    } catch (err) {
      showToast("Error publishing bill. Is the server running?", "error");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }


  // ─── PERIOD PICKER — current month, prev month, current year only ───
  const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const nowM = new Date().getMonth() + 1;
  const nowY = new Date().getFullYear();
  const prevM = nowM === 1 ? 12 : nowM - 1;
  const prevY = nowM === 1 ? nowY - 1 : nowY;

  const PERIOD_OPTIONS = [
    { label: `${MONTHS[prevM - 1]} ${prevY}`, value: `${prevY}-${String(prevM).padStart(2,"0")}` },
    { label: `${MONTHS[nowM - 1]} ${nowY}`,   value: `${nowY}-${String(nowM).padStart(2,"0")}` },
  ];

  return (
    <Layout>
      <div className="expenses-container" style={{ paddingBottom: "80px" }}>

        {/* HEADER ROW */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <h2 style={{ margin: 0 }}>Mess Bill</h2>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Status badges */}
            {isDrafted && !isPublished && (
              <div style={{
                background: "#fef9c3", color: "#854d0e",
                border: "1px solid #fde047", borderRadius: "8px",
                padding: "6px 12px", fontSize: "12px", fontWeight: "600",
              }}>
                📋 Draft sent {draftedAt ? `on ${new Date(draftedAt).toLocaleDateString()}` : ""}
              </div>
            )}
            {isPublished && (
              <div style={{
                background: "#dcfce7", color: "#16a34a",
                border: "1px solid #86efac", borderRadius: "8px",
                padding: "6px 12px", fontSize: "12px", fontWeight: "600",
              }}>
                ✓ Published {publishedAt ? `on ${new Date(publishedAt).toLocaleDateString()}` : ""}
              </div>
            )}

            {/* Action button */}
            {!isPublished && !isDrafted && (
              <button onClick={sendDraft} disabled={actionLoading || loading} style={btnStyle("#3b82f6", "#2563eb")}>
                {actionLoading ? "Sending..." : "📋 Send Draft"}
              </button>
            )}
            {isDrafted && !isPublished && (() => {
              const currentMonthStr = `${nowY}-${String(nowM).padStart(2,"0")}`;
              const isCurrentMonth = selectedMonth === currentMonthStr;
              return (
                <button
                  onClick={publishBill}
                  disabled={actionLoading || loading || isCurrentMonth}
                  title={isCurrentMonth ? `Cannot publish current month's bill` : ""}
                  style={{
                    ...btnStyle("#f59e0b", "#d97706"),
                    opacity: isCurrentMonth ? 0.45 : 1,
                    cursor: isCurrentMonth ? "not-allowed" : "pointer",
                  }}
                >
                  {actionLoading ? "Publishing..." : "📢 Publish Bill"}
                </button>
              );
            })()}
          </div>
        </div>

        {/* Period picker — prev month and current month only */}
        <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <label><b>Month :</b></label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid #dde3ef", fontSize: "13px", background: "#f8faff", cursor: "pointer" }}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Info — current month cannot be published */}
        {(() => {
          const currentMonthStr = `${nowY}-${String(nowM).padStart(2,"0")}`;
          return selectedMonth === currentMonthStr && isDrafted && !isPublished ? (
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe",
              color: "#1e40af", padding: "10px 16px", borderRadius: "8px",
              marginBottom: "14px", fontSize: "13px",
            }}>
              ℹ️ <b>{MONTHS[nowM - 1]} {nowY}</b> bill cannot be published until the month ends. Switch to <b>{MONTHS[prevM - 1]} {prevY}</b> to publish.
            </div>
          ) : null;
        })()}

        {/* TOAST */}
      {toast && <AlertToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {error && (
          <div style={{
            color: "#dc2626", background: "#fee2e2",
            padding: "10px 14px", borderRadius: "8px",
            marginBottom: "14px", fontSize: "13px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Student bill table */}
        <div className="table-responsive" style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
          <table className="expense-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Student</th>
                <th>Attendance Days</th>
                <th>Food Bill</th>
                <th>Staff Share</th>
                <th>Total Bill</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>Loading...</td></tr>
              ) : allStudents.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No students found.</td></tr>
              ) : (
                allStudents.map((student) => {
                  const days = calculateAttendance(student);
                  const foodBill = days * foodRatePerDay;
                  const totalBill = foodBill + staffRatePerStudent;
                  return (
                    <tr key={student._id}>
                      <td>{student.room}</td>
                      <td>{student.name}</td>
                      <td>{days}</td>
                      <td>₹{foodBill.toFixed(2)}</td>
                      <td>₹{staffRatePerStudent.toFixed(2)}</td>
                      <td><b>₹{totalBill.toFixed(2)}</b></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
      </div>

      {/* FIXED SUMMARY BAR — same style as Expenses page */}
      <div className="summary-card">
        <div>Food: ₹{foodExpenses.toFixed(2)}</div>
        <div>Staff: ₹{staffExpenses.toFixed(2)}</div>
        <div>+ Prev: ₹{Number(balance.prevBalance || 0).toFixed(2)}</div>
        <div>− Closing: ₹{Number(balance.closingBalance || 0).toFixed(2)}</div>
        <div>Attendance: {totalAttendance} days</div>
        
        
      </div>
    </Layout>
  );
}

// ─── BUTTON STYLE HELPER ───────────────────────────────────
function btnStyle(from, to) {
  return {
    background: `linear-gradient(135deg, ${from}, ${to})`,
    color: "white",
    border: "none",
    padding: "9px 22px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: `0 2px 8px ${from}55`,
    whiteSpace: "nowrap",
  };
}