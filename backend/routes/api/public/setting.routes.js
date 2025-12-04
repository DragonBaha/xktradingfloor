const express = require('express');
const router = express.Router();
const settingController = require('../../../controllers/setting.controller');

router.get("/mock-mode", settingController.mockMode);

module.exports = router;