import { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout";

export default function Expenses() {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const fileInputRef = useRef();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);

  const [bill, setBill] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isCommon, setIsCommon] = useState(false);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        "https://mess-management-system-q6us.onrender.com/api/expenses",
      );
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      setExpenses(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleViewBill = (expense) => {
    setSelectedBill(expense);
  };

  // ✅ ADD EXPENSE (FIXED)
  async function addExpense() {
    if (!title || !amount || !bill) {
      alert("Please fill all fields and upload bill");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("amount", Number(amount));
    formData.append("date", date);
    formData.append("billMonth", selectedMonth);
    formData.append("isCommon", isCommon);
    formData.append("quantity", quantity);

    if (bill) {
      formData.append("bill", bill);
    }

    try {
      const response = await fetch(
        "https://mess-management-system-q6us.onrender.com/api/expenses",
        {
          method: "POST",
          body: formData, // ❗ important
        },
      );

      if (!response.ok) throw new Error("Failed to add expense");

      const savedExpense = await response.json();
      setExpenses([...expenses, savedExpense]);

      // reset
      setTitle("");
      setAmount("");
      setDate(today);
      setBill(null);
      setIsCommon(false);
      setQuantity("");
      fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("Error adding expense");
    }
  }

  async function deleteExpense(id) {
    try {
      const response = await fetch(
        `https://mess-management-system-q6us.onrender.com/api/expenses/${id}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to delete expense");

      setExpenses(expenses.filter((exp) => exp._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting expense");
    }
  }

  const monthlyExpenses = expenses.filter(
    (exp) => exp.billMonth === selectedMonth,
  );

  const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Layout>
      <div className="expenses-container">
        <h2>Mess Expenses</h2>

        {/* Month Selector */}
        <div style={{ marginBottom: "15px" }}>
          <label>
            <b>Month :</b>
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>

        {error && (
          <div style={{ color: "red", padding: "10px" }}>Error: {error}</div>
        )}

        {/* FORM */}
        <div className="expense-form">
          <input
            type="text"
            placeholder="Expense title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="text"
            placeholder="Quantity (e.g. 10kg, 5L)"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* ✅ FILE UPLOAD */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,application/pdf"
            required
            onChange={(e) => setBill(e.target.files[0])}
          />

          {/* ✅ MONTH END COMMON BILL */}
          {new Date(date).getDate() ===
            new Date(
              new Date(date).getFullYear(),
              new Date(date).getMonth() + 1,
              0,
            ).getDate() && (
            <label
              style={{ display: "flex", gap: "6px", alignItems: "center" }}
            >
              <input
                type="checkbox"
                checked={isCommon}
                onChange={(e) => setIsCommon(e.target.checked)}
              />
              Add Common Monthly Bill
            </label>
          )}

          <button onClick={addExpense} disabled={loading}>
            Add Expense
          </button>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Payment Date</th>
                <th>Title</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Action</th>
                <th>Bill</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : monthlyExpenses.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No expenses for this month.
                  </td>
                </tr>
              ) : (
                monthlyExpenses.map((exp) => (
                  <tr key={exp._id}>
                    <td>{new Date(exp.date).toLocaleDateString()}</td>

                    {/* ✅ SHOW COMMON BILL */}
                    <td>
                      {exp.isCommon ? (
                        <span style={{ color: "#2563eb", fontWeight: "600" }}>
                          Common Bill
                        </span>
                      ) : (
                        exp.title
                      )}
                    </td>
                    <td>{exp.quantity || "-"}</td>
                    <td>₹{exp.amount}</td>

                    {/* DELETE */}
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteExpense(exp._id)}
                      >
                        Delete
                      </button>
                    </td>

                    {/* VIEW */}
                    <td>
                      {exp.bill ? (
                        <button
                          className="view-btn"
                          onClick={() => handleViewBill(exp)}
                        >
                          View
                        </button>
                      ) : (
                        "No Bill"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="expense-total">
          Total Mess Expense ({selectedMonth}) : ₹{total}
        </div>
      </div>

      {/* BILL MODAL */}
      {selectedBill && (
        <div className="bill-overlay">
          <div className="bill-modal">
            <div className="bill-header">
              <h3>Bill Details</h3>
              <button onClick={() => setSelectedBill(null)}>✕</button>
            </div>

            <div className="bill-info">
              <p>
                <b>Title:</b> {selectedBill.title}
              </p>
              <p>
                <b>Amount:</b> ₹{selectedBill.amount}
              </p>
              <p>
                <b>Date:</b> {new Date(selectedBill.date).toLocaleDateString()}
              </p>
            </div>

            <div className="bill-preview">
              {selectedBill.bill && selectedBill.bill.endsWith(".pdf") ? (
                <iframe
                  src={`https://mess-management-system-q6us.onrender.com/uploads/${selectedBill.bill}`}
                  title="Bill"
                ></iframe>
              ) : (
                <img
                  src={`https://mess-management-system-q6us.onrender.com/uploads/${selectedBill.bill}`}
                  alt="Bill"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
