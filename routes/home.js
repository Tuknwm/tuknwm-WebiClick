const express = require("express");
const router = express.Router();
const User = require("../models/user");

const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};
//Fungsi untuk menampilkan Landing page
router.get("/", (req, res) => {
  res.render("LandingPage");
});

router.get("/landing", (req, res) => {
  res.render("LandingPage");
});

//Fungsi untuk menampilkan Global chat page
router.get("/global", (req, res) => {
  res.render("global");
})

//Fungsi untuk menampilkan home page
router.get("/home", (req, res) => {
  res.render("home");
});

//Fungsi untuk menampilkan about page
router.get("/about", (req, res) => {
  res.render("about");
});

//Fungsi untuk menampilkan Profile page
router.get("/profile", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.redirect("/login");
    }
    res.render("profile", { user });
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
});

//Fungsi untuk menampilkan Change username page
router.get("/ChangeUsername", (req, res) => {
  res.render("ChangeUsername");
});

//Fungsi untuk menampilkan Change password page
router.get("/ChangePassword", (req, res) => {
  res.render("ChangePassword");
});

module.exports = router;
