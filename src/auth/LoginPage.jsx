import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const userRef = useRef(null);
  const passRef = useRef(null);

  useEffect(() => {
    const handleKeys = (e) => {
      // Space key to focus username (if not already focused or typing elsewhere)
      if (e.code === "Space" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        userRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    console.log("handleLogin triggered"); // ✅ add this as FIRST line
    console.log("username:", username, "password:", password);

    try {
      console.log("Sending login request...");
      const res = await fetch("https://mess-management-system-q6us.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log("Response status:", res.status);
      console.log("Response data:", data);
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      console.log(data.user.role);

      // ✅ Save login info
      sessionStorage.setItem("user", JSON.stringify(data.user));
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
        case "feeManager":
          navigate("/fee/dashboard");
          break;
        case "hostelManager":
          navigate("/hostel/dashboard");
          break;
        case "pta":
          navigate("/pta/dashboard");
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
          ref={userRef}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              passRef.current?.focus();
            }
          }}
        />

        <input
          ref={passRef}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin(e);
            }
          }}
        />

        <button className="btnFeatures" onClick={handleLogin}>
          Login
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}
