import React, { useState, useMemo, useEffect } from "react";
import { Search, LogOut, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/staffadvisor.css";

const PTADashboard = () => {

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: "All",
    batch: "All",
    semester: "All"
  });
  const [pendingFilters, setPendingFilters] = useState({
    department: "All",
    batch: "All"
  });

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5001/api/pta/students");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const user = useMemo(() => {
    return JSON.parse(localStorage.getItem("user")) || {};
  }, []);

  const departments = useMemo(
    () => ["All", ...new Set(students.map((s) => s.department))],
    [students]
  );

  const batches = useMemo(
    () => ["All", ...new Set(students.map((s) => s.batch))],
    [students]
  );

  const semesters = useMemo(
    () => ["All", ...new Set(students.map((s) => s.semester))].sort(),
    [students]
  );

  // ─── Overview tab: all students filtered ────────────────────────────────
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchDept = filters.department === "All" || student.department === filters.department;
      const matchBatch = filters.batch === "All" || student.batch === filters.batch;
      const matchSem = filters.semester === "All" || student.semester.toString() === filters.semester.toString();
      const matchSearch = searchTerm === "" ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(student.admissionNumber).toLowerCase().includes(searchTerm.toLowerCase());
      return matchDept && matchBatch && matchSem && matchSearch;
    });
  }, [filters, searchTerm, students]);

  const sortedStudents = useMemo(() => {
    let result = [...filteredStudents];
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = sortConfig.key === "ptaFee" ? a.fees.PTA : a[sortConfig.key];
        let bValue = sortConfig.key === "ptaFee" ? b.fees.PTA : b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [sortConfig, filteredStudents]);

  const totalPTAFee = useMemo(() => {
    return filteredStudents.reduce((sum, s) => sum + (s.fees?.PTA || 0), 0);
  }, [filteredStudents]);

  // ─── Pending Fees tab: only PTA fee, only pending students ────────────────
  const pendingFeeRows = useMemo(() => {
    const rows = [];
    for (const student of students) {
      // Only students with Pending status
      if (student.status?.trim().toLowerCase() !== "pending") continue;

      // Department / batch filters
      if (pendingFilters.department !== "All" && student.department !== pendingFilters.department) continue;
      if (pendingFilters.batch !== "All" && student.batch !== pendingFilters.batch) continue;

      // Resolve the fees object
      const feesObj = student.fees instanceof Map
        ? Object.fromEntries(student.fees)
        : (typeof student.fees === "object" ? student.fees : {});

      // Only look at the PTA fee
      const ptaAmount = feesObj["PTA"] || 0;
      if (ptaAmount <= 0) continue; // skip if no PTA fee

      // Search filter
      if (pendingSearch !== "" &&
        !student.name.toLowerCase().includes(pendingSearch.toLowerCase()) &&
        !String(student.admissionNumber).includes(pendingSearch)) {
        continue;
      }

      rows.push({
        key: `${student._id || student.admissionNumber}-PTA`,
        studentId: student._id || student.admissionNumber,
        admissionNumber: student.admissionNumber,
        name: student.name,
        department: student.department,
        batch: student.batch,
        semester: student.semester,
        feeType: "PTA",
        amount: ptaAmount,
        paymentStatus: "Pending",
      });
    }
    return rows;
  }, [students, pendingFilters, pendingSearch]);

  const pendingTotal = useMemo(
    () => pendingFeeRows.reduce((sum, r) => sum + r.amount, 0),
    [pendingFeeRows]
  );

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="sort-icon" />;
    return sortConfig.direction === "asc"
      ? <ArrowUp size={14} className="sort-icon" />
      : <ArrowDown size={14} className="sort-icon" />;
  };

  // ─── Style helpers ───────────────────────────────────────────────────────
  const thStyle = {
    padding: "0.875rem 1rem",
    textAlign: "left",
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#475569",
    borderBottom: "2px solid rgba(79,172,254,0.2)",
    whiteSpace: "nowrap",
    background: "rgba(255,255,255,0.9)",
    position: "sticky",
    top: 0,
    zIndex: 1,
    cursor: "default",
  };
  const tdStyle = { padding: "0.875rem 1rem", fontSize: "0.875rem", borderBottom: "1px solid rgba(255,255,255,0.3)" };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-container fade-in">
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>

      {/* HEADER */}
      <header className="top-bar glass-panel">
        <div className="user-info">
          <div className="user-details">
            <h2>Welcome, {user?.name || "PTA Faculty"}</h2>
            <p>PTA Faculty - University Admin View</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} style={{ marginRight: "6px" }} />
          Logout
        </button>
      </header>

      {/* TABS */}
      <div className="tabs-container fade-in" style={{ marginTop: "1rem" }}>
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          ⚠️ Pending Fees
          {students.filter(s => s.status?.trim().toLowerCase() === "pending").length > 0 && (
            <span style={{
              marginLeft: "8px",
              background: "#ef4444",
              color: "white",
              borderRadius: "9999px",
              fontSize: "0.7rem",
              padding: "1px 7px",
              fontWeight: 700,
            }}>
              {students.filter(s => s.status?.trim().toLowerCase() === "pending").length}
            </span>
          )}
        </button>
      </div>

      {/* ── OVERVIEW TAB ────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="glass-panel" style={{ padding: "1.5rem", marginTop: "1rem" }}>
          {/* Summary Cards */}
          <div className="summary-grid" style={{ marginBottom: "1.5rem" }}>
            <div className="summary-card glass-panel">
              <div className="summary-icon">👥</div>
              <div className="summary-stats">
                <h3>Total Students</h3>
                <p>{students.length}</p>
              </div>
            </div>
            <div className="summary-card glass-panel">
              <div className="summary-icon">✅</div>
              <div className="summary-stats">
                <h3>Fully Paid</h3>
                <p>{students.filter(s => s.status?.trim().toLowerCase() === "paid").length}</p>
              </div>
            </div>
            <div className="summary-card glass-panel">
              <div className="summary-icon">⚠️</div>
              <div className="summary-stats">
                <h3>Pending</h3>
                <p>{students.filter(s => s.status?.trim().toLowerCase() === "pending").length}</p>
              </div>
            </div>
          </div>

          <div className="table-toolbar" style={{ flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, minWidth: "200px" }}>Student PTA Fee Records</h3>
            <div className="search-box">
              <Search className="icon" size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or admission no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <select className="filter-select" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
                <option value="All">All Branches</option>
                {departments.filter(d => d !== "All").map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="filter-select" value={filters.batch} onChange={(e) => setFilters({ ...filters, batch: e.target.value })}>
                <option value="All">All Batches</option>
                {batches.filter(b => b !== "All").map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select className="filter-select" value={filters.semester} onChange={(e) => setFilters({ ...filters, semester: e.target.value })}>
                <option value="All">All Semesters</option>
                {semesters.filter(s => s !== "All").map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => requestSort("admissionNumber")}>Adm No {getSortIcon("admissionNumber")}</th>
                  <th onClick={() => requestSort("name")}>Name {getSortIcon("name")}</th>
                  <th onClick={() => requestSort("department")}>Branch {getSortIcon("department")}</th>
                  <th onClick={() => requestSort("batch")}>Batch {getSortIcon("batch")}</th>
                  <th onClick={() => requestSort("semester")}>Sem {getSortIcon("semester")}</th>
                  <th onClick={() => requestSort("ptaFee")}>PTA Fee {getSortIcon("ptaFee")}</th>
                  <th onClick={() => requestSort("status")}>Status {getSortIcon("status")}</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.length > 0 ? (
                  sortedStudents.map((student) => (
                    <tr key={student._id || student.id}>
                      <td><strong>{student.admissionNumber}</strong></td>
                      <td>{student.name}</td>
                      <td>{student.department}</td>
                      <td>{student.batch}</td>
                      <td>{student.semester}</td>
                      <td>₹{student.fees?.PTA || 0}</td>
                      <td>
                        <span className={`status-badge ${student.status?.trim().toLowerCase() === "paid" ? "status-paid" : "status-pending"}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                      {loading ? "Loading records..." : "No students matching these criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="sticky-footer">
                  <td colSpan="5" style={{ textAlign: "right", paddingRight: "1.5rem" }}>Total</td>
                  <td>₹{totalPTAFee}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── PENDING FEES TAB ─────────────────────────────────────────────────── */}
      {activeTab === "pending" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>

          {/* Summary strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="summary-card glass-panel">
              <div className="summary-icon">⚠️</div>
              <div className="summary-stats">
                <h3>Pending Students</h3>
                <p>{students.filter(s => s.status?.trim().toLowerCase() === "pending").length}</p>
              </div>
            </div>
            <div className="summary-card glass-panel">
              <div className="summary-icon">📋</div>
              <div className="summary-stats">
                <h3>Pending Fee Records</h3>
                <p>{pendingFeeRows.length}</p>
              </div>
            </div>
            <div className="summary-card glass-panel">
              <div className="summary-icon">💰</div>
              <div className="summary-stats">
                <h3>Total Pending Amount</h3>
                <p style={{ color: "#ef4444" }}>₹{pendingTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Filters + Table */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <div className="table-toolbar" style={{ flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ margin: "0 0 0.25rem" }}>Students with Pending PTA Fees</h3>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                  Only students with <strong>Pending</strong> payment status · showing <strong>PTA fee only</strong>
                </p>
              </div>
              <div className="search-box" style={{ minWidth: "220px" }}>
                <Search className="icon" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name or adm no..."
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <select className="filter-select" value={pendingFilters.department} onChange={(e) => setPendingFilters({ ...pendingFilters, department: e.target.value })}>
                  <option value="All">All Branches</option>
                  {departments.filter(d => d !== "All").map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="filter-select" value={pendingFilters.batch} onChange={(e) => setPendingFilters({ ...pendingFilters, batch: e.target.value })}>
                  <option value="All">All Batches</option>
                  {batches.filter(b => b !== "All").map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.35)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Adm No", "Student Name", "Branch", "Batch", "Sem", "Fee Category", "Amount Due", "Payment Status"].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan="8" style={{ ...tdStyle, textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Loading records...</td></tr>
                  )}
                  {!loading && pendingFeeRows.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ ...tdStyle, textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                        🎉 No pending fees found for the selected filters!
                      </td>
                    </tr>
                  )}
                  {!loading && pendingFeeRows.map((row, idx) => (
                    <tr
                      key={row.key}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.45)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{row.admissionNumber}</td>
                      <td style={tdStyle}>{row.name}</td>
                      <td style={{ ...tdStyle, color: "#475569" }}>{row.department}</td>
                      <td style={{ ...tdStyle, color: "#475569" }}>{row.batch}</td>
                      <td style={tdStyle}>
                        <span className="semester-badge">S{row.semester}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ background: "rgba(79,172,254,0.12)", color: "#0369a1", padding: "2px 10px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600 }}>
                          {row.feeType}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: "#ef4444", fontWeight: 700 }}>₹{row.amount}</td>
                      <td style={tdStyle}>
                        <span style={{ background: "rgba(245,158,11,0.15)", color: "#b45309", border: "1px solid rgba(245,158,11,0.3)", padding: "3px 10px", borderRadius: "9999px", fontSize: "0.73rem", fontWeight: 700, display: "inline-block" }}>
                          • Pending
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Total footer row */}
                  {!loading && pendingFeeRows.length > 0 && (
                    <tr style={{ background: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
                      <td colSpan="6" style={{ ...tdStyle, textAlign: "right", paddingRight: "1rem", color: "#475569" }}>
                        Total Pending Amount ({pendingFeeRows.length} records):
                      </td>
                      <td style={{ ...tdStyle, color: "#ef4444", fontSize: "1rem", fontWeight: 800 }}>₹{pendingTotal.toLocaleString()}</td>
                      <td style={tdStyle}></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PTADashboard;