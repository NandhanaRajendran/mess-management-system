import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/hostel.css";

function Enrollment() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Student");

  // Dynamic States
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [gender, setGender] = useState("");
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    fetch("https://mess-management-system-q6us.onrender.com/api/admin/departments")
      .then(res => res.json())
      .then(data => setDepartments(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching departments:", err));
  }, []);

  const handleIdBlur = async (e) => {
    const id = e.target.value.trim();
    if (!id) return;
    
    setIsAutoFilled(false);
    setMessage("");

    try {
      // Always check if they are already in the hostel (Inmate collection)
      const resInmate = await fetch(`https://mess-management-system-q6us.onrender.com/api/students/admission/${id}`);
      if (resInmate.ok) {
        const data = await resInmate.json();
        if (data.hostelName) {
           setMessage(`Error: ${data.name} is already enrolled in ${data.hostelName}.`);
           setName("");
           setDepartment("");
           setSemester("");
           setGender("");
           return;
        }
        
        // If they exist but ENROLLMENT isn't complete (no hostel), auto-fill for Student category
        if (category === "Student") {
          setName(data.name || "");
          setDepartment(data.department?._id || data.department?.name || "");
          setSemester(data.className || "");
          setGender(data.gender || "Other");
          setIsAutoFilled(true);
          return;
        }
      }
      
      // If not in inmate collection or category is Faculty, check Faculty collection
      if (category === "Faculty") {
        const resFac = await fetch(`https://mess-management-system-q6us.onrender.com/api/admin/faculty/id/${id}`);
        if (resFac.ok) {
          const data = await resFac.json();
          setName(data.name || "");
          setDepartment(data.department?._id || data.department?.name || "");
          setGender(""); // Faculty gender might not be in DB
          setIsAutoFilled(true);
        } else {
          setName("");
          setDepartment("");
          setMessage("Faculty not found in DB. Please enter details manually.");
        }
      } else if (category === "Student") {
        // We already tried Student fetch above and it failed if we are here
        setName("");
        setDepartment("");
        setMessage("Student not found in DB. Please enter details manually.");
      }
    } catch (err) {
       console.error(err);
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setName("");
    setDepartment("");
    setSemester("");
    setGender("");
    setIsAutoFilled(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const admission = formData.get("admission"); // or Faculty ID
    const room = formData.get("room");

    if (category === "Inmate type") {
      setMessage("Error: Please select a valid Inmate Type.");
      return;
    }

    try {
      // 1. Fetch current students to check room capacity
      const resCount = await fetch("https://mess-management-system-q6us.onrender.com/api/students");
      const allStudents = await resCount.json();
      
      if (Array.isArray(allStudents)) {
        const inRoom = allStudents.filter(s => 
          String(s.room) === String(room)
          // Intentionally omitted hostelName capacity check since it's temporarily disabled
        );
        
        if (inRoom.length >= 4) {
          setMessage("Error: Maximum 4 people allowed in this room.");
          return;
        }
      }

      // 2. Prepare data
      const finalName = category === "Student" ? name : `${category}: ${name}`;
      const finalAdmission = admission || Math.floor(Math.random() * 90000000) + 10000000;

      const newInmate = {
        admission: finalAdmission,
        name: finalName,
        room: room,
        category: category,
        department: department,
        className: semester,
        gender: gender,
        hostelName: formData.get("hostelName") || ""
      };

      // 3. Enroll
      const res = await fetch("https://mess-management-system-q6us.onrender.com/api/students/enroll-hostel", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(newInmate)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Inmate enrolled successfully!");
        e.target.reset();
        setName("");
        setDepartment("");
        setSemester("");
        setGender("");
        setIsAutoFilled(false);
      } else {
        setMessage(`Error: ${data.message || "Failed to enroll student."}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error: Server connection failed.");
    }
  };

  return (
    <div className="hostelPage" style={{ userSelect: 'none' }}>
      <div className="formPage">
        <div className="formCard">
          <div className="formHeader">
            <button
              className="backBtn"
              onClick={() => navigate("/hostel/dashboard")}
              onMouseDown={(e) => e.preventDefault()}
            >
              Back
            </button>

            <h2>Enroll New Inmate</h2>
          </div>

          <form onSubmit={handleSubmit}>
            {(category === "Student" || category === "Faculty" || category === "Supple Exam") && (
              <input 
                name="admission" 
                placeholder={category === "Faculty" ? "Faculty ID" : "Admission Number"}
                onBlur={handleIdBlur}
                required 
              />
            )}
            
            <select name="category" value={category} onChange={handleCategoryChange} required style={{ marginBottom: '15px' }}>
              <option value="Inmate type">Inmate type</option>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
              <option value="Guest">Guest</option>
              <option value="Supple Exam">Supplementary Exam</option>
            </select>

            <input 
              name="name" 
              placeholder="Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={isAutoFilled}
              required 
            />

            {!isAutoFilled ? (
              <select 
                name="gender" 
                value={gender} 
                onChange={(e) => setGender(e.target.value)} 
                required 
                style={{ marginBottom: '15px' }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <div style={{ marginBottom: '15px', color: '#64748b', fontSize: '0.9rem' }}>
                Gender: <strong>{gender}</strong>
              </div>
            )}

            {(category === "Student" || category === "Faculty" || category === "Supple Exam") && (
              <select 
                name="department" 
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isAutoFilled}
                required
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            )}

            {category === "Student" && (
              <select 
                name="semester" 
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                disabled={isAutoFilled}
                required
              >
                <option value="">Select Semester</option>
                <option value="S1">Semester 1</option>
                <option value="S2">Semester 2</option>
                <option value="S3">Semester 3</option>
                <option value="S4">Semester 4</option>
                <option value="S5">Semester 5</option>
                <option value="S6">Semester 6</option>
                <option value="S7">Semester 7</option>
                <option value="S8">Semester 8</option>
              </select>
            )}

            {gender === "Male" ? (
              <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "15px", fontWeight: "bold" }}>
                No mens hostels are available now
              </p>
            ) : (
              <select name="hostelName" required style={{ marginBottom: "15px" }}>
                <option value="">Select Hostel</option>
                <option value="Nila Ladies Hostel">Nila Ladies Hostel</option>
                {/* Other hostels disabled for now
                <option value="Kabani Ladies Hostel">Kabani Ladies Hostel</option>
                <option value="Mens Hostel">Mens Hostel</option>
                */}
              </select>
            )}

            <input
              name="enrollmentDate"
              placeholder="Enrollment Date"
              type="text"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => (e.target.type = "text")}
              required
              style={{ marginTop: '15px' }}
            />
            <input name="room" placeholder="Room Number" required />

            <button className="submitBtn" onMouseDown={(e) => e.preventDefault()}>Enroll Inmate</button>
          </form>

          {message && <p className="successMsg" style={{ color: message.includes("Error") ? "red" : "green" }}>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Enrollment;
