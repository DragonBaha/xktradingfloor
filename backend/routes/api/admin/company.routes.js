const express = require('express');
const router = express.Router();
const companyController = require('../../../controllers/company.controller');

const pdfUpload = require("../../../middleware/file-upload.middleware");

router.post('/addcompany',
    pdfUpload.fileUpload(
        "companies",
        ["pdf", "image"],
        [
            {
                name: "logo",
                maxCount: 1,
            },
        ]
    ),
    companyController.createCompany);

router.post('/getallcompanies', companyController.getAllCompanies);
router.get('/:companyId/getcompanybyid', companyController.getCompanyById);
router.delete('/:companyId/deletecompany', companyController.deleteCompany);

module.exports = router;