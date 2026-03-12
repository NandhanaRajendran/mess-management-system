import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/main.css";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Expenses from "./pages/Expenses";
import MessBill from "./pages/MessBill";

function App() {

  return (

    <Router>

      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route path="/attendance/:roomId" element={<Attendance />} />

        <Route path="/expenses" element={<Expenses />} />

        <Route path="/messbill" element={<MessBill />} />

      </Routes>

    </Router>

  );
}

export default App;