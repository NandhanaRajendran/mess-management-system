import React, { useState } from "react";
import "./manual.css";
import { useNavigate } from "react-router-dom";

function ManualRent() {

  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("June");

  const handlePublish = async () => {
    const numAmount = Number(amount);

    if (!amount) {
      alert("Please enter Rent amount");
      return;
    }

    if (numAmount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    try {
      const response = await fetch("https://mess-management-system-q6us.onrender.com/api/students/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount })
      });
      if (response.ok) {
        alert(`Rent for ${selectedMonth} is published`);
        setAmount("");
      } else {
        alert("Error publishing Rent");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const displayMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="manual-container" style={{ userSelect: 'none' }}>

      <div className="manual-card">

        <button
          type="button"
          className="manual-back"
          onClick={() => navigate(-1)}
          onMouseDown={(e) => e.preventDefault()}
        >
          Back
        </button>

        <h2 className="manual-title">Publish Monthly Rent</h2>

        <select 
          className="manual-input"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ marginBottom: '15px' }}
        >
          {displayMonths.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        {/* AMOUNT */}
        <input
          className="manual-input"
          type="number"
          placeholder="Enter Rent Amount"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
          }}
        />

        {/* BUTTON */}
        <button
          className="manual-btn"
          onClick={handlePublish}
          onMouseDown={(e) => e.preventDefault()}
        >
          Publish
        </button>

      </div>

    </div>
  );
}

export default ManualRent;