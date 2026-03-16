import React from "react";
import StudentLayout from "./StudentLayout";

function HostelAttendance() {

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (

    <StudentLayout>

      <h2>Hostel Attendance</h2>

      <div className="calendar">

        {days.map(d => (
          <div key={d} className="day">
            {d}
          </div>
        ))}

      </div>

    </StudentLayout>
  );
}

export default HostelAttendance;