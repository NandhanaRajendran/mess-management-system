import React, { useState, useEffect } from "react";
import "../../styles/principle.css";
import { useNavigate } from "react-router-dom";

const PrincipalDashboard = () => {

  const [students, setStudents] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState("");
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const navigate = useNavigate();
  const API = "https://mess-management-system-q6us.onrender.com"
  //const API = "http://localhost:8000"

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API}/api/principal/students`);
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const data = await response.json();
        setStudents(data.students || []);
        setColumns(data.columns || []);
      } catch (error) {
        console.error("Error fetching principal dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    return (
      (student.admission?.toLowerCase() || "").includes(search.toLowerCase()) &&
      (student.department?.toLowerCase() || "").includes(dept.toLowerCase())
    );
  });

  const renderCell = (value) => {
    if (!value) return <span>-</span>;
    return <span className="due">₹{value.toLocaleString()}</span>;
  };

  const calculateTotal = (student) => {
    return columns.reduce((sum, col) => sum + (student[col] || 0), 0);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard">

      {/* NAVBAR */}
      <div className="navbar ">
        <div className="nav-left">
          <span className="logo">🎓 UNIPAY</span>
          <span className="role">Principal Dashboard</span>
        </div>

        <div className="nav-right">
          <div className="user-info">
            <span className="username">Principal</span>
            <small> - Full Access</small>
          </div>

          <div className="profile-icon">👤</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="dashboard-content">

        <h2>Student Fee Dues</h2>

        {/* FILTERS */}
        <div className="filters">

          <input
            type="text"
            placeholder="Search Admission No"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          >
            <option value="">All Department</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="EEE">EEE</option>
            <option value="IT">IT</option>
            <option value="Robotics">Robotics</option>
          </select>


          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">All Semester</option>
            <option value="1">S1</option>
            <option value="2">S2</option>
            <option value="3">S3</option>
            <option value="4">S4</option>
            <option value="5">S5</option>
            <option value="6">S6</option>
            <option value="7">S7</option>
            <option value="8">S8</option>
          </select>


        </div>

        {/* TABLE */}
        <div className="table-container">
          <table>

            <thead>
              <tr>
                <th>Admission No</th>
                <th>Name</th>
                <th>Dept</th>
                {columns.map(c => <th key={c}>{c}</th>)}
                <th>Total</th>
              </tr>
            </thead>

            <tbody>

              {filteredStudents.length > 0 ? filteredStudents.map((student, index) => {

                const total = calculateTotal(student);

                return (
                  <tr key={index}>
                    <td>{student.admission}</td>
                    <td>{student.name}</td>
                    <td>{student.department}</td>
                    {columns.map(c => <td key={c}>{renderCell(student[c])}</td>)}
                    <td className="total">
                      ₹{total.toLocaleString()}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={columns.length + 4} style={{ textAlign: "center", padding: "2rem" }}>
                    {loading ? "Loading dues..." : "No dues found"}
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

export default PrincipalDashboard;