const express = require("express");
const router = express.Router();

const authenticate = require("../utils/middlewareAuth");

const dashboardController = require("../controllers/dashboard");

router.get("/", authenticate, dashboardController.getDashboard);

module.exports = router;
