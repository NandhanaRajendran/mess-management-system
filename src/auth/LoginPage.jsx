import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
export default function LoginPage() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    if (username === "mess-sec" && password === "1234") {
      localStorage.setItem("role", "mess");
      navigate("/mess/dashboard");
    }

    else if (username === "admin" && password === "1234") {
      localStorage.setItem("role", "admin");
      navigate("/admin/dashboard");
    }

    else if (username === "library" && password === "1234") {
      localStorage.setItem("role", "library");
      navigate("/library/students");
    }

    else if (username === "student" && password === "1234") {
      localStorage.setItem("role", "student");
      navigate("/student/dashboard");
    }

    else if (username === "principle" && password === "1234") {
      localStorage.setItem("role", "principle");
      navigate("/principle/dashboard");
    }

    else if (username === "hostel" && password === "1234") {
      localStorage.setItem("role", "hostel");
      navigate("/hostel/dashboard");
    }

    else if (username === "hod" && password === "1234") {
      localStorage.setItem("role", "hod");
      navigate("/hod/dashboard");
    }

    else if (username === "staffadvisor" && password === "1234") {
      localStorage.setItem("role", "staffadvisor");
      navigate("/staffadvisor/dashboard");
    }

    else if (username === "pta" && password === "1234") {
      localStorage.setItem("role", "pta");
      navigate("/pta/dashboard");
    }

    else {
      setError("Invalid username or password");
    }
  }

  return (
    <div className="login">
        <div className="circle c1"></div>
        <div className="circle c2"></div>
        <div className="circle c3"></div>
        <div className="circle c4"></div>
        <div className="circle c5"></div>
      <div className="box">
            <div className="logo">
          <h1  className="heading">🎓 UNIPAY </h1>
            </div>
  

        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
    

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />


        <button className="btnFeatures" onClick={handleLogin}>
          Login
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}