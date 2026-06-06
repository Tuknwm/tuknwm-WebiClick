const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Score = require("../models/Score");
const router = express.Router();

//Fungsi untuk menampilkan page
router.get("/ChangeUsername", (req, res) => {
    res.render("ChangeUsername");
});

//Router untuk mengubah username baru ke database
router.post("/ChangeUsername", async(req, res) => {
    try {
        const { 'New-username': newUsername, password } = req.body;
        const userId = req.session.user;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send("User not found");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.render("ChangeUsername", { errorMessage: "Invalid password" });
        }

        const existingUser = await User.findOne({ username: newUsername });
        if (existingUser) {
            return res.render("ChangeUsername", { errorMessage: "Username already exists" });
        }

        await User.findByIdAndUpdate(userId, { username: newUsername });
        res.redirect("/home");
    } catch (error) {
        console.error(error);
        res.render("ChangeUsername", { errorMessage: "An error occurred" });
    }
});

//Fungsi untuk menampilkan page
router.get("/ChangePassword", (req, res) => {
    res.render("ChangePassword");
});

//Fungsi untuk merubah password baru ke database
router.post("/ChangePassword", async(req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.session.user;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.render("ChangePassword", { errorMessage: "Current password is incorrect" });
        }

        if (newPassword !== confirmPassword) {
            return res.render("ChangePassword", { errorMessage: "New passwords doesnt match" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.findByIdAndUpdate(userId, { password: hashedPassword });
        res.redirect("home");
    } catch (error) {
        console.error(error);
        res.render("ChangePassword", { errorMessage: "An error occurred" });
    }
});

module.exports = router;