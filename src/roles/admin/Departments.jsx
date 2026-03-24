import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  X,
  Users,
  UserCheck,
  ChevronDown,
  PlusCircle,
} from "lucide-react";
import "../../styles/admin.css";
const ALL_SEMESTERS = ["S1", "S3", "S5", "S7"];

export default function Departments() {
  const [facultyList, setFacultyList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [advisorPopup, setAdvisorPopup] = useState(null); // { deptId, semester }
  const [hodPopup, setHodPopup] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [editingDept, setEditingDept] = useState(null);
  const [hodCredentials, setHodCredentials] = useState({});
  const [advisorCredentials, setAdvisorCredentials] = useState({});

  useEffect(() => {
    fetch("https://mess-management-system-q6us.onrender.com/api/admin/departments")
      .then((res) => res.json())
      .then((data) => {
        console.log("Departments from DB:", data);
        setDepartments(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch("https://mess-management-system-q6us.onrender.com/api/admin/faculty")
      .then((res) => res.json())
      .then((data) => {
        console.log("Faculty from DB:", data);
        setFacultyList(data);
      })
      .catch(console.error);
  }, []);

  /* ── helpers ── */

  const nextSemester = (dept) =>
    ALL_SEMESTERS.find((s) => !(dept.activeClasses || []).includes(s)) || null;

  // Get advisor name from advisors array
  const getAdvisorName = (dept, semester) => {
    const entry = dept.advisors?.find((a) => a.className === semester);
    if (!entry?.faculty) return null;
    // faculty can be either a populated object {_id, name} or just an ObjectId string
    if (typeof entry.faculty === "object" && entry.faculty.name) {
      return entry.faculty.name; // ✅ populated
    }
    // fallback: match by ID from facultyList
    const fid = entry.faculty?._id?.toString() || entry.faculty?.toString();
    return facultyList.find((f) => f._id?.toString() === fid)?.name ?? null;
  };

  // Eligible faculty: same dept, not HOD, not already assigned to another class
  const eligibleFaculty = (dept, semester) => {
    return facultyList.filter((f) => {
      const fDeptId = f.department?._id?.toString() || f.department?.toString();
      const deptId = dept._id?.toString();

      // already assigned to a DIFFERENT semester in this dept?
      const isAssignedElsewhere = dept.advisors?.some((a) => {
        const aFac = a.faculty?._id?.toString() || a.faculty?.toString();
        return aFac === f._id?.toString() && a.className !== semester;
      });

      return fDeptId === deptId && f.role !== "hod" && !isAssignedElsewhere;
    });
  };

  /* ── add class ── */
  const handleAddClass = async (deptId) => {
    const dept = departments.find((d) => d._id === deptId);
    const next = nextSemester(dept);
    if (!next) return;

    const updatedClasses = [...(dept.activeClasses || []), next];

    // instant UI update
    setDepartments((prev) =>
      prev.map((d) =>
        d._id === deptId ? { ...d, activeClasses: updatedClasses } : d,
      ),
    );

    // persist to DB
    try {
      const res = await fetch(
        "https://mess-management-system-q6us.onrender.com/api/admin/update-department",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            departmentId: deptId,
            activeClasses: updatedClasses,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) alert("Failed to save class: " + data.message);
    } catch {
      alert("Failed to save class to database");
    }
  };

  /* ── Assign HOD ── */
  const assignHod = async (deptId, facultyId) => {
    try {
      const res = await fetch("https://mess-management-system-q6us.onrender.com/api/admin/assign-hod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departmentId: deptId, facultyId }),
      });

      const data = await res.json();
      console.log("assignHod response:", data);  
      if (!res.ok) return alert(data.message);

      alert(
        `HOD Assigned!\nUsername: ${data.credentials.username}\nPassword: ${data.credentials.password}`,
      );

      setHodCredentials((prev) => ({
        ...prev,
        [deptId]: data.credentials,
      }));

      setDepartments((prev) =>
        prev.map((d) => (d._id === deptId ? data.department : d)),
      );

      setHodPopup(null);
    } catch(err) {
      console.log("assignHod error:", err.message);  
      alert("Error assigning HOD");
    }
  };

  /* ── Assign / Unassign Advisor ── */
  const assignAdvisor = async (deptId, sem, facultyId) => {
    try {
      const res = await fetch(
        "https://mess-management-system-q6us.onrender.com/api/admin/assign-advisor",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            departmentId: deptId,
            semester: sem,
            facultyId,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      // update departments in state
      setDepartments((prev) =>
        prev.map((d) => (d._id === deptId ? data.department : d)),
      );

      // show credentials if assigned
      if (facultyId && data.credentials) {
        alert(
          `Staff Advisor Assigned!\nUsername: ${data.credentials.username}\nPassword: ${data.credentials.password}`,
        );
        setAdvisorCredentials((prev) => ({
          ...prev,
          [`${deptId}_${sem}`]: data.credentials,
        }));
      } else if (!facultyId) {
        // remove stored credentials if unassigned
        setAdvisorCredentials((prev) => {
          const updated = { ...prev };
          delete updated[`${deptId}_${sem}`];
          return updated;
        });
      }

      setAdvisorPopup(null);
    } catch {
      alert("Error assigning advisor");
    }
  };

  /* ── Add / Update Department ── */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSaveDepartment = async () => {
    if (!formData.name) {
      alert("Department name is required");
      return;
    }

    try {
      const url = editingDept
        ? "https://mess-management-system-q6us.onrender.com/api/admin/update-department"
        : "https://mess-management-system-q6us.onrender.com/api/admin/add-department";

      const body = editingDept
        ? { departmentId: editingDept._id, name: formData.name }
        : { name: formData.name };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || data.error);
        return;
      }

      alert(
        editingDept ? "Updated successfully ✅" : "Created successfully ✅",
      );

      if (editingDept) {
        setDepartments((prev) =>
          prev.map((d) => (d._id === editingDept._id ? data.department : d)),
        );
      } else {
        setDepartments((prev) => [...prev, data.department]);
      }

      setShowModal(false);
      setEditingDept(null);
      setFormData({ name: "" });
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const popupDept = advisorPopup
    ? departments.find((d) => d._id === advisorPopup.deptId)
    : null;

  return (
    <div className="departments-page">
      {/* HEADER */}
      <div className="students-header">
        <div>
          <h1>Department Management</h1>
          <p>Manage departments and their staff assignments</p>
        </div>
        <button className="add-student-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Department
        </button>
      </div>

      {/* GRID */}
      <div className="department-grid">
        {departments.map((dept) => (
          <div className="department-card" key={dept._id}>
            {/* Top: dept name */}
            <div className="dept-top">
              <div className="dept-title">
                <div className="dept-icon">
                  <Users size={18} />
                </div>
                <div>
                  <h3>{dept.name}</h3>
                  {/* <span>{dept.students ?? 0} students</span> */}
                </div>
              </div>
              <div className="dept-actions">
                <Pencil
                  size={16}
                  className="action edit"
                  onClick={() => {
                    setFormData({ name: dept.name });
                    setEditingDept(dept);
                    setShowModal(true);
                  }}
                />
              </div>
            </div>

            {/* HOD Section */}
            <div className="dept-section">
              <label>HEAD OF DEPARTMENT</label>
              <button
                className="advisor-trigger-btn"
                onClick={() => setHodPopup(dept._id)}
              >
                <UserCheck size={13} />
                <span>
                  {facultyList.find(
                    (f) => f._id?.toString() === dept.hod?.toString(),
                  )?.name || "Assign HOD"}
                </span>
                <ChevronDown size={12} />
              </button>
            </div>

            {/* HOD Credentials */}
            <div className="dept-login">
              <label>HOD LOGIN CREDENTIALS</label>
              <div className="login-box">
                <div>
                  <span>Username</span>
                  <p>
                    {hodCredentials[dept._id]?.username || dept.username || "-"}
                  </p>
                </div>
                <div>
                  <span>Password</span>
                  <p>
                    {hodCredentials[dept._id]?.password || dept.password || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Class Advisors */}
            <div className="dept-classes-section">
              <div className="dept-classes-header">
                <label>CLASS ADVISORS</label>
                {nextSemester(dept) && (
                  <button
                    className="add-class-btn"
                    onClick={() => handleAddClass(dept._id)}
                  >
                    <PlusCircle size={13} />
                    Add {nextSemester(dept)}
                  </button>
                )}
              </div>

              <div className="class-list">
                {(dept.activeClasses || []).map((sem) => {
                  const advisorName = getAdvisorName(dept, sem);
                  const creds = advisorCredentials[`${dept._id}_${sem}`];

                  return (
                    <div key={sem} className="class-row-wrapper">
                      <div className="class-row">
                        <span className="class-sem-badge">{sem}</span>
                        <button
                          className="advisor-trigger-btn"
                          onClick={() =>
                            setAdvisorPopup({ deptId: dept._id, semester: sem })
                          }
                        >
                          <UserCheck size={13} />
                          <span>{advisorName || "Assign Advisor"}</span>
                          <ChevronDown size={12} />
                        </button>
                      </div>

                      {/* Show advisor credentials after assignment */}
                      {creds && (
                        <div className="login-box advisor-creds">
                          <div>
                            <span>Username</span>
                            <p>{creds.username}</p>
                          </div>
                          <div>
                            <span>Password</span>
                            <p>{creds.password}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── HOD POPUP ── */}
      {hodPopup && (
        <div className="modal-overlay" onClick={() => setHodPopup(null)}>
          <div className="advisor-popup" onClick={(e) => e.stopPropagation()}>
            <div className="advisor-popup-header">
              <h3>Assign HOD</h3>
              <button onClick={() => setHodPopup(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="advisor-popup-list">
              {facultyList
                .filter(
                  (f) =>
                    f.department?._id?.toString() === hodPopup?.toString() ||
                    f.department?.toString() === hodPopup?.toString(),
                )
                .map((f) => (
                  <button
                    key={f._id}
                    className="advisor-option"
                    onClick={() => assignHod(hodPopup, f._id)}
                  >
                    <span className="advisor-option-avatar">
                      {f.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="advisor-option-info">
                      <span className="advisor-option-name">{f.name}</span>
                      <span className="advisor-option-dept">{f.facultyId}</span>
                    </div>
                  </button>
                ))}

              {facultyList.filter(
                (f) =>
                  f.department?._id?.toString() === hodPopup?.toString() ||
                  f.department?.toString() === hodPopup?.toString(),
              ).length === 0 && (
                <p className="advisor-empty">No faculty in this department</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ADVISOR POPUP ── */}
      {advisorPopup && popupDept && (
        <div className="modal-overlay" onClick={() => setAdvisorPopup(null)}>
          <div className="advisor-popup" onClick={(e) => e.stopPropagation()}>
            <div className="advisor-popup-header">
              <div>
                <h3>Assign Advisor</h3>
                <p className="advisor-popup-sub">
                  {popupDept.name} · {advisorPopup.semester}
                </p>
              </div>
              <button
                className="close-btn"
                onClick={() => setAdvisorPopup(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="advisor-popup-list">
              {/* Unassign option */}
              <button
                className="advisor-option unassign"
                onClick={() =>
                  assignAdvisor(
                    advisorPopup.deptId,
                    advisorPopup.semester,
                    null,
                  )
                }
              >
                <span className="advisor-option-avatar none">–</span>
                <span className="advisor-option-name">No Advisor</span>
              </button>

              {eligibleFaculty(popupDept, advisorPopup.semester).length ===
                0 && (
                <p className="advisor-empty">
                  No available faculty in {popupDept.name}
                </p>
              )}

              {eligibleFaculty(popupDept, advisorPopup.semester).map((f) => {
                // ✅ fixed: use popupDept not dept
                const isCurrent =
                  popupDept.advisors
                    ?.find((a) => a.className === advisorPopup.semester)
                    ?.faculty?.toString() === f._id?.toString();

                return (
                  <button
                    key={f._id} // ✅ fixed: f._id not f.id
                    className={`advisor-option${isCurrent ? " selected" : ""}`}
                    onClick={() =>
                      assignAdvisor(
                        advisorPopup.deptId,
                        advisorPopup.semester,
                        f._id, // ✅ fixed: f._id not f.id
                      )
                    }
                  >
                    <span className="advisor-option-avatar">
                      {f.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="advisor-option-info">
                      <span className="advisor-option-name">{f.name}</span>
                      <span className="advisor-option-dept">
                        {isCurrent
                          ? `${advisorPopup.semester} Advisor`
                          : "Faculty"}
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="advisor-selected-badge">Current</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT DEPARTMENT MODAL ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingDept ? "Edit Department" : "Add New Department"}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  setEditingDept(null);
                  setFormData({ name: "" });
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <label>Department Name</label>
              <input
                name="name"
                placeholder="Enter department name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowModal(false);
                  setEditingDept(null);
                  setFormData({ name: "" });
                }}
              >
                Cancel
              </button>
              <button className="submit-btn" onClick={handleSaveDepartment}>
                {editingDept ? "Update Department" : "Add Department"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
