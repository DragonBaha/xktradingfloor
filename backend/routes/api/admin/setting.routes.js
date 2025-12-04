const express = require('express');
const router = express.Router();
const settingController = require('../../../controllers/setting.controller');

router.put("/mock-mode", settingController.updateMockMode);

module.exports = router;

