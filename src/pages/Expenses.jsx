import { useState, useEffect } from "react";
import Layout from "../components/Layout";

export default function Expenses() {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);

  /* single month selector */
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('https://mess-management-system-q6us.onrender.com/api/expenses');
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      setExpenses(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  async function addExpense() {
    if (!title || !amount) return;

    const newExpense = {
      title,
      amount: Number(amount),
      date,
      billMonth: selectedMonth,
    };

    try {
      const response = await fetch('https://mess-management-system-q6us.onrender.com/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExpense)
      });

      if (!response.ok) {
        throw new Error("Failed to add expense");
      }

      const savedExpense = await response.json();
      setExpenses([...expenses, savedExpense]);

      setTitle("");
      setAmount("");
      setDate(today);
    } catch (err) {
      console.error(err);
      alert("Error adding expense");
    }
  }

  async function deleteExpense(id) {
    try {
      const response = await fetch(`https://mess-management-system-q6us.onrender.com/api/expenses/${id}`, {
        method: 'DELETE'
      });

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

        {error && <div style={{ color: "red", padding: "10px" }}>Error: {error}</div>}

        {/* Expense Form */}

        <div className="expense-form">
          <input
            type="text"
            placeholder="Expense title (Rice, Vegetables, Milk...)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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

          <button onClick={addExpense} disabled={loading}>Add Expense</button>
        </div>

        {/* Expense Table */}

        <div className="table-responsive">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Payment Date</th>
                <th>Title</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                 <tr>
                   <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>Loading...</td>
                 </tr>
              ) : monthlyExpenses.length === 0 ? (
                 <tr>
                   <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>No expenses for this month.</td>
                 </tr>
              ) : monthlyExpenses.map((exp) => (
                <tr key={exp._id}>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td>{exp.title}</td>
                  <td>₹{exp.amount}</td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => deleteExpense(exp._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="expense-total">
          Total Mess Expense ({selectedMonth}) : ₹{total}
        </div>
      </div>
    </Layout>
  );
}
