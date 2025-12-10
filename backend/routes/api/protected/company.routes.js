const express = require("express");
const router = express.Router();
const companyController = require("../../../controllers/company.controller");
const pdfUpload = require("../../../middleware/file-upload.middleware");

router.post(
  "/request",
  pdfUpload.fileUpload(
    "CompanyRequests",
    ["pdf", "image"],
    [
      {
        name: "logo",
        maxCount: 1,
      },
    ]
  ),
  companyController.requestCompanyAddition
);

module.exports = router;

