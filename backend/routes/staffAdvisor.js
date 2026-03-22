const express = require("express");
const router = express.Router();
const staffAdvisorController = require("../controllers/staffAdvisorController");

// Ensure to add authentication middleware if needed in server.js or here
// router.use(verifyToken); 

router.get("/students", staffAdvisorController.getStudents);

module.exports = router;
