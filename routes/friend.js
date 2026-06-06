const express = require("express");
const router = express.Router();

router.get("/friend", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    res.render("friend", { user: req.session.user });
});

module.exports = router;
