import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    console.log("handleLogin triggered"); // ✅ add this as FIRST line
    console.log("username:", username, "password:", password);

    try {
      console.log("Sending login request...");
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log("Response status:", res.status);
      console.log("Response data:", data);
      console.log(data.user.role);

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ Save login info
      sessionStorage.setItem("profile", JSON.stringify(data.user.profile));
      sessionStorage.setItem("username", data.user.username);
      sessionStorage.setItem("role", data.user.role);
      sessionStorage.setItem("token", data.token);

      // 🔥 Redirect based on role
      switch (data.user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "student":
          navigate("/student/dashboard");
          break;
        case "hod":
          navigate("/hod/dashboard");
          break;
        case "staffAdvisor":
          navigate("/staffadvisor/dashboard");
          break;
        case "messManager":
          navigate("/mess/dashboard");
          break;
        case "principal":
          navigate("/principal-dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.log("Catch error:", err.message); // ✅ add this
      setError("Server error: " + err.message);
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
          <h1 className="heading">🎓 UNIPAY </h1>
        </div>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
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
