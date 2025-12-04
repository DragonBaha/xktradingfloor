const express = require('express');
const router = express.Router();
const settingRoutes = require('./setting.routes');

router.use("/settings", settingRoutes);

module.exports = router;