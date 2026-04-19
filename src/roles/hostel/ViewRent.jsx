import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/manual.css";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//const API = "https://mess-management-system-q6us.onrender.com"
  const API = "http://localhost:8000"

function PublishRent() {

  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState("2024");

  useEffect(() => {
    fetch(`${API}/api/students`)
      .then(res => res.json())
      .then(data => {
        const studentArray = Array.isArray(data) ? data : [];
        const monthIndex = months.indexOf(selectedMonth);
        const targetYear = Number(selectedYear);

        if (targetYear === 2026 && monthIndex > 5) {
          setStudents([]);
          return;
        }

        const mapped = studentArray.filter(s => {
          const admissionYear = parseInt(String(s.admissionNo).substring(0, 4));
          if (isNaN(admissionYear)) return false;
          if (targetYear === 2026 && (admissionYear === 2022 || admissionYear === 2024)) return false;
          return targetYear >= admissionYear && targetYear < admissionYear + 4;
        }).map(s => {
          const admissionYear = parseInt(String(s.admissionNo).substring(0, 4));
          const monthsOffset = (targetYear - admissionYear) * 12;
          const totalPaid = s.rentPaidMonths || 0;
          let paidThisYear = totalPaid - monthsOffset;
          if (paidThisYear < 0) paidThisYear = 0;
          if (paidThisYear > 12) paidThisYear = 12;
          const isRecentlyPublished = s.feeUpdatedAt ? (new Date() - new Date(s.feeUpdatedAt)) / (1000 * 60 * 60 * 24) < 10 : false;
          const isNotYetPending = (monthIndex === (targetYear === 2026 ? 5 : 11)) && isRecentlyPublished;
          const isDue = monthIndex >= paidThisYear && !isNotYetPending;
          return {
            id: s.admissionNo,
            name: s.name,
            month: selectedMonth,
            rent: Math.round((s.HostelRent || 1860) / 6),
            isDue: isDue
          };
        }).filter(s => s.isDue);

        setStudents(mapped);
      })
      .catch(err => console.error(err));
  }, [selectedMonth, selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="manual-container" style={{ userSelect: 'none' }}>
      <div className="manual-card" style={{ width: "800px", maxWidth: "95%" }}>
        <div className="formHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            className="manual-back"
            style={{ margin: '0' }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <h2 className="manual-title" style={{ margin: '0', flexGrow: 1, textAlign: 'center' }}>Rent Due List</h2>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ padding: '2px 5px', borderRadius: '5px', fontSize: '13px', width: '70px', marginLeft: '10px' }}
          >
            {[...Array(12).keys()].map(i => {
              const y = 2019 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '2px 5px', borderRadius: '5px', fontSize: '13px', width: '70px', marginLeft: '10px' }}
          >
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <table style={{ marginBottom: '30px', tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'center', width: '20%' }}>ID</th>
              <th style={{ textAlign: 'center', width: '25%' }}>Name</th>
              <th style={{ textAlign: 'center', width: '20%' }}>Month</th>
              <th style={{ textAlign: 'center', width: '20%' }}>Amount</th>
              <th style={{ textAlign: 'center', width: '15%' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={index}>
                <td style={{ textAlign: 'center' }}>{student.id}</td>
                <td style={{ textAlign: 'center' }}>{student.name}</td>
                <td style={{ textAlign: 'center' }}>{student.month}</td>
                <td style={{ textAlign: 'center' }}>{student.rent}</td>
                <td style={{ textAlign: 'center' }}><span className="due">Pending</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="manual-btn" onClick={handlePrint} onMouseDown={(e) => e.preventDefault()}>
          Print Rent Due
        </button>
      </div>
    </div>
  );
}

export default PublishRent;