import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
//import { expensesData } from "../data/expensesData";
import { messExpenses } from "../data/messExpenses";

export default function Expenses() {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [expenses,setExpenses] = useState(messExpenses.data);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);

  /* single month selector */
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  function addExpense(){

if(!title || !amount) return;

const newExpense = {
id: Date.now(),
title,
amount: Number(amount),
date,
billMonth: selectedMonth
};

messExpenses.data.push(newExpense);

setExpenses([...messExpenses.data]);

setTitle("");
setAmount("");
setDate(today);

}

  function deleteExpense(id) {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  }

  const monthlyExpenses = expenses.filter(
    (exp) => exp.billMonth === selectedMonth,
  );

  const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

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

            <button onClick={addExpense}>Add Expense</button>
          </div>

          {/* Expense Table */}

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
              {monthlyExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td>{exp.title}</td>
                  <td>₹{exp.amount}</td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => deleteExpense(exp.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="expense-total">
            Total Mess Expense ({selectedMonth}) : ₹{total}
          </div>
        </div>
      </div>
    </div>
  );
}
