import React, { useState } from "react";
import "../../styles/hostel.css"; // ✅ correct CSS
import { useNavigate } from "react-router-dom";

function HostelDashboard() {

  const navigate = useNavigate();

  const [allStudents, setAllStudents] = useState([]);
  const [students, setStudents] = useState([]);

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const [hostel,setHostel] = useState("");
  const [feeType,setFeeType] = useState("");
  const [paymentMode,setPaymentMode] = useState("");
  const [year, setYear] = useState(new Date().getFullYear()); // ✅ New State
  const [searchQuery, setSearchQuery] = useState(""); // ✅ New State

  React.useEffect(() => {
    fetch('http://localhost:8000/api/students')
      .then(res => res.json())
      .then(data => {
        setAllStudents(data);
      })
      .catch(err => console.error(err));
  }, []);

  React.useEffect(() => {
    let filtered = Array.isArray(allStudents) ? allStudents : [];
    
    // ✅ Search Filter (Admission No)
    if (searchQuery) {
       filtered = filtered.filter(s => 
         String(s.admission).includes(searchQuery)
       );
    }

    // ✅ Hostel Filter
    if (hostel) {
       filtered = filtered.filter(s => s.hostelName?.toLowerCase() === hostel.toLowerCase());
    }

    // ✅ Year Filter & Status Mapping
    // Logic: It checks the first 4 digits of the admission number as the "Starting Year".
    // If the selected year is before their admission year, they are hidden for that year.
    // If current year is after, it offsets the 'paidMonths' accordingly.

    const filteredAndMapped = filtered.filter(s => {
      const admStr = String(s.admission);
      const admissionYear = parseInt(admStr.substring(0, 4));
      const targetYear = Number(year);
      
      if (isNaN(admissionYear)) return false;

      // Standard visibility: from admission year up to 4 years total
      return targetYear >= admissionYear && targetYear < admissionYear + 4;
    }).map(s => {
      const admissionYear = parseInt(String(s.admission).substring(0, 4));
      const targetYear = parseInt(year);
      const yearsElapsed = targetYear - admissionYear;
      const monthsOffset = yearsElapsed * 12;

      const hdfTotal = s.hdfPaidMonths || 0;
      const rentTotal = s.rentPaidMonths || 0;

      let hdfPaidY = hdfTotal - monthsOffset;
      if (hdfPaidY < 0) hdfPaidY = 0;
      if (hdfPaidY > 12) hdfPaidY = 12;

      let rentPaidY = rentTotal - monthsOffset;
      if (rentPaidY < 0) rentPaidY = 0;
      if (rentPaidY > 12) rentPaidY = 12;

      return {
          id: s.admission,
          name: s.name,
          hostelName: s.hostelName,
          paidMonths: feeType === "rent" ? rentPaidY : hdfPaidY,
          hdfPaid: hdfPaidY, // ✅ Tracked for generic view
          rentPaid: rentPaidY, // ✅ Tracked for generic view
          totalHDF: s.HDF || 750,
          totalRent: s.HostelRent || 1860,
          feeUpdatedAt: s.feeUpdatedAt
      };
    });

    setStudents(filteredAndMapped);
  }, [allStudents, hostel, feeType, searchQuery, year]);

  // Handle Notice logic
  const mostRecentFeeDate = allStudents.length > 0 ? 
    new Date(Math.max(...allStudents.map(s => s.feeUpdatedAt ? new Date(s.feeUpdatedAt) : 0))) : null;
  const daysSincePublish = mostRecentFeeDate ? (new Date() - mostRecentFeeDate) / (1000 * 60 * 60 * 24) : 999;
  const isGracePeriod = daysSincePublish < 10;

  const handleLogout = () => {
    navigate("/");
  };

  return(

    <div className="hostelPage" style={{ userSelect: 'none' }}> {/* ✅ IMPORTANT WRAPPER */}

      <div className="container">

        {/* TOP CARD */}
        <div className="titleCard">

          <div>
            <h2>🎓 UNIPAY</h2>
            <p className="titleBadge">Hostel Fee Management</p>
          </div>

          <div className="userSection">
            <div className="user-info">
              Christina
            </div>
            <div className="profileIcon">👤</div>

            <button className="logoutBtn" onClick={handleLogout} onMouseDown={(e) => e.preventDefault()}>
              Logout
            </button>
          </div>
        </div>

        {isGracePeriod && (
          <div className="noticeBar" style={{ background: '#e0f2fe', color: '#0369a1', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #0ea5e9', fontWeight: '500' }}>
            🔔 A new fee has been published! Students have 10 days to pay before it shows as "Pending".
          </div>
        )}

        {/* FILTERS */}
        <div className="controls">

          <select
            value={hostel}
            onChange={(e)=>setHostel(e.target.value)}
          >
            <option value="">Hostel Name</option>
            <option value="Kabani Ladies Hostel">Kabani Ladies Hostel</option>
            <option value="Nila Ladies Hostel">Nila Ladies Hostel</option>
            <option value="Mens Hostel">Mens Hostel</option>
          </select>

          <select 
            value={feeType}
            onChange={(e)=>setFeeType(e.target.value)}
          >
            <option value="">Category</option>
            <option value="hdf">HDF</option>
            <option value="rent">Rent</option>
          </select>

          <select
            value={paymentMode}
            onChange={(e)=>setPaymentMode(e.target.value)}
          >
            <option value="">Duration</option>
            <option value="monthly">Monthly</option>
            <option value="six">6 Months</option>
          </select>

          <select
            value={year}
            onChange={(e)=>setYear(e.target.value)}
          >
            {[...Array(12).keys()].map(i => {
              const y = 2019 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>

          <input 
            type="text" 
            placeholder="Search Admission No..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="searchBar"
          />

        </div>

        {/* ACTION BUTTONS */}
        <div className="actionButtons">

          <button onClick={()=>navigate("/hostel/enroll")} onMouseDown={(e) => e.preventDefault()}>
            Enroll Inmate
          </button>

          <button onClick={()=>navigate("/hostel/viewhdf")} onMouseDown={(e) => e.preventDefault()}>
            Publish HDF Due
          </button>

          <button onClick={()=>navigate("/hostel/viewrent")} onMouseDown={(e) => e.preventDefault()}>
            Publish Rent Due
          </button>

          <button onClick={()=>navigate("/manual-hdf")} onMouseDown={(e) => e.preventDefault()}>
            Publish HDF Amount
          </button>

          <button onClick={()=>navigate("/manual-rent")} onMouseDown={(e) => e.preventDefault()}>
            Publish Rent Amount
          </button>

        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table>

            <thead>
              <tr>
                <th>Admission No</th>
                <th>Name</th>
                <th>Hostel Name</th>

                {months.map((m)=>(
                  <th key={m}>{m}</th>
                ))}
              </tr>
            </thead>

            <tbody>

              {students.map((s)=>{

                const paid = s.paidMonths;

                const totalFee = feeType==="rent" ? s.totalRent : s.totalHDF;
                const monthlyFee = totalFee / 6;

                const remaining = totalFee - (paid * monthlyFee);

                return(

                  <tr key={s.id}>

                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.hostelName}</td>

                    {months.map((m,i)=>{
                      const targetYearNum = Number(year);
                      // In 2026, assume month is June (index 5). 
                      // Everyone must pay up to June. 
                      // Months > 5 are future ("To be paid").
                      // For years after 2026, limitMonth is -1 (nothing published yet).
                      const limitMonth = targetYearNum === 2026 ? 5 : (targetYearNum < 2026 ? 11 : -1);

                      if (i > limitMonth) {
                        return <td key={i} className="future">To be paid</td>;
                      }

                      if(i < paid){
                        return <td key={i}><span className="paid">Paid</span></td>
                      }

                      if (!feeType) {
                        // In generic view, only show Paid if BOTH are paid for this month
                        if (i < s.hdfPaid && i < s.rentPaid) {
                           return <td key={i}><span className="paid">Paid</span></td>;
                        }
                        if (i === limitMonth && isGracePeriod) {
                           return <td key={i} className="future">To be paid</td>;
                        }
                        return <td key={i}><span className="due">Pending</span></td>;
                      }

                      if (paymentMode === "six") {
                        // Last month of semester 1 is 5 (Jun), semester 2 is 11 (Dec)
                        const semesterEnd = i < 6 ? 5 : 11;
                        const isSemesterEnd = (i === semesterEnd);
                        
                        return (
                          <td key={i}>
                            <span className="due">
                              {isSemesterEnd ? `₹${remaining}` : "Pending"}
                            </span>
                          </td>
                        );
                      }

                      if (i === limitMonth && isGracePeriod) {
                         return <td key={i} className="future">To be paid</td>;
                      }

                      return <td key={i}><span className="due">₹{monthlyFee}</span></td>;
                    })}

                  </tr>

                )

              })}

            </tbody>

          </table>
        </div>

      </div>

    </div>

  );

}

export default HostelDashboard;