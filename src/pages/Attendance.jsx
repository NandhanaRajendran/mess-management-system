import { useParams } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { rooms } from "../data/rooms";

export default function Attendance() {
  const { roomId } = useParams();

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);

  const [inmates, setInmates] = useState(() => {
    const members = rooms[roomId];
    return members ? members.map((m) => ({ ...m })) : [];
  });

  function toggleAttendance(index) {

  const updated = [...inmates];

  const current = updated[index].attendanceRecords[date];

  updated[index].attendanceRecords[date] = !current;

  if(updated[index].messCutRecords[date] === undefined){
    updated[index].messCutRecords[date] = false;
  }

  setInmates(updated);
}

  function toggleMessCut(index) {

  const updated = [...inmates];

  if(updated[index].attendanceRecords[date] === undefined){
    updated[index].attendanceRecords[date] = false;
  }

  const current = updated[index].messCutRecords[date];

  updated[index].messCutRecords[date] = !current;

  setInmates(updated);
}

  function calculateMonthlyAttendance(person) {

let total = 0;

Object.keys(person.attendanceRecords || {}).forEach(d => {

const present = person.attendanceRecords?.[d] ?? false;
const messcut = person.messCutRecords?.[d] ?? false;

if(present && !messcut){
total++;
}

});

return total;

}

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

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
              {inmates.map((person, index) => {
                const present = person.attendanceRecords[date];
                const messcut = person.messCutRecords[date];

                return (
                  <tr key={index}>
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
    </div>
  );
}
