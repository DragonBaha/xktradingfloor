const express = require("express");
const router = express.Router();
const companyController = require("../../../controllers/company.controller");
const { permissionAuthorization } = require("../../../middleware/authorization.middleware");
const constants = require("../../../utils/constants");
const pdfUpload = require("../../../middleware/file-upload.middleware");

// Create company - requires create permission
router.post(
  "/addcompany",
  permissionAuthorization("company", ["create"], [constants.roles.admin, constants.roles.operator]),
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
  companyController.createCompany
);

// Get all companies - requires read permission
router.post(
  "/getallcompanies",
  permissionAuthorization("company", ["read"], [constants.roles.admin, constants.roles.operator]),
  companyController.getAllCompanies
);

// Get company by ID - requires read permission
router.get(
  "/:companyId/getcompanybyid",
  permissionAuthorization("company", ["read"], [constants.roles.admin, constants.roles.operator]),
  companyController.getCompanyById
);

// Update company - requires update permission
router.put(
  "/:companyId/updatecompany",
  permissionAuthorization("company", ["update"], [constants.roles.admin, constants.roles.operator]),
  companyController.updateCompany
);

// Delete company - requires delete permission
router.delete(
  "/:companyId/deletecompany",
  permissionAuthorization("company", ["delete"], [constants.roles.admin, constants.roles.operator]),
  companyController.deleteCompany
);

// Add promo code - requires update permission (as it modifies company)
router.post(
  "/:companyId/addpromocode",
  permissionAuthorization("company", ["update"], [constants.roles.admin, constants.roles.operator]),
  companyController.addPromoCode
);

// Update promo code - requires update permission
router.put(
  "/:companyId/updatepromocode/:promoId",
  permissionAuthorization("company", ["update"], [constants.roles.admin, constants.roles.operator]),
  companyController.updatePromoCode
);

// Delete promo code - requires update permission
router.delete(
  "/:companyId/deletepromocode/:promoId",
  permissionAuthorization("company", ["update"], [constants.roles.admin, constants.roles.operator]),
  companyController.deletePromoCode
);

module.exports = router;
