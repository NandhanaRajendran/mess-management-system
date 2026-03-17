const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const multer = require("multer");

// ✅ MULTER SETUP
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ GET all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find({});
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ POST (UPDATED FOR FILE + COMMON BILL)
router.post("/", upload.single("bill"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Bill is required" });
    }
    const expense = new Expense({
      title: req.body.title,
      amount: req.body.amount,
      date: req.body.date,
      billMonth: req.body.billMonth,
      bill: req.file ? req.file.filename : null,
      isCommon: req.body.isCommon === "true",
      quantity: req.body.quantity,
    });

    const newExpense = await expense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// ✅ DELETE
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    await expense.deleteOne();
    res.json({ message: "Expense removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
