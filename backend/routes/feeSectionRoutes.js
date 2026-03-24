const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getFeeSectionInfo,
  getFeeSectionDueSheet,
  addFeeToStudents,
  getFeeSectionStudents,
  deleteFee,
} = require("../controllers/feeSectionController");

// All routes require auth
router.get("/info", auth, getFeeSectionInfo);
router.get("/due-sheet", auth, getFeeSectionDueSheet);
router.get("/students", auth, getFeeSectionStudents);
router.post("/add-fee", auth, addFeeToStudents);
router.delete("/delete-fee", auth, deleteFee);

module.exports = router;