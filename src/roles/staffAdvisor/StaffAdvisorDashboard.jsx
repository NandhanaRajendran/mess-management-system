import React, { useState, useMemo } from "react";
import { Search, LogOut, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/staffadvisor.css";

// ── Inline dummy data ──────────────────────────────────────────────────────────
const students = [
  // Computer Science – 2021-25
  { id: 1,  admissionNumber: "CS21001", name: "Aarav Patel",       department: "Computer Science", batch: "2021-25", status: "Paid",    fees: { Library: 0,    PTA: 0,    HDF: 0,    Rent: 0,    Mess: 0    } },
  { id: 2,  admissionNumber: "CS21002", name: "Priya Sharma",      department: "Computer Science", batch: "2021-25", status: "Pending", fees: { Library: 500,  PTA: 2000, HDF: 1500, Rent: 0,    Mess: 0    } },
  { id: 3,  admissionNumber: "CS21003", name: "Rohan Gupta",       department: "Computer Science", batch: "2021-25", status: "Paid",    fees: { Library: 0,    PTA: 0,    HDF: 0,    Rent: 0,    Mess: 0    } },
  { id: 4,  admissionNumber: "CS21004", name: "Sneha Nair",        department: "Computer Science", batch: "2021-25", status: "Pending", fees: { Library: 300,  PTA: 0,    HDF: 1500, Rent: 4500, Mess: 2200 } },
  { id: 5,  admissionNumber: "CS21005", name: "Karthik Iyer",      department: "Computer Science", batch: "2021-25", status: "Paid",    fees: { Library: 0,    PTA: 0,    HDF: 0,    Rent: 0,    Mess: 0    } },
  { id: 6,  admissionNumber: "CS21006", name: "Divya Menon",       department: "Computer Science", batch: "2021-25", status: "Pending", fees: { Library: 0,    PTA: 1500, HDF: 0,    Rent: 4500, Mess: 3100 } },
  { id: 7,  admissionNumber: "CS21007", name: "Arjun Reddy",       department: "Computer Science", batch: "2021-25", status: "Paid",    fees: { Library: 0,    PTA: 0,    HDF: 0,    Rent: 0,    Mess: 0    } },
  { id: 8,  admissionNumber: "CS21008", name: "Meera Pillai",      department: "Computer Science", batch: "2021-25", status: "Pending", fees: { Library: 500,  PTA: 2000, HDF: 1500, Rent: 0,    Mess: 1800 } },
  { id: 9,  admissionNumber: "CS21009", name: "Vikram Singh",      department: "Computer Science", batch: "2021-25", status: "Paid",    fees: { Library: 0,    PTA: 0,    HDF: 0,    Rent: 0,    Mess: 0    } },
  { id: 10, admissionNumber: "CS21010", name: "Ananya Krishnan",   department: "Computer Science", batch: "2021-25", status: "Pending", fees: { Library: 300,  PTA: 0,    HDF: 0,    Rent: 4500, Mess: 0    } },
  { id: 11, admissionNumber: "CS21011", name: "Rahul Desai",       department: "Computer Science", batch: "2021-25", status: "Paid",    fees: { Library: 0,    PTA: 0,    HDF: 0,    Rent: 0,    Mess: 0    } },
  { id: 12, admissionNumber: "CS21012", name: "Pooja Venkat",      department: "Computer Science", batch: "2021-25", status: "Pending", fees: { Library: 500,  PTA: 2000, HDF: 1500, Rent: 4500, Mess: 2500 } },
  { id: 13, admissionNumber: "CS21013", name: "Nikhil Joshi",      department: "Computer Science", batch: "2021-25", status: "Paid",    fees: { Library: 0,    PTA: 0,    HDF: 0,    Rent: 0,    Mess: 0    } },
  { id: 14, admissionNumber: "CS21014", name: "Lakshmi Rajan",     department: "Computer Science", batch: "2021-25", status: "Pending", fees: { Library: 0,    PTA: 1500, HDF: 1500, Rent: 0,    Mess: 3100 } },
  { id: 15, admissionNumber: "CS21015", name: "Suresh Babu",       department: "Computer Science", batch: "2021-25", status: "Paid",    fees: { Library: 0,    PTA: 0,    HDF: 0,    Rent: 0,    Mess: 0    } },

  // Electronics – 2021-25
  { id: 16, admissionNumber: "EC21001", name: "Aishwarya Nambiar", department: "Electronics",      batch: "2021-25", status: "Pending", fees: { Library: 500,  PTA: 2000, HDF: 0,    Rent: 4500, Mess: 1800 } },
  { id: 17, admissionNumber: "EC21002", name: "Deepak Varma",      department: "Electronics",      batch: "2021-25", status: "Paid",    fees: { Library: 0,    PTA: 0,    HDF: 0,    Rent: 0,    Mess: 0    } },
  { id: 18, admissionNumber: "EC21003", name: "Swathi Gopalan",    department: "Electronics",      batch: "2021-25", status: "Pending", fees: { Library: 300,  PTA: 0,    HDF: 1500, Rent: 0,    Mess: 2200 } },

  // Computer Science – 2022-26
  { id: 19, admissionNumber: "CS22001", name: "Ishaan Malhotra",   department: "Computer Science", batch: "2022-26", status: "Paid",    fees: { Library: 0,    PTA: 0,    HDF: 0,    Rent: 0,    Mess: 0    } },
  { id: 20, admissionNumber: "CS22002", name: "Riya Chandran",     department: "Computer Science", batch: "2022-26", status: "Pending", fees: { Library: 500,  PTA: 1500, HDF: 1500, Rent: 4500, Mess: 3100 } },
];
// ──────────────────────────────────────────────────────────────────────────────

const StaffAdvisorDashboard = () => {

  
  const user = useMemo(() => {
    return JSON.parse(sessionStorage.getItem("user")) || {};
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [selectedFee] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");
  
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const filteredStudents = useMemo(() => {
    if (!user?.department || !user?.batch) return [];
    return students.filter(
      (student) =>
        student.department === user.department &&
        student.batch === user.batch
    );
  }, [user]);

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