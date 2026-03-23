require("./keepAlive");
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();
const authRoutes = require("./routes/authRoutes");
const app = express();

// Connect to database
connectDB();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 8000;

// Routes
const studentRoutes = require('./routes/students');
const expenseRoutes = require('./routes/expenses');
const adminRoutes = require("./routes/adminRoutes");

// Add this to your server.js — a self-ping every 14 minutes
// This keeps Render free tier from sleeping


app.use("/api/admin", adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use("/api/fee-section", require("./routes/feeSectionRoutes"));
app.use("/api/balance", require("./routes/balance"));
app.use("/api/bill", require("./routes/bill"));
app.use("/api/staff-attendance", require("./routes/staffAttendance"));
app.use("/api/staff-advisor", require("./routes/staffAdvisor"));
app.use("/api/principal", require("./routes/principal"));
app.get("/", (req, res) => {
  res.send("Mess Management Backend Running");
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running successfully.' });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/delete-admin", async (req, res) => {
  const result = await User.deleteOne({ username: "admin" });
  res.json({ message: "Admin deleted", result });
});