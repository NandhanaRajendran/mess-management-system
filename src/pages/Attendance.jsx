import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";

export default function Attendance() {
  const { roomId } = useParams();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  const [inmates, setInmates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`https://mess-management-system-q6us.onrender.com/api/students/room/${roomId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const data = await response.json();
        setInmates(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchStudents();
  }, [roomId]);

  function getDailyRecord(person) {
    return {
      present: person.attendanceRecords?.[date] ?? false,
      messcut: person.messCutRecords?.[date] ?? false
    };
  }

  async function updateStudentAction(id, updateData) {
    try {
      const response = await fetch(`https://mess-management-system-q6us.onrender.com/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update student");
      }
      
      const updatedStudent = await response.json();
      
      setInmates(inmates.map(student => 
        student._id === id ? updatedStudent : student
      ));

    } catch (err) {
      console.error(err);
      alert("Error updating record");
    }
  }

  function toggleAttendance(index) {
    const student = inmates[index];
    const { present, messcut } = getDailyRecord(student);

    const updatedAttendance = { ...student.attendanceRecords, [date]: !present };
    const updatedMessCut = { ...student.messCutRecords };
    
    // Ensure mess cut has a boolean value if not present
    if (updatedMessCut[date] === undefined) {
      updatedMessCut[date] = false;
    }

    updateStudentAction(student._id, { 
      attendanceRecords: updatedAttendance,
      messCutRecords: updatedMessCut
    });
  }

  function toggleMessCut(index) {
    const student = inmates[index];
    const { present, messcut } = getDailyRecord(student);

    const updatedMessCut = { ...student.messCutRecords, [date]: !messcut };
    const updatedAttendance = { ...student.attendanceRecords };

    if (updatedAttendance[date] === undefined) {
      updatedAttendance[date] = false;
    }

    updateStudentAction(student._id, { 
      messCutRecords: updatedMessCut,
      attendanceRecords: updatedAttendance
    });
  }

  function calculateMonthlyAttendance(person) {
    let total = 0;

    Object.keys(person.attendanceRecords || {}).forEach((d) => {
      const present = person.attendanceRecords?.[d] ?? false;
      const messcut = person.messCutRecords?.[d] ?? false;

      if (present && !messcut) {
        total++;
      }
    });

    return total;
  }

  return (
    <Layout>
      <div className="attendance-container">
        <div className="attendance-header">
          <h2>Room {roomId}</h2>

          <div className="date-box">
            <label>Date :</label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {error && <div style={{ color: "red", padding: "10px" }}>Error: {error}</div>}

        <div className="table-responsive">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Inmates</th>
                <th>Daily Attendance</th>
                <th>Mess Cut</th>
                <th>Monthly Attendance</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>Loading...</td>
                </tr>
              ) : inmates.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>No students found in this room.</td>
                </tr>
              ) : inmates.map((person, index) => {
                const { present, messcut } = getDailyRecord(person);

                return (
                  <tr key={person._id}>
                    <td>{person.name}</td>

                    <td>
                      <button
                        className={present ? "present" : "absent"}
                        onClick={() => toggleAttendance(index)}
                      >
                        {present ? "Present" : "Absent"}
                      </button>
                    </td>

                    <td>
                      <button
                        className={messcut ? "messcut-on" : "messcut-off"}
                        onClick={() => toggleMessCut(index)}
                      >
                        {messcut ? "Cut" : "No Cut"}
                      </button>
                    </td>

                    <td>{calculateMonthlyAttendance(person)} Days</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
