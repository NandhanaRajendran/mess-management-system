import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import AttendanceModal from "../../components/AttendanceModal";

//const API = "http://localhost:8000";
const API = "https://mess-management-system-q6us.onrender.com";

const today        = new Date().toISOString().split("T")[0];
const currentMonth = new Date().toISOString().slice(0, 7);
const prevMonth    = (() => {
  const d = new Date(currentMonth + "-01");
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
})();

export default function Dashboard() {
  const navigate = useNavigate();
  const [showAttendance, setShowAttendance] = useState(false);

  const [students, setStudents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balance, setBalance] = useState({ prevBalance: 0, closingBalance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studRes, expRes, balRes] = await Promise.all([
          fetch(`${API}/api/students`),
          fetch(`${API}/api/expenses`),
          fetch(`${API}/api/balance/${currentMonth}`),
        ]);
        const studData = await studRes.json();
        const hostelInmates = studData.filter(s => s.room && s.room.trim() !== "");
        const expData  = await expRes.json();
        const balData  = balRes.ok ? await balRes.json() : {};
        setStudents(hostelInmates);
        setExpenses(expData);
        setBalance({
          prevBalance:    balData?.prevBalance    || 0,
          closingBalance: balData?.closingBalance || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalStudents = students.length;
  const presentToday  = students.filter((s) => s.attendance?.find((r) => r.date === today)?.present === true).length;
  const absentToday   = totalStudents - presentToday;
  const foodCount     = students.filter((s) => {
    const r = s.attendance?.find((a) => a.date === today);
    return r ? r.messCut === false : true;
  }).length;
  const rooms = [...new Set(students.map((s) => s.room))].length;

  function calculateAttendance(records, month) {
    const [y, m] = month.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();

    const todayStr = new Date().toISOString().split("T")[0];
    const [ty, tm, td] = todayStr.split("-").map(Number);
    const lastDay = (y === ty && m === tm) ? td : daysInMonth;

    const chains = [];
    let currentChain = null;
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const rec     = records.find((r) => r.date === dateStr);
      if (!rec) {
        if (currentChain) { chains.push(currentChain); currentChain = null; }
        continue;
      }
      const present = rec.present;
      const messCut = rec.messCut;
      if (messCut) {
        if (!currentChain) currentChain = { days: [], hasAbsentCut: false };
        currentChain.days.push({ date: dateStr, present });
        if (!present) currentChain.hasAbsentCut = true;
      } else {
        if (currentChain) { chains.push(currentChain); currentChain = null; }
      }
    }
    if (currentChain) chains.push(currentChain);
    const skipped = new Set();
    for (const chain of chains) {
      if (chain.hasAbsentCut || chain.days.length >= 3) {
        chain.days.forEach((d) => skipped.add(d.date));
      }
    }
    let count = 0;
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const rec = records.find((r) => r.date === dateStr);
      if (rec && !skipped.has(dateStr)) count++;
    }
    return count;
  }

  const monthlyAttendance = students.reduce((sum, s) => {
    return sum + calculateAttendance(s.attendance || [], currentMonth);
  }, 0);

  const monthlyAll    = expenses.filter((e) => e.billMonth === currentMonth);
  const foodExpenses  = monthlyAll.filter((e) => !e.isStaff).reduce((s, e) => s + e.amount, 0);
  const staffExpenses = monthlyAll.filter((e) =>  e.isStaff).reduce((s, e) => s + e.amount, 0);
  const totalExpenses = foodExpenses + staffExpenses;

  const card   = { background: "#ffffff", border: "1px solid #e4e8f5", borderRadius: "12px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "4px", cursor: "default" };
  const cardHL = { ...card, background: "#eff6ff", border: "1px solid #bfdbfe", boxShadow: "0 0 0 2px #bfdbfe" };
  const valSt  = { fontSize: "28px", fontWeight: "700", color: "#1e3a8a", lineHeight: 1 };
  const lblSt  = { fontSize: "11px", fontWeight: "600", color: "#64748b", opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.06em" };

  return (
    <Layout>
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: "30px" }}>

        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#0a1f5c" }}>Dashboard</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
          {[
            { label: "Attendance", path: "/mess/attendance", bg: "#f1f5ff", border: "#c7d2fe", color: "#3730a3" },
            { label: "Expenses",   path: "/mess/expenses",   bg: "#f0fdf4", border: "#86efac", color: "#166534" },
            { label: "Mess Bill",  path: "/mess/messbill",   bg: "#fffbeb", border: "#fcd34d", color: "#92400e" },
          ].map(({ label, path, bg, border, color }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                background: bg, border: `1px solid ${border}`,
                color, borderRadius: "10px", padding: "10px 22px",
                fontSize: "13px", fontWeight: "700", cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
              onMouseLeave={(e) => { e.target.style.transform = "translateY(0)";    e.target.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
            >
              {label} →
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ color: "#94a3b8", fontSize: "13px" }}>Loading stats...</div>
        ) : (
          <>
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.07em", color: "#64748b" }}>
                Today's Attendance
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                <div style={card}><span style={valSt}>{totalStudents}</span><span style={lblSt}>Total Students</span></div>
                <div style={card}><span style={valSt}>{presentToday}</span><span style={lblSt}>Present</span></div>
                <div style={card}><span style={valSt}>{absentToday}</span><span style={lblSt}>Absent</span></div>
                <div style={cardHL}><span style={valSt}>{foodCount}</span><span style={lblSt}>Food Count</span></div>
                <div style={card}><span style={valSt}>{rooms}</span><span style={lblSt}>Rooms</span></div>
                <div style={card}><span style={valSt}>{monthlyAttendance}</span><span style={lblSt}>Monthly Attendance</span></div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.07em", color: "#64748b" }}>
                {new Date().toLocaleString("en-IN", { month: "long" })} Expenses
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                <div style={card}><span style={valSt}>₹{foodExpenses.toLocaleString()}</span><span style={lblSt}>Food Expenses</span></div>
                <div style={card}><span style={valSt}>₹{staffExpenses.toLocaleString()}</span><span style={lblSt}>Staff Expenses</span></div>
                <div style={cardHL}><span style={valSt}>₹{totalExpenses.toLocaleString()}</span><span style={lblSt}>Total</span></div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.07em", color: "#64748b" }}>
                Balances
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                <div style={card}><span style={valSt}>₹{balance.prevBalance.toLocaleString()}</span><span style={lblSt}>Prev Balance ({prevMonth})</span></div>
                <div style={card}><span style={valSt}>₹{balance.closingBalance.toLocaleString()}</span><span style={lblSt}>Closing ({currentMonth})</span></div>
                <div style={cardHL}><span style={valSt}>₹{(totalExpenses + balance.prevBalance - balance.closingBalance).toLocaleString()}</span><span style={lblSt}>Net Amount</span></div>
              </div>
            </div>

            <div>
              <h3 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.07em", color: "#64748b" }}>
                Monthly View
              </h3>
              <button
                onClick={() => setShowAttendance(true)}
                style={{
                  background: "linear-gradient(135deg,#2f6bff,#1d4fd8)",
                  color: "#fff", border: "none", padding: "11px 24px",
                  borderRadius: "10px", fontSize: "13px", fontWeight: "700",
                  cursor: "pointer", boxShadow: "0 2px 8px rgba(47,107,255,0.3)",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                View Monthly Attendance Sheet
              </button>
            </div>
          </>
        )}
      </div>

      {showAttendance && (
        <AttendanceModal onClose={() => setShowAttendance(false)} />
      )}
    </Layout>
  );
}