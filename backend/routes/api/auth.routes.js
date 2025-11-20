var express = require('express');
var router = express.Router();
const authCtrl = require("../../controllers/auth.controller");

router.post("/signup", authCtrl.signup);
// router.post("/forget-password", authCtrl.forgetpassword);
// router.post("/reset-password", authCtrl.resetpassword);
router.post("/update-password", authCtrl.updatepassword)
router.post("/reactivateUser", authCtrl.reactivateUser);
router.post("/login", authCtrl.login);

module.exports = router;