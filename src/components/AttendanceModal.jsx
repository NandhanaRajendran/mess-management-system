import { useState, useEffect } from "react";
import "../styles/mess.css";

export default function AttendanceModal({ onClose }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [data, setData] = useState([]);

  const formatAttendance = (records, days, month, year) => {
    const arr = Array(days).fill({
      present: false,
      messCut: false,
    });

    records.forEach((r) => {
      const d = new Date(r.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const index = d.getDate() - 1;
        arr[index] = r;
      }
    });

    return arr;
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(
          `https://mess-management-system-q6us.onrender.com/api/students`,
        );

        const students = await res.json();

        setData(students);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };

    fetchAttendance();
  }, [month]);

  // 🔹 Get number of days dynamically
  const getDaysInMonth = (month) => {
    return new Date(2026, month + 1, 0).getDate();
  };

  const days = getDaysInMonth(month);

  // 🔹 Cell color logic
  const getCellClass = (day) => {
    if (day.present && !day.messCut) return "cell-green";
    if (day.present && day.messCut) return "cell-purple";
    if (!day.present && !day.messCut) return "cell-yellow";
    return "cell-red";
  };

  return (
    <div className="attendance-overlay">
      <div className="attendance-modal">
        {/* HEADER */}
        <div className="attendance-modal-header">
          <h2>Monthly Attendance</h2>
          <button className="attendance-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* CONTROLS */}
        <div className="attendance-controls">
          {/* Month Selector */}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {[
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ].map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>

          {/* LEGEND */}
          <div className="attendance-legend">
            <div className="legend-box">
              <div
                className="legend-color"
                style={{ background: "#2ecc71" }}
              ></div>
              Present
            </div>

            <div className="legend-box">
              <div
                className="legend-color"
                style={{ background: "#ea00ff" }}
              ></div>
              Present + Mess Cut
            </div>

            <div className="legend-box">
              <div
                className="legend-color"
                style={{ background: "#facc15" }}
              ></div>
              Absent
            </div>

            <div className="legend-box">
              <div
                className="legend-color"
                style={{ background: "#ef4444" }}
              ></div>
              Absent + Mess Cut
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="attendance-table-wrapper">
          <table className="attendance-sheet">
            <thead>
              <tr>
                <th>Room</th>
                <th>Ad No</th>
                <th>Name</th>

                {[...Array(days)].map((_, i) => (
                  <th key={i}>{i + 1}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((student, index) => {
                const formatted = formatAttendance(
                  student.attendance || [],
                  days,
                  month,
                  2026,
                );

                return (
                  <tr key={index}>
                    <td>{student.room}</td>
                    <td>{student.adno}</td>
                    <td>{student.name}</td>

                    {formatted.map((day, i) => (
                      <td key={i} className={getCellClass(day)}></td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
