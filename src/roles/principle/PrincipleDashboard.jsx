import React, { useState } from "react";
import "../../styles/principle.css";
import { useNavigate } from "react-router-dom";

const PrincipalDashboard = () => {

  const students = [
    {
      admission: "STU2024001",
      name: "John Doe",
      department: "CSE",
      semester: "1",
      PTA: 0,
      Bus: 12000,
      HostelRent: 0,
      HDF: 0,
      Mess: 5000,
      Library: 0,
      Lab: 0,
      CDF: 0,
      Accreditation: 0
    },
    {
      admission: "STU2024002",
      name: "Jane Smith",
      department: "ECE",
      semester: "2",
      PTA: 2000,
      Bus: 0,
      HostelRent: 15000,
      HDF: 3000,
      Mess: 0,
      Library: 500,
      Lab: 0,
      CDF: 0,
      Accreditation: 0
    },
    {
      admission: "STU2024003",
      name: "Mike Johnson",
      department: "ME",
      semester: "3",
      PTA: 0,
      Bus: 0,
      HostelRent: 0,
      HDF: 0,
      Mess: 0,
      Library: 0,
      Lab: 2000,
      CDF: 0,
      Accreditation: 0
    },
    {
      admission: "STU2024004",
      name: "Sarah Williams",
      department: "CSE",
      semester: "4",
      PTA: 2000,
      Bus: 12000,
      HostelRent: 0,
      HDF: 0,
      Mess: 0,
      Library: 1200,
      Lab: 1500,
      CDF: 0,
      Accreditation: 0
    },
    {
      admission: "STU2024005",
      name: "David Brown",
      department: "ECE",
      semester: "5",
      PTA: 0,
      Bus: 12000,
      HostelRent: 15000,
      HDF: 3000,
      Mess: 5000,
      Library: 0,
      Lab: 0,
      CDF: 1000,
      Accreditation: 1000
    },
    {
      admission: "STU2024006",
      name: "Emma Wilson",
      department: "ME",
      semester: "6",
      PTA: 2000,
      Bus: 0,
      HostelRent: 0,
      HDF: 0,
      Mess: 0,
      Library: 0,
      Lab: 0,
      CDF: 500,
      Accreditation: 500
    },
    {
      admission: "STU2024007",
      name: "Daniel Thomas",
      department: "CSE",
      semester: "7",
      PTA: 0,
      Bus: 0,
      HostelRent: 15000,
      HDF: 3000,
      Mess: 5000,
      Library: 0,
      Lab: 0,
      CDF: 1000,
      Accreditation: 1000
    }
  ];

  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [semester, setSemester] = useState("");

  const navigate = useNavigate();

  const filteredStudents = students.filter((student) => {
    return (
      student.admission.toLowerCase().includes(search.toLowerCase()) &&
      student.department.toLowerCase().includes(dept.toLowerCase()) &&
      student.semester.toLowerCase().includes(semester.toLowerCase())
    );
  });

  const renderCell = (value) => {
    if (!value) return <span>-</span>;
    return <span className="due">₹{value.toLocaleString()}</span>;
  };

  const calculateTotal = (student) => {
    return (
      student.PTA +
      student.Bus +
      student.HostelRent +
      student.HDF +
      student.Mess +
      student.Library +
      student.Lab +
      student.CDF +
      student.Accreditation
    );
  };

  const handleLogout = () => {
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
                <th>Semester</th>
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

              {filteredStudents.map((student, index) => {

                const total = calculateTotal(student);

                return (
                  <tr key={index}>

                    <td>{student.admission}</td>
                    <td>{student.name}</td>
                    <td>{student.department}</td>
                    <td>Sem {student.semester}</td>

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
              })}

            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
};

export default PrincipalDashboard;