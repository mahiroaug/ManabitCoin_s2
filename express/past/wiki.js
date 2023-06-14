// wiki Root Module
const express = require("express");
const router = express.Router();

// home
router.get("/", function (req,res){
    res.send("wiki home");
});

router.get("/about", function(req,res){
    res.send("about wiki");
});

module.exports = router;