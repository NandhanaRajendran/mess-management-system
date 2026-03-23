import React, { useState, useMemo, useEffect } from "react";
import { Search, LogOut, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/staffadvisor.css";

const StaffAdvisorDashboard = () => {

  const userContext = useMemo(() => {
    return JSON.parse(sessionStorage.getItem("user")) || {};
  }, []);
  
  // Try to use the user directly or their profile
  const user = userContext.profile || userContext;

  const [students, setStudents] = useState([]);
  const [, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [selectedFee] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");
  
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // Assuming user object has department and className/batch
        const dept = user?.department || userContext?.department || "Computer Science"; // Default to CS if empty for testing
        const batch = user?.className || user?.batch || userContext?.batch || "2021-25"; // Default if empty
        
        const response = await fetch(`http://localhost:8000/api/staff-advisor/students?department=${dept}&batch=${batch}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user, userContext]);

  const filteredStudents = useMemo(() => {
    return students;
  }, [students]);

  const processedStudents = useMemo(() => {
    let result = [...filteredStudents];

    if (activeTab === "dues") {
      result = result.filter((student) => {
        const isPending = student.status?.trim().toLowerCase() === "pending";
        if (!isPending) return false;
        if (selectedFee !== "All") {
          return student.fees[selectedFee] > 0;
        }
        return true;
      });
    }

    if (searchTerm) {
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.isFee) {
          aValue = a.fees[sortConfig.key];
          bValue = b.fees[sortConfig.key];
        }
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [filteredStudents, searchTerm, sortConfig, activeTab, selectedFee]);

  const requestSort = (key, isFee = false) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction, isFee });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown size={14} className="sort-icon" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} className="sort-icon" />
    ) : (
      <ArrowDown size={14} className="sort-icon" />
    );
  };

  const feeColumns = [
    { key: "Library", label: "Library" },
    { key: "PTA",     label: "PTA"     },
    { key: "HDF",     label: "HDF"     },
    { key: "Rent",    label: "Rent"    },
    { key: "Mess",    label: "Mess Fee"},
  ];

  const downloadCSV = () => {
    const pendingStudents = filteredStudents.filter(
      (s) => s.status?.trim().toLowerCase() === "pending"
    );
    if (pendingStudents.length === 0) return;

    const headers = ["Admission Number", "Name", ...feeColumns.map((c) => c.label), "Total Pending"];
    const rows = pendingStudents.map((student) => {
      const row = [student.admissionNumber, `"${student.name}"`];
      let total = 0;
      feeColumns.forEach((c) => {
        const amt = student.fees[c.key] || 0;
        row.push(amt);
        total += amt;
      });
      row.push(total);
      return row.join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pending_dues_${user?.department}_${user?.batch}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-container fade-in">

      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>

      {/* HEADER */}
      <header className="top-bar glass-panel">
        <div className="user-info">
          <div className="user-details">
            <h2>Welcome, {user?.name || "Staff Advisor"}</h2>
            <p>Staff Advisor - {user?.department} (Batch: {user?.batch})</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} style={{ marginRight: "6px" }} />
          Logout
        </button>
      </header>

      {/* TABS */}
      <div className="tabs-container fade-in">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "dues" ? "active" : ""}`}
          onClick={() => setActiveTab("dues")}
        >
          Dues
        </button>
      </div>

      {/* OVERVIEW CARDS */}
      {activeTab === "overview" && (
        <div className="summary-grid">
          <div className="summary-card glass-panel fade-in">
            <div className="summary-icon">👥</div>
            <div className="summary-stats">
              <h3>Total Students</h3>
              <p>{filteredStudents.length}</p>
            </div>
          </div>
          <div className="summary-card glass-panel fade-in">
            <div className="summary-icon">✅</div>
            <div className="summary-stats">
              <h3>Fully Paid</h3>
              <p>{filteredStudents.filter((s) => s.status?.trim().toLowerCase() === "paid").length}</p>
            </div>
          </div>
          <div className="summary-card glass-panel fade-in">
            <div className="summary-icon">⚠️</div>
            <div className="summary-stats">
              <h3>Pending Fees</h3>
              <p>{filteredStudents.filter((s) => s.status?.trim().toLowerCase() === "pending").length}</p>
            </div>
          </div>
        </div>
      )}

      {/* TABLE CARD */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div className="table-toolbar">
          <h3>{activeTab === "overview" ? "Fee Details" : "Pending Dues List"}</h3>
          {activeTab === "dues" && (
            <button onClick={downloadCSV} className="btn-download">
              <Download size={18} />
              Download CSV
            </button>
          )}
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
        </div>

        {/* TABLE */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => requestSort("admissionNumber")}>Adm No {getSortIcon("admissionNumber")}</th>
                <th onClick={() => requestSort("name")}>Name {getSortIcon("name")}</th>
                {feeColumns.map((col) => (
                  <th key={col.key} onClick={() => requestSort(col.key, true)}>
                    {col.label} {getSortIcon(col.key)}
                  </th>
                ))}
                {activeTab === "dues" && <th>Total Pending</th>}
                <th>Overall Status</th>
              </tr>
            </thead>
            <tbody>
              {processedStudents.length > 0 ? (
                processedStudents.map((student) => {
                  const totalPending = feeColumns.reduce(
                    (sum, col) => sum + (student.fees[col.key] || 0),
                    0
                  );
                  return (
                    <tr key={student.id}>
                      <td><strong>{student.admissionNumber}</strong></td>
                      <td>{student.name}</td>
                      {feeColumns.map((col) => {
                        const amount = student.fees[col.key] || 0;
                        return <td key={col.key}>{amount ? `₹${amount}` : "-"}</td>;
                      })}
                      {activeTab === "dues" && <td><strong>₹{totalPending}</strong></td>}
                      <td>
                        <span
                          className={`status-badge ${
                            student.status?.toLowerCase() === "paid"
                              ? "status-paid"
                              : "status-pending"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "2rem" }}>
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default StaffAdvisorDashboard;