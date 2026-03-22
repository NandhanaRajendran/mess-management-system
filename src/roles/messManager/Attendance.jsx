import { useState, useEffect, useCallback, useRef } from "react";
import Layout from "../../components/Layout";
import AlertToast from "../../components/Alerttoast";

//const API = "http://localhost:8000";
const API = "https://mess-management-system-q6us.onrender.com";

const ModernSelect = ({ value, onChange, options, style, disabled }) => {
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
          boxShadow: isOpen ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "0 1px 2px rgba(0,0,0,0.05)",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "14px",
          opacity: disabled ? 0.65 : 1, width: "100%", boxSizing: "border-box", minHeight: "36px",
          display: "flex", alignItems: "center"
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOpt ? selectedOpt.label : "Select"}
        </span>
      </div>
      {isOpen && !disabled && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0,
            width: "100%", minWidth: "120px", maxHeight: "250px", overflowY: "auto",
            backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            zIndex: 9999, padding: "4px", boxSizing: "border-box"
          }}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onChange({ target: { value: opt.value } }); setIsOpen(false); }}
              style={{
                padding: "8px 12px", fontSize: "13px", fontWeight: "500",
                color: String(opt.value) === String(value) ? "#1d4ed8" : "#334155",
                backgroundColor: String(opt.value) === String(value) ? "#eff6ff" : "transparent",
                borderRadius: "6px", cursor: "pointer", transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => { if (String(opt.value) !== String(value)) e.target.style.backgroundColor = "#f8fafc"; }}
              onMouseLeave={(e) => { if (String(opt.value) !== String(value)) e.target.style.backgroundColor = "transparent"; }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const STAFF_CONFIG = {
  "Cook Salary":   { label: "Cook",   ratePerDay: 710, maxDays: (dim) => dim - 1 },
  "Matron Salary": { label: "Matron", ratePerDay: 800, maxDays: ()    => 27      },
};

export default function Attendance() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const selectedMonth = date.slice(0, 7);

  const [y, m] = selectedMonth.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();

  const nowDate = new Date();
  const nowY    = nowDate.getFullYear();
  const nowM    = nowDate.getMonth() + 1;
  const prevM   = nowM === 1 ? 12 : nowM - 1;
  const prevY   = nowM === 1 ? nowY - 1 : nowY;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = tomorrow.toISOString().split("T")[0];

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const YEAR_OPTIONS = [...new Set([prevY, nowY])];

  const pickerYear  = parseInt(date.split("-")[0]);
  const pickerMonth = parseInt(date.split("-")[1]);
  const pickerDay   = parseInt(date.split("-")[2]);

  const MONTH_OPTIONS = MONTH_NAMES.map((name, i) => ({ name, num: i + 1 })).filter(({ num }) => {
    if (pickerYear === nowY && pickerYear === prevY) return num === nowM || num === prevM;
    if (pickerYear === nowY)  return num === nowM;
    if (pickerYear === prevY) return num === prevM;
    return false;
  });

  const daysInPickerMonth = new Date(pickerYear, pickerMonth, 0).getDate();
  const DAYS = Array.from({ length: daysInPickerMonth }, (_, i) => i + 1).filter((d) => {
    const dStr = `${pickerYear}-${String(pickerMonth).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return dStr <= maxDate;
  });

  function handlePickerYear(yy) {
    let mm = pickerMonth;
    if (yy === nowY && yy !== prevY) mm = nowM;
    if (yy === prevY && yy !== nowY) mm = prevM;
    const maxD = new Date(yy, mm, 0).getDate();
    const d = Math.min(pickerDay, maxD);
    const newDate = `${yy}-${String(mm).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    setDate(newDate <= maxDate ? newDate : maxDate);
  }
  function handlePickerMonth(mm) {
    const maxD = new Date(pickerYear, mm, 0).getDate();
    const d = Math.min(pickerDay, maxD);
    const newDate = `${pickerYear}-${String(mm).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    setDate(newDate <= maxDate ? newDate : maxDate);
  }
  function handlePickerDay(d) {
    setDate(`${pickerYear}-${String(pickerMonth).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
  }

  const [students,      setStudents]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [isPublished,   setIsPublished]   = useState(false);
  const [toast,         setToast]         = useState(null);
  const [updating,      setUpdating]      = useState(null);
  const [staffAtt,      setStaffAtt]      = useState({ "Cook Salary": {}, "Matron Salary": {} });
  const [staffUpdating, setStaffUpdating] = useState(null);

  const showToast = (message, type = "info") => setToast({ message, type });

  const fetchAll = useCallback(async () => {
    try {
      const [studRes, billRes, staffRes] = await Promise.all([
        fetch(`${API}/api/students`),
        fetch(`${API}/api/bill/${selectedMonth}`),
        fetch(`${API}/api/staff-attendance/${selectedMonth}`),
      ]);
      if (!studRes.ok) throw new Error("Failed to fetch students");
      const studData  = await studRes.json();
      const billData  = billRes.ok  ? await billRes.json()  : {};
      const staffData = staffRes.ok ? await staffRes.json() : [];

      studData.sort((a, b) => a.room.localeCompare(b.room) || a.name.localeCompare(b.name));
      setStudents(studData);
      setIsPublished(billData?.published || false);

      const map = { "Cook Salary": {}, "Matron Salary": {} };
      staffData.forEach((r) => {
        if (map[r.staffType]) map[r.staffType] = r.dailyRecords || {};
      });
      setStaffAtt(map);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function getStaffPresent(type) {
    return staffAtt[type]?.[date] ?? false;
  }

  async function toggleStaffPresent(type) {
    if (isPublished) { showToast("Attendance is frozen — bill has been published.", "warning"); return; }
    const current    = getStaffPresent(type);
    const newRecords = { ...staffAtt[type], [date]: !current };
    setStaffAtt((prev) => ({ ...prev, [type]: newRecords }));
    setStaffUpdating(type);
    try {
      const res = await fetch(`${API}/api/staff-attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth, staffType: type, dailyRecords: newRecords }),
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch {
      showToast("Error updating staff attendance.", "error");
      setStaffAtt((prev) => ({ ...prev, [type]: staffAtt[type] }));
    } finally {
      setStaffUpdating(null);
    }
  }

  function staffMonthlyCount(type) {
    const records = staffAtt[type] || {};
    const actual  = Object.entries(records).filter(([d, p]) => d.startsWith(selectedMonth) && p).length;
    const max     = STAFF_CONFIG[type].maxDays(daysInMonth);
    return { actual, capped: Math.min(actual, max), max };
  }

  function staffSalary(type) {
    const { capped } = staffMonthlyCount(type);
    return capped * STAFF_CONFIG[type].ratePerDay;
  }

  function getDailyRecord(student) {
    const record = student.attendance?.find((r) => r.date === date);
    return { present: record?.present ?? false, messcut: record?.messCut ?? true };
  }

  function getStatus(present, messcut) {
    if ( present && !messcut) return { label: "Present", bg: "#1D9E75", color: "#fff" };
    if ( present &&  messcut) return { label: "Present", bg: "#7F77DD", color: "#fff" };
    if (!present && !messcut) return { label: "Absent",  bg: "#EF9F27", color: "#fff" };
    return                           { label: "Absent",  bg: "#E24B4A", color: "#fff" };
  }

  function monthlyCount(student) {
    return calculateAttendance(student.attendance || [], selectedMonth);
  }

  // ─── ATTENDANCE ALGORITHM ──────────────────────────────────
  // - absent+cut → never counts
  // - present/absent+nocut → always counts
  // - cut chain with any absent+cut → entire chain skipped
  // - cut chain all present+cut 3+ days → entire chain skipped
  // - cut chain all present+cut <3 days → counts normally
  // - unrecorded days → not counted
  function calculateAttendance(records, month) {
    const [yr, mo] = month.split("-").map(Number);
    const daysInMo = new Date(yr, mo, 0).getDate();

    // Only count up to today
    const todayStr = new Date().toISOString().split("T")[0];
    const [ty, tm, td] = todayStr.split("-").map(Number);
    const lastDay = (yr === ty && mo === tm) ? td : daysInMo;

    const chains = [];
    let currentChain = null;

    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${yr}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const rec     = records.find((r) => r.date === dateStr);

      // No record = not marked, skip entirely — breaks any open chain
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

    // Only count recorded days that are not skipped
    let count = 0;
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${yr}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const rec = records.find((r) => r.date === dateStr);
      if (rec && !skipped.has(dateStr)) count++;
    }
    return count;
  }

  async function updateAttendance(student, newPresent, newMesscut) {
    if (isPublished) { showToast("Attendance is frozen — bill has been published.", "warning"); return; }
    setUpdating(student._id);
    try {
      const res = await fetch(`${API}/api/students/attendance/${student._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, present: newPresent, messCut: newMesscut }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setStudents((prev) => prev.map((s) => s._id === updated._id ? updated : s));
    } catch {
      showToast("Error updating attendance.", "error");
    } finally {
      setUpdating(null);
    }
  }

  function togglePresent(student) {
    const { present, messcut } = getDailyRecord(student);
    updateAttendance(student, !present, messcut);
  }

  function toggleCut(student) {
    const { present, messcut } = getDailyRecord(student);
    updateAttendance(student, present, !messcut);
  }

  async function markAll(type) {
    if (isPublished) { showToast("Attendance is frozen.", "warning"); return; }
    for (const s of students) {
      await updateAttendance(s, type === "present", type === "cut");
    }
  }

  let prevRoom = null;

  const thStyle = (left) => ({
    padding: "11px 14px",
    textAlign: left ? "left" : "center",
    fontSize: "11px", fontWeight: "700",
    textTransform: "uppercase", letterSpacing: "0.07em",
    color: "#64748b", borderBottom: "2px solid #e2e8f0",
  });

  return (
    <Layout>
      <div style={{ paddingBottom: "20px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#0a1f5c" }}>Attendance</h2>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <ModernSelect
                value={pickerDay}
                onChange={(e) => handlePickerDay(Number(e.target.value))}
                options={DAYS.map((d) => ({ value: d, label: String(d).padStart(2,"0") }))}
                style={{ width: "80px" }}
              />
              <ModernSelect
                value={pickerMonth}
                onChange={(e) => handlePickerMonth(Number(e.target.value))}
                options={MONTH_OPTIONS.map(({ name, num }) => ({ value: num, label: name }))}
                style={{ width: "130px" }}
              />
              <ModernSelect
                value={pickerYear}
                onChange={(e) => handlePickerYear(Number(e.target.value))}
                options={YEAR_OPTIONS.map((yy) => ({ value: yy, label: yy }))}
                style={{ width: "96px" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { label: "Present",         bg: "#1D9E75" },
              { label: "Present + Cut",   bg: "#7F77DD" },
              { label: "Absent (counts)", bg: "#EF9F27" },
              { label: "Absent + Cut",    bg: "#E24B4A" },
            ].map(({ label, bg }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#64748b", background: "#f8faff", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "3px 8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "3px", background: bg, display: "inline-block" }}></span>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* BULK ACTIONS */}
        {!isPublished && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
            <button onClick={() => markAll("present")} style={{ background: "#1e40af", color: "#fff", border: "none", padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
              Mark all Present
            </button>
            <button onClick={() => markAll("cut")} style={{ background: "#64748b", color: "#fff", border: "none", padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
              Mark all Absent + Cut
            </button>
          </div>
        )}

        {isPublished && (
          <div style={{ background: "#fef9c3", border: "1px solid #fde047", color: "#854d0e", padding: "10px 16px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px", fontWeight: "600" }}>
            🔒 Bill published — attendance is frozen.
          </div>
        )}

        {error && (
          <div style={{ color: "#dc2626", background: "#fee2e2", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* DAILY COUNT SUMMARY */}
        {!loading && (() => {
          const total   = students.length;
          const present = students.filter(s => getDailyRecord(s).present).length;
          const absent  = total - present;
          const cut     = students.filter(s => getDailyRecord(s).messcut).length;
          const food    = students.filter(s => !getDailyRecord(s).messcut).length;
          return (
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
              {[
                { label: "Total Students", value: total,   hl: false },
                { label: "Present",        value: present, hl: false },
                { label: "Absent",         value: absent,  hl: false },
                { label: "Mess Cut",       value: cut,     hl: false },
                { label: "Food Count",     value: food,    hl: true  },
              ].map(({ label, value, hl }) => (
                <div key={label} style={{
                  background: hl ? "#eff6ff" : "#ffffff",
                  border: hl ? "1px solid #bfdbfe" : "1px solid #e4e8f5",
                  borderRadius: "10px", padding: "10px 18px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
                  minWidth: "100px",
                  boxShadow: hl ? "0 0 0 2px #bfdbfe" : "0 1px 3px rgba(15,21,35,0.06)",
                }}>
                  <span style={{ fontSize: "22px", fontWeight: "700", color: "#1e3a8a", lineHeight: 1 }}>{value}</span>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{label}</span>
                </div>
              ))}
            </div>
          );
        })()}

        {/* TABLE */}
        <div style={{ background: "#fff", border: "1px solid #e8edf6", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 10px rgba(10,31,92,0.06)" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[["Room/Role", true], ["Ad No / Rate", true], ["Name", true], ["Daily Attendance", false], ["Mess Cut", false], ["Monthly", false]].map(([h, left]) => (
                    <th key={h} style={thStyle(left)}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>

                {/* ── STAFF ROWS ── */}
                {Object.entries(STAFF_CONFIG).map(([type, cfg]) => {
                  const present  = getStaffPresent(type);
                  const isUpd    = staffUpdating === type;
                  const { actual, capped, max } = staffMonthlyCount(type);
                  const salary   = staffSalary(type);
                  const isCapped = actual > max;

                  return (
                    <tr key={type} style={{ background: "#f8fafc", borderBottom: "1px solid #e4e8f5" }}>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ background: "#dbeafe", color: "#1e40af", borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: "700" }}>STAFF</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#3b82f6", fontSize: "12px", fontWeight: "600" }}>
                        ₹{cfg.ratePerDay}/day
                      </td>
                      <td style={{ padding: "10px 14px", color: "#1e3a8a", fontWeight: "700" }}>
                        {cfg.label}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        <button
                          onClick={() => toggleStaffPresent(type)}
                          disabled={isPublished || isUpd}
                          style={{
                            background: present ? "#1D9E75" : "#E24B4A",
                            color: "#fff", border: "none",
                            padding: "5px 14px", borderRadius: "8px",
                            fontSize: "12px", fontWeight: "600",
                            cursor: isPublished ? "not-allowed" : "pointer",
                            minWidth: "80px",
                            opacity: isUpd ? 0.6 : 1,
                            transition: "opacity 0.15s",
                          }}
                        >
                          {present ? "Present" : "Absent"}
                        </button>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center", color: "#a0aec0", fontSize: "12px" }}>—</td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {capped} days
                          {isCapped && (
                            <span style={{ marginLeft: "4px", fontSize: "10px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: "4px", padding: "1px 5px" }}>
                              cap
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#1d4ed8" }}>₹{salary.toLocaleString()}</div>
                      </td>
                    </tr>
                  );
                })}

                {/* ── DIVIDER ── */}
                <tr>
                  <td colSpan={6} style={{ background: "#f8faff", padding: "6px 14px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", borderTop: "2px solid #e2e8f0", borderBottom: "2px solid #e2e8f0" }}>
                    Students
                  </td>
                </tr>

                {/* ── STUDENT ROWS ── */}
                {students.map((student) => {
                  const { present, messcut } = getDailyRecord(student);
                  const status    = getStatus(present, messcut);
                  const isNewRoom = student.room !== prevRoom;
                  prevRoom        = student.room;
                  const isUpd     = updating === student._id;

                  return (
                    <tr key={student._id} style={{ borderTop: isNewRoom && students.indexOf(student) !== 0 ? "2px solid #e2e8f0" : "1px solid #f1f5f9", opacity: isUpd ? 0.6 : 1, transition: "opacity 0.15s" }}>
                      <td style={{ padding: "10px 14px", fontWeight: "700", color: "#0f172a" }}>{student.room}</td>
                      <td style={{ padding: "10px 14px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>{student.adno || "—"}</td>
                      <td style={{ padding: "10px 14px", color: "#1e293b", fontWeight: "500" }}>{student.name}</td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        <button onClick={() => togglePresent(student)} disabled={isPublished || isUpd}
                          style={{ background: status.bg, color: status.color, border: "none", padding: "5px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: isPublished ? "not-allowed" : "pointer", minWidth: "80px", opacity: isPublished ? 0.7 : 1 }}>
                          {status.label}
                        </button>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        <button onClick={() => toggleCut(student)} disabled={isPublished || isUpd}
                          style={{ background: messcut ? "#7F77DD" : "#f1f5f9", color: messcut ? "#fff" : "#64748b", border: "1px solid #e2e8f0", padding: "5px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: isPublished ? "not-allowed" : "pointer" }}>
                          {messcut ? "Cut" : "No Cut"}
                        </button>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center", color: "#64748b", fontSize: "12px" }}>
                        {monthlyCount(student)} days
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!loading && (
          <div style={{ marginTop: "10px", fontSize: "12px", color: "#94a3b8", textAlign: "right" }}>
            {students.length} students · {[...new Set(students.map(s => s.room))].length} rooms
          </div>
        )}
      </div>

      {toast && <AlertToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}