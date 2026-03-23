import React, { useState } from "react";
import "../../styles/payment.css";
import { useNavigate } from "react-router-dom";

function HostelPayment() {

const navigate = useNavigate();

const students = [
{ id:"STU2024001", name:"Maria", paidMonths:2 },
{ id:"STU2024002", name:"Shalom Smith", paidMonths:3 },
{ id:"STU2024003", name:"Makyla Johnson", paidMonths:1 }
];

const months = [
"Jan","Feb","Mar","Apr","May","Jun",
"Jul","Aug","Sep","Oct","Nov","Dec"
];

const [hostel,setHostel] = useState("");
const [feeType,setFeeType] = useState("");
const [paymentMode,setPaymentMode] = useState("");

const monthlyHDF = 125;
const monthlyRent = 310;

const totalHDF = 750;
const totalRent = 1860;

const handleLogout = () => {
navigate("/");
};

return(

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

<button className="logoutBtn" onClick={handleLogout}>
Logout
</button>
</div>
</div>


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

</div>


{/* NEW BUTTONS */}

<div className="actionButtons">

<button onClick={()=>navigate("/enroll")}>
Enroll Inmate
</button>

<button onClick={()=>navigate("/manual-hdf")}>
Publish HDF
</button>

<button onClick={()=>navigate("/manual-rent")}>
Publish Rent
</button>

<button onClick={()=>navigate("/publish-hdf")}>
Publish HDF Due
</button>

<button onClick={()=>navigate("/publish-rent")}>
Publish Rent Due
</button>

</div>


{/* TABLE */}

<table>

<thead>

<tr>

<th>Admission No</th>
<th>Name</th>

{months.map((m)=>(
<th key={m}>{m}</th>
))}

</tr>

</thead>


<tbody>

{students.map((s)=>{

const paid = s.paidMonths;

const monthlyFee = feeType==="rent"?monthlyRent:monthlyHDF;
const totalFee = feeType==="rent"?totalRent:totalHDF;

const remaining = totalFee - (paid * monthlyFee);

return(

<tr key={s.id}>

<td>{s.id}</td>
<td>{s.name}</td>

{months.map((m,i)=>{

if(i < paid){
return<td key={i}><span className="paid">Paid</span></td>
}

if(paymentMode==="six" && i===paid){
return <td key={i}><span className="due">₹{remaining}</span></td>
}

if(paymentMode==="monthly" && i===paid){
return <td key={i}><span className="due">₹{monthlyFee}</span></td>
}

return <td key={i} className="future">To be paid</td>;

})}

</tr>

)

})}

</tbody>

</table>

</div>

);

}

export default HostelPayment;