import React, { useState, useEffect } from "react";
import "../../styles/hostel.css";
import { useNavigate } from "react-router-dom";

function HostelDashboard() {
  const navigate = useNavigate();

  const [allStudents, setAllStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [hostel, setHostel] = useState("");
  const [feeType, setFeeType] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("dues");

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    fetch("https://mess-management-system-q6us.onrender.com/api/students")
      .then(res => res.json())
      .then(data => setAllStudents(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    let filtered = Array.isArray(allStudents) ? allStudents : [];

    // Global filters
    if (searchQuery) {
      filtered = filtered.filter(s => 
        String(s.admissionNo).includes(searchQuery) || 
        s.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (hostel) {
      filtered = filtered.filter(s => s.hostelName?.toLowerCase() === hostel.toLowerCase());
    }

    if (activeTab === "dues") {
      const targetYearNum = Number(year);
      const mapped = filtered.filter(s => {
        const admStr = String(s.admissionNo);
        const admissionYear = parseInt(admStr.substring(0, 4));
        if (isNaN(admissionYear)) return false;
        return targetYearNum >= admissionYear && targetYearNum < admissionYear + 4;
      }).map(s => {
        const admissionYear = parseInt(String(s.admissionNo).substring(0, 4));
        const monthsOffset = (targetYearNum - admissionYear) * 12;
        const hdfTotal = s.hdfPaidMonths || 0;
        const rentTotal = s.rentPaidMonths || 0;

        let hdfPaidY = Math.max(0, Math.min(12, hdfTotal - monthsOffset));
        let rentPaidY = Math.max(0, Math.min(12, rentTotal - monthsOffset));

        return {
          id: s.admissionNo,
          name: s.name,
          hostelName: s.hostelName,
          room: s.room || "N/A",
          gender: s.gender || "Other",
          hdfPaid: hdfPaidY,
          rentPaid: rentPaidY,
          totalHDF: s.HDF || 750,
          totalRent: s.HostelRent || 1860,
          feeUpdatedAt: s.feeUpdatedAt
        };
      });
      setStudents(mapped);
    } else {
      // Inmate List
      const list = filtered.filter(s => s.hostelName).map(s => ({
        id: s.admissionNo,
        name: s.name,
        gender: s.gender,
        room: s.room,
        hostelName: s.hostelName
      }));
      setStudents(list);
    }
  }, [allStudents, hostel, feeType, searchQuery, year, activeTab]);

  const mostRecentFeeDate = allStudents.length > 0 ? 
    new Date(Math.max(...allStudents.map(s => s.feeUpdatedAt ? new Date(s.feeUpdatedAt) : 0))) : null;
  const isGracePeriod = mostRecentFeeDate ? (new Date() - mostRecentFeeDate) / (1000 * 60 * 60 * 24) < 10 : false;

  const handleUnenroll = async (admissionNo) => {
    if (!window.confirm(`Are you sure you want to unenroll student ${admissionNo}?`)) return;
    try {
      const res = await fetch(`https://mess-management-system-q6us.onrender.com/api/students/unenroll/${admissionNo}`, { method: "DELETE" });
      if (res.ok) {
        setAllStudents(prev => prev.filter(s => s.admissionNo !== admissionNo));
      } else {
        const data = await res.json();
        alert(data.message || "Error unenrolling student");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="hostelPage" style={{ userSelect: "none" }}>
      <div className="container">
        <div className="titleCard">
          <div>
            <h2>🎓 UNIPAY</h2>
            <p className="titleBadge">Hostel Fee Management</p>
          </div>
          <div className="userSection">
            <div className="user-info">Hostel section</div>
            <div className="profileIcon">👤</div>
            <button className="logoutBtn" onClick={() => navigate("/")} onMouseDown={e => e.preventDefault()}>Logout</button>
          </div>
        </div>

        {isGracePeriod && (
          <div className="noticeBar" style={{ background: "#e0f2fe", color: "#0369a1", padding: "10px 15px", borderRadius: "8px", marginBottom: "20px", borderLeft: "4px solid #0ea5e9" }}>
            🔔 A new fee has been published! Students have 10 days to pay before it shows as "Pending".
          </div>
        )}

        <div style={{ display: "flex", gap: "20px", marginBottom: "20px", borderBottom: "1px solid #ddd" }}>
          {["dues", "inmates"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px", border: "none", background: "none", cursor: "pointer",
                borderBottom: activeTab === tab ? "3px solid #5b5cff" : "none",
                fontWeight: activeTab === tab ? "bold" : "normal", color: activeTab === tab ? "#5b5cff" : "#666"
              }}
            >
              {tab === "dues" ? "📋 Fee Dues" : "👥 Inmate List"}
            </button>
          ))}
        </div>

        <div className="controls">
          {activeTab === "dues" && (
            <>
              <select value={hostel} onChange={e => setHostel(e.target.value)}>
                <option value="">Hostel Name</option>
                <option value="Nila Ladies Hostel">Nila Ladies Hostel</option>
              </select>
              <select value={feeType} onChange={e => setFeeType(e.target.value)}>
                <option value="">Category</option>
                <option value="hdf">HDF</option>
                <option value="rent">Rent</option>
              </select>
              <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                <option value="">Duration</option>
                <option value="monthly">Monthly</option>
                <option value="six">6 Months</option>
              </select>
              <select value={year} onChange={e => setYear(e.target.value)}>
                {[...Array(12).keys()].map(i => {
                  const y = 2019 + i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            </>
          )}
          <input
            type="text"
            placeholder={activeTab === "dues" ? "Search Admission No..." : "Filter inmates by name or ID..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="searchBar"
            style={{ flex: 1 }}
          />
        </div>

        <div className="actionButtons">
          <button onClick={() => navigate("/hostel/enroll")} onMouseDown={e => e.preventDefault()}>Enroll Inmate</button>
          <button onClick={() => navigate("/hostel/viewhdf")} onMouseDown={e => e.preventDefault()}>HDF Duesheet</button>
          <button onClick={() => navigate("/hostel/viewrent")} onMouseDown={e => e.preventDefault()}>Rent Duesheet</button>
          <button onClick={() => navigate("/manual-hdf")} onMouseDown={e => e.preventDefault()}>Publish HDF Amount</button>
          <button onClick={() => navigate("/manual-rent")} onMouseDown={e => e.preventDefault()}>Publish Rent Amount</button>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              {activeTab === "dues" ? (
                <tr>
                  <th>Admission No</th>
                  <th>Name</th>
                  <th>Hostel Name</th>
                  {months.map(m => <th key={m}>{m}</th>)}
                </tr>
              ) : (
                <tr>
                  <th>Admission No</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Room No</th>
                  <th>Hostel Name</th>
                  <th>Actions</th>
                </tr>
              )}
            </thead>
            <tbody>
              {students.map(s => {
                if (activeTab === "dues") {
                  const paid = feeType === "rent" ? s.rentPaid : s.hdfPaid;
                  const monthlyFee = (feeType === "rent" ? s.totalRent : s.totalHDF) / 6;
                  const remaining = (feeType === "rent" ? s.totalRent : s.totalHDF) - (paid * monthlyFee);
                  return (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.name}</td>
                      <td>{s.hostelName}</td>
                      {months.map((m, i) => {
                        const targetYearNum = Number(year);
                        const limitMonth = targetYearNum === 2026 ? 5 : (targetYearNum < 2026 ? 11 : -1);
                        if (i > limitMonth) return <td key={i} className="future">To be paid</td>;
                        if (i < paid) return <td key={i}><span className="paid">Paid</span></td>;
                        if (!feeType) {
                          if (i < s.hdfPaid && i < s.rentPaid) return <td key={i}><span className="paid">Paid</span></td>;
                          if (i === limitMonth && isGracePeriod) return <td key={i} className="future">To be paid</td>;
                          return <td key={i}><span className="due">Pending</span></td>;
                        }
                        if (paymentMode === "six") {
                          const isSemEnd = i === 5 || i === 11;
                          return <td key={i}><span className="due">{isSemEnd ? `₹${remaining}` : "Pending"}</span></td>;
                        }
                        if (i === limitMonth && isGracePeriod) return <td key={i} className="future">To be paid</td>;
                        return <td key={i}><span className="due">₹{monthlyFee}</span></td>;
                      })}
                    </tr>
                  );
                } else {
                  return (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.name}</td>
                      <td>{s.gender}</td>
                      <td>{s.room}</td>
                      <td>{s.hostelName}</td>
                      <td>
                        <button onClick={() => handleUnenroll(s.id)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "18px" }} title="Unenroll Inmate">🗑️</button>
                      </td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HostelDashboard;