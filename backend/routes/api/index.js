var express = require("express");
var router = express.Router();
const authRoutes = require("./auth.routes");
const { authorization } = require("../../middleware/authorization.middleware");
const authentication = require("../../middleware/authentication.middleware");
const adminRoutes = require("./admin/index");
const constants = require("../../utils/constants");
const publicRoutes = require("./public/index");
const protectedRoutes = require("./protected/index");

// Auth APIs
router.use("/auth", authRoutes);

// Motor Insurance Routes
router.use(publicRoutes);

// Middleware to check token
router.use(authentication);

// Protected Routes
router.use(protectedRoutes);

// Admin Routes
router.use(
  "/admin",
  authorization([
    constants.roles.admin,
    constants.roles.operator,
    constants.roles.user,
  ]),
  adminRoutes
);

module.exports = router;
