import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { rooms } from "../data/rooms";
import { messExpenses } from "../data/messExpenses";

export default function MessBill() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  /* collect all students from all rooms */

  const allStudents = Object.entries(rooms).flatMap(([roomNumber, students]) =>
    students.map((student) => ({
      ...student,
      room: roomNumber,
    })),
  );

  /* calculate attendance days */

  function calculateAttendance(person) {
    if (!person.attendanceRecords) return 0;

    let total = 0;

    Object.keys(person.attendanceRecords).forEach((date) => {
      const messcut = person.messCutRecords?.[date] ?? false;

      if (!messcut && date.startsWith(selectedMonth)) {
        total++;
      }
    });

    return total;
  }

  /* monthly mess expense */

  const monthlyExpense = messExpenses.data
    .filter((exp) => exp.billMonth === selectedMonth)
    .reduce((sum, exp) => sum + exp.amount, 0);

  /* total attendance */

  const totalAttendance = allStudents.reduce(
    (sum, student) => sum + calculateAttendance(student),
    0,
  );

  /* mess rate per day */

  const messRate = totalAttendance ? monthlyExpense / totalAttendance : 0;

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="expenses-container">
          <h2>Mess Bill</h2>

          <div style={{ marginBottom: "15px" }}>
            <label>
              <b>Month :</b>
            </label>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>

          {/* Scrollable table */}

          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Student</th>
                  <th>Attendance Days</th>
                  <th>Mess Bill</th>
                </tr>
              </thead>

              <tbody>
                {allStudents.map((student, index) => {
                  const days = calculateAttendance(student);

                  const bill = (days * messRate).toFixed(2);

                  return (
                    <tr key={index}>
                      <td>{student.room}</td>
                      <td>{student.name}</td>

                      <td>{days}</td>

                      <td>₹{bill}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="expense-total">
            Total Mess Expense : ₹{monthlyExpense}
            <br />
            Total Attendance : {totalAttendance}
            <br />
            Mess Rate Per Day : ₹{messRate.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
