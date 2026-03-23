import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/hostel.css";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function PublishRent(){

const navigate = useNavigate();

const [students, setStudents] = useState([]);
const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
const [selectedYear, setSelectedYear] = useState("2024"); // Default matching dashboard

useEffect(() => {
  fetch("http://localhost:8000/api/students")
    .then(res => res.json())
    .then(data => {
      const studentArray = Array.isArray(data) ? data : [];
      const monthIndex = months.indexOf(selectedMonth);
      const targetYear = Number(selectedYear);

      // ✅ Special Rule: In 2026, month is June. No "Dues" after June.
      if (targetYear === 2026 && monthIndex > 5) {
        setStudents([]);
        return;
      }

      const mapped = studentArray.filter(s => {
        const admissionYear = parseInt(String(s.admission).substring(0, 4));
        if (isNaN(admissionYear)) return false;

        // Hide graduates logic (same as dashboard)
        if (targetYear === 2026 && (admissionYear === 2022 || admissionYear === 2024)) return false;

        return targetYear >= admissionYear && targetYear < admissionYear + 4;
      }).map(s => {
        const admissionYear = parseInt(String(s.admission).substring(0, 4));
        const monthsOffset = (targetYear - admissionYear) * 12;
        const totalPaid = s.rentPaidMonths || 0;
        
        let paidThisYear = totalPaid - monthsOffset;
        if (paidThisYear < 0) paidThisYear = 0;
        if (paidThisYear > 12) paidThisYear = 12;

        const isRecentlyPublished = s.feeUpdatedAt ? (new Date() - new Date(s.feeUpdatedAt)) / (1000 * 60 * 60 * 24) < 10 : false;
        const isNotYetPending = (monthIndex === (targetYear === 2026 ? 5 : 11)) && isRecentlyPublished;

        const isDue = monthIndex >= paidThisYear && !isNotYetPending;

        return {
          id: s.admission,
          name: s.name,
          month: selectedMonth,
          rent: Math.round((s.HostelRent || 1860) / 6),
          isDue: isDue
        };
      })
      .filter(s => s.isDue); 

      setStudents(mapped);
    })
    .catch(err => console.error(err));
}, [selectedMonth, selectedYear]);

const handlePrint = () => {
window.print();
};

return(

<div className="paymentApp" style={{ userSelect: 'none' }}>

<div className="formPage">

<div className="formCard" style={{width:"650px"}}>

<div className="formHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>

<button
  className="manual-back"
  style={{ margin: '0' }}
  onMouseDown={(e) => e.preventDefault()}
  onClick={() => navigate(-1)}
>
  Back
</button>

<h2 style={{ margin: '0', flexGrow: 1, textAlign: 'center' }}>Rent Due List</h2>

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

{students.map((student,index)=>(
<tr key={index}>

<td>{student.id}</td>
<td>{student.name}</td>
<td>{student.month}</td>
<td>{student.rent}</td>
<td><span className="due">Pending</span></td>

</tr>
))}

</tbody>

</table>

<button className="submitBtn" onClick={handlePrint} onMouseDown={(e) => e.preventDefault()}>
Print Rent Due
</button>

</div>

</div>

</div>

)

}

export default PublishRent;