const express = require('express');
const router = express.Router();
const principalController = require("../controllers/principalController");

router.get("/students", principalController.getDashboardData);

module.exports = router;
