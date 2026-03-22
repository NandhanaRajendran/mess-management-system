import { useState, useEffect } from "react";
import "../styles/mess.css";

const API = "http://localhost:8000";
// const API = "https://mess-management-system-q6us.onrender.com"; // ← uncomment for production

export default function AttendanceModal({ onClose }) {
  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-based

  const [month, setMonth] = useState(currentMonth);
  const [year,  setYear]  = useState(currentYear);
  const [data,  setData]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/students`);
        const students = await res.json();
        setData(students);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [month, year]);

  // ─── Days in selected month ────────────────────────────────
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // ─── Format attendance array for a student ─────────────────
  // FIX: parse date string directly (split by "-") instead of new Date()
  // to avoid UTC timezone shifting the day
  const formatAttendance = (records) => {
    // Default: no cut (needs food)
    const arr = Array(daysInMonth).fill(null).map(() => ({
      present: false,
      messCut: false,
    }));

    (records || []).forEach((r) => {
      const parts = r.date.split("-");           // ["2026", "03", "19"]
      const recYear  = parseInt(parts[0]);
      const recMonth = parseInt(parts[1]) - 1;   // 0-based
      const recDay   = parseInt(parts[2]);

      if (recYear === year && recMonth === month) {
        arr[recDay - 1] = { present: r.present, messCut: r.messCut };
      }
    });

    return arr;
  };

  // ─── Cell color ────────────────────────────────────────────
  const getCellClass = (day) => {
    if ( day.present && !day.messCut) return "cell-green";
    if ( day.present &&  day.messCut) return "cell-purple";
    if (!day.present && !day.messCut) return "cell-yellow";
    return "cell-red"; // absent + cut
  };

  // ─── Year options — current year and prev year ─────────────
  const YEAR_OPTIONS = [currentYear - 1, currentYear];
  const MONTH_NAMES  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="attendance-overlay">
      <div className="attendance-modal">

        {/* HEADER */}
        <div className="attendance-modal-header">
          <h2>Monthly Attendance</h2>
          <button className="attendance-close" onClick={onClose}>✕</button>
        </div>

        {/* CONTROLS */}
        <div className="attendance-controls">
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Year selector */}
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Month selector */}
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>

          {/* LEGEND */}
          <div className="attendance-legend">
            <div className="legend-box">
              <div className="legend-color" style={{ background: "#2ecc71" }}></div>
              Present
            </div>
            <div className="legend-box">
              <div className="legend-color" style={{ background: "#7f77dd" }}></div>
              Present + Cut
            </div>
            <div className="legend-box">
              <div className="legend-color" style={{ background: "#facc15" }}></div>
              Absent
            </div>
            <div className="legend-box">
              <div className="legend-color" style={{ background: "#ef4444" }}></div>
              Absent + Cut
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="attendance-table-wrapper">
          {loading ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
              Loading...
            </div>
          ) : (
            <table className="attendance-sheet">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Ad No</th>
                  <th>Name</th>
                  {[...Array(daysInMonth)].map((_, i) => (
                    <th key={i}>{i + 1}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.map((student, index) => {
                  const formatted = formatAttendance(student.attendance || []);
                  return (
                    <tr key={index}>
                      <td>{student.room}</td>
                      <td>{student.adno}</td>
                      <td>{student.name}</td>
                      {formatted.map((day, i) => (
                        <td
                          key={i}
                          className={getCellClass(day)}
                        ></td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}