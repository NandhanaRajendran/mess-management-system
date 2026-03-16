import React, { useState, useMemo } from "react";
import { students } from "../../data/mockData";
import { Search, LogOut, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/staffadvisor.css";

const PTADashboard = () => {

  const navigate = useNavigate();

  // Get logged-in user
  const user = useMemo(() => {
    return JSON.parse(localStorage.getItem("user")) || {};
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  const [filters, setFilters] = useState({
    department: "All",
    batch: "All",
    semester: "All"
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Unique values for dropdown filters
  const departments = useMemo(
    () => ["All", ...new Set(students.map((s) => s.department))],
    []
  );

  const batches = useMemo(
    () => ["All", ...new Set(students.map((s) => s.batch))],
    []
  );

  const semesters = useMemo(
    () => ["All", ...new Set(students.map((s) => s.semester))].sort(),
    []
  );

  // Filtering logic
  const filteredStudents = useMemo(() => {

    return students.filter((student) => {

      const matchDept =
        filters.department === "All" ||
        student.department === filters.department;

      const matchBatch =
        filters.batch === "All" ||
        student.batch === filters.batch;

      const matchSem =
        filters.semester === "All" ||
        student.semester.toString() === filters.semester.toString();

      const matchSearch =
        searchTerm === "" ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchDept && matchBatch && matchSem && matchSearch;

    });

  }, [filters, searchTerm]);

  // Sorting logic
  const sortedStudents = useMemo(() => {

    let result = [...filteredStudents];

    if (sortConfig.key) {

      result.sort((a, b) => {

        let aValue =
          sortConfig.key === "ptaFee"
            ? a.fees.PTA
            : a[sortConfig.key];

        let bValue =
          sortConfig.key === "ptaFee"
            ? b.fees.PTA
            : b[sortConfig.key];

        if (aValue < bValue)
          return sortConfig.direction === "asc" ? -1 : 1;

        if (aValue > bValue)
          return sortConfig.direction === "asc" ? 1 : -1;

        return 0;

      });

    }

    return result;

  }, [filteredStudents, sortConfig]);

  const requestSort = (key) => {

    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

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

  return (

    <div className="dashboard-container fade-in">

      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>

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

      <div className="glass-panel" style={{ padding: "1.5rem", marginTop: "2rem" }}>

        <div className="table-toolbar" style={{ flexWrap: "wrap", gap: "1rem" }}>

          <h3 style={{ margin: 0, minWidth: "200px" }}>
            Student PTA Fee Records
          </h3>

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

            <select
              className="filter-select"
              value={filters.department}
              onChange={(e) =>
                setFilters({ ...filters, department: e.target.value })
              }
            >
              <option value="All">All Branches</option>
              {departments
                .filter((d) => d !== "All")
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>

            <select
              className="filter-select"
              value={filters.batch}
              onChange={(e) =>
                setFilters({ ...filters, batch: e.target.value })
              }
            >
              <option value="All">All Batches</option>
              {batches
                .filter((b) => b !== "All")
                .map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
            </select>

            <select
              className="filter-select"
              value={filters.semester}
              onChange={(e) =>
                setFilters({ ...filters, semester: e.target.value })
              }
            >
              <option value="All">All Semesters</option>
              {semesters
                .filter((s) => s !== "All")
                .map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
            </select>

          </div>

        </div>

        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th onClick={() => requestSort("admissionNumber")}>
                  Adm No {getSortIcon("admissionNumber")}
                </th>

                <th onClick={() => requestSort("name")}>
                  Name {getSortIcon("name")}
                </th>

                <th onClick={() => requestSort("department")}>
                  Branch {getSortIcon("department")}
                </th>

                <th onClick={() => requestSort("batch")}>
                  Batch {getSortIcon("batch")}
                </th>

                <th onClick={() => requestSort("semester")}>
                  Sem {getSortIcon("semester")}
                </th>

                <th onClick={() => requestSort("ptaFee")}>
                  PTA Fee {getSortIcon("ptaFee")}
                </th>

                <th onClick={() => requestSort("status")}>
                  Status {getSortIcon("status")}
                </th>

              </tr>

            </thead>

            <tbody>

              {sortedStudents.length > 0 ? (

                sortedStudents.map((student) => (

                  <tr key={student.id}>

                    <td>
                      <strong>{student.admissionNumber}</strong>
                    </td>

                    <td>{student.name}</td>

                    <td>{student.department}</td>

                    <td>{student.batch}</td>

                    <td>{student.semester}</td>

                    <td>₹{student.fees.PTA}</td>

                    <td>

                      <span
                        className={`status-badge ${
                          student.status?.trim().toLowerCase() === "paid"
                            ? "status-paid"
                            : "status-pending"
                        }`}
                      >
                        {student.status}
                      </span>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                    No students matching these criteria.
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

export default PTADashboard;