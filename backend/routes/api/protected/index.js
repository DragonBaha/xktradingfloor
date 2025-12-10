const express = require('express');
const router = express.Router();
const companyRoutes = require('./company.routes');

router.use('/company', companyRoutes);

module.exports = router;