import React from "react";
import Navbar from "../../components/Navbar";

function StudentLayout({ children }) {

  return (
    <div>

      <Navbar />

      <div className="student-container">
        {children}
      </div>

    </div>
  );
}

export default StudentLayout;