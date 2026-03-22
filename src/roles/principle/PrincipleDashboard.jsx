import React, { useState, useEffect } from "react";
import "../../styles/principle.css";
import { useNavigate } from "react-router-dom";

const PrincipalDashboard = () => {

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/api/principal/students");
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const data = await response.json();
        setStudents(data);
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
    return (
      (student.PTA || 0) +
      (student.Bus || 0) +
      (student.HostelRent || 0) +
      (student.HDF || 0) +
      (student.Mess || 0) +
      (student.Library || 0) +
      (student.Lab || 0) +
      (student.CDF || 0) +
      (student.Accreditation || 0)
    );
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

<<<<<<< HEAD
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

=======
>>>>>>> 050060904fd34fd0ee851169c3174498aeaaf6ea
        </div>

        {/* TABLE */}
        <div className="table-container">
          <table>

            <thead>
              <tr>
                <th>Admission No</th>
                <th>Name</th>
                <th>Dept</th>
                <th>PTA</th>
                <th>Bus</th>
                <th>Hostel Rent</th>
                <th>HDF</th>
                <th>Mess</th>
                <th>Library</th>
                <th>Lab</th>
                <th>CDF</th>
                <th>Accreditation</th>
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

                    <td>{renderCell(student.PTA)}</td>
                    <td>{renderCell(student.Bus)}</td>
                    <td>{renderCell(student.HostelRent)}</td>
                    <td>{renderCell(student.HDF)}</td>
                    <td>{renderCell(student.Mess)}</td>
                    <td>{renderCell(student.Library)}</td>
                    <td>{renderCell(student.Lab)}</td>
                    <td>{renderCell(student.CDF)}</td>
                    <td>{renderCell(student.Accreditation)}</td>

                    <td className="total">
                      ₹{total.toLocaleString()}
                    </td>

                  </tr>
                );
              }) : (
                 <tr>
                    <td colSpan="13" style={{ textAlign: "center", padding: "2rem" }}>
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