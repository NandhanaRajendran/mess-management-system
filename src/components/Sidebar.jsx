import { useNavigate } from "react-router-dom";

export default function Sidebar() {

  const navigate = useNavigate();

  return (

    <div className="sidebar">

      <h2 className="logo">Hostel</h2>

      <nav>

        <button onClick={()=>navigate("/")}>
          Attendance
        </button>

        <button onClick={()=>navigate("/expenses")}>
          Expenses
        </button>

        <button onClick={()=>navigate("/messbill")}>
          Mess Bill
        </button>

      </nav>

      <button className="logout">
        Logout
      </button>

    </div>

  );
}