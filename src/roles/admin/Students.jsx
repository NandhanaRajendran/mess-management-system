import { useState, useEffect } from "react";
import {
  Search,
  Pencil,
  Trash2,
  Plus,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import "../../styles/admin.css";


const CLASSES = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
const BATCHES = ["2025", "2024", "2023", "2022"];

export default function Students() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);



  //Fetch Students
  useEffect(() => {
    fetch("http://localhost:8000/api/admin/all-students", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch(console.error);
  }, []);

  //Fetch departments
  useEffect(() => {
    fetch("http://localhost:8000/api/admin/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch(console.error);
  }, []);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [filterPopup, setFilterPopup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    admission: "",
    department: "",
    class: "",
    batch: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const filteredStudents = students.filter((s) => {
    const searchMatch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(search.toLowerCase());
    //const deptMatch = !departmentFilter || s.department === departmentFilter;
    //const deptMatch = true;
    const deptMatch =
      !departmentFilter || s.department?.name === departmentFilter;
    const classMatch = !classFilter || s.className === classFilter;
    return searchMatch && deptMatch && classMatch;
  });

  const handleAddStudent = async () => {
    if (!formData.admission) {
      alert("Admission number is required");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/admin/add-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          admissionNo: formData.admission,
          department: formData.department,
          className: formData.class,
          batch: formData.batch,
          email: "test@gmail.com",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error || "Something went wrong");
        return;
      }

      if (!data.credentials) {
        alert("Student created but credentials missing");
        return;
      }

      alert(
        `Student Created!\nUsername: ${data.credentials.username}\nPassword: ${data.credentials.password}`,
      );

      // refresh UI
      setStudents((prev) => [
        ...prev,
        {
          name: formData.name,
          admissionNo: formData.admission,
          department: formData.department,
          className: formData.class,
          batch: formData.batch,
        },
      ]);

      setShowModal(false);
    } catch (err) {
      alert("Server error");
    }
  };

  const handleDelete = async (admissionNo) => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/admin/delete-student",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ admissionNo }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error || "Something went wrong");
        return;
      }

      setStudents((prev) => prev.filter((s) => s.admissionNo !== admissionNo));
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="students-page">
      <div className="students-header">
        <div>
          <h1>Student Management</h1>
          <p>Manage student information and enrollments</p>
        </div>
        <button className="add-student-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Student
        </button>
      </div>

      <div className="students-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="filter-popup-trigger"
          onClick={() => setFilterPopup(filterPopup === "dept" ? null : "dept")}
        >
          <span>{departmentFilter || "All Departments"}</span>
          <ChevronDown size={14} />
          {departmentFilter && (
            <span
              className="filter-clear"
              onClick={(e) => {
                e.stopPropagation();
                setDepartmentFilter("");
              }}
            >
              <X size={11} />
            </span>
          )}
        </button>

        <button
          className="filter-popup-trigger"
          onClick={() =>
            setFilterPopup(filterPopup === "class" ? null : "class")
          }
        >
          <span>{classFilter || "All Classes"}</span>
          <ChevronDown size={14} />
          {classFilter && (
            <span
              className="filter-clear"
              onClick={(e) => {
                e.stopPropagation();
                setClassFilter("");
              }}
            >
              <X size={11} />
            </span>
          )}
        </button>

        <span className="student-count">
          {filteredStudents.length} students found
        </span>
      </div>

      <div className="students-table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th>STUDENT NAME</th>
              <th>ADMISSION NUMBER</th>
              <th>DEPARTMENT</th>
              <th>BATCH</th>
              <th>CLASS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    color: "#94a3b8",
                    padding: "24px",
                  }}
                >
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.admissionNo}</td>
                  <td>{student.department?.name}</td>
                  <td>{student.batch}</td>
                  <td>{student.className}</td>
                  <td className="actions">
                    <Pencil size={16} className="action edit" />
                    <Trash2
                      size={16}
                      className="action delete"
                      onClick={() => handleDelete(student.admissionNo)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DEPT FILTER POPUP */}
      {filterPopup === "dept" && (
        <div className="modal-overlay" onClick={() => setFilterPopup(null)}>
          <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
            <div className="filter-popup-header">
              <h3>Filter by Department</h3>
              <button
                className="close-btn"
                onClick={() => setFilterPopup(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="filter-popup-list">
              <button
                className={`filter-popup-option${!departmentFilter ? " selected" : ""}`}
                onClick={() => {
                  setDepartmentFilter("");
                  setFilterPopup(null);
                }}
              >
                <span>All Departments</span>
                {!departmentFilter && <Check size={14} />}
              </button>
              {departments.map((d) => (
                <button
                  key={d._id}
                  className={`filter-popup-option${departmentFilter === d.name ? " selected" : ""}`}
                  onClick={() => {
                    setDepartmentFilter(d.name);
                    setFilterPopup(null);
                  }}
                >
                  <span>{d.name}</span>
                  {departmentFilter === d.name && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CLASS FILTER POPUP */}
      {filterPopup === "class" && (
        <div className="modal-overlay" onClick={() => setFilterPopup(null)}>
          <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
            <div className="filter-popup-header">
              <h3>Filter by Class</h3>
              <button
                className="close-btn"
                onClick={() => setFilterPopup(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="filter-popup-list">
              <button
                className={`filter-popup-option${!classFilter ? " selected" : ""}`}
                onClick={() => {
                  setClassFilter("");
                  setFilterPopup(null);
                }}
              >
                <span>All Classes</span>
                {!classFilter && <Check size={14} />}
              </button>
              {CLASSES.map((c) => (
                <button
                  key={c}
                  className={`filter-popup-option${classFilter === c ? " selected" : ""}`}
                  onClick={() => {
                    setClassFilter(c);
                    setFilterPopup(null);
                  }}
                >
                  <span className="class-sem-badge">{c}</span>
                  {classFilter === c && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Student</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <label>Student Name</label>
              <input
                name="name"
                placeholder="Enter student name"
                onChange={handleChange}
              />
              <label>Admission Number</label>
              <input
                name="admission"
                placeholder="Enter admission number"
                onChange={handleChange}
              />
              <label>Department</label>
              <select name="department" onChange={handleChange}>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value ={d._id} >{d.name}</option>
                ))}
              </select>
              <label>Batch</label>
              <select name="batch" onChange={handleChange}>
                <option value="">Select batch</option>
                {BATCHES.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
              <label>Class</label>
              <select name="class" onChange={handleChange}>
                <option value="">Select class</option>
                {CLASSES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="submit-btn" onClick={handleAddStudent}>
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
