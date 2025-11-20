var express = require('express');
var router = express.Router();
const apiRoutes = require("./api/index");

router.get("/ping", async function (req, res) {
    res.send("pong");
});

router.use("/api", apiRoutes);

module.exports = router;