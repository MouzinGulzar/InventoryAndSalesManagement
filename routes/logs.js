const express = require("express");
const router = express.Router();

const authenticate = require("../utils/middlewareAuth");

const logsController = require("../controllers/logs");

router.get("/logs", authenticate, logsController.getLogs);
router.get("/logs/:id", authenticate, logsController.getLog);

module.exports = router;