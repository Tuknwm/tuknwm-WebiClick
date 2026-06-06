const express = require("express");
const path = require("path");
const session = require("express-session");
const port = process.env.PORT || process.env.port || 3000;
const app = express();

require("./db");

// Seed 2 test user yang sudah saling follow + ada chat
const bcrypt = require("bcryptjs");
const db = require("./db");
const Chat = require("./models/Chat");

async function seedTestUsers() {
    const hash = await bcrypt.hash("test1234", 10);

    const u1 = await db.users.insertAsync({
        username: "test1",
        email: "test1@test.com",
        password: hash,
        followers: [],
        following: [],
        followRequests: []
    });
    const u2 = await db.users.insertAsync({
        username: "test2",
        email: "test2@test.com",
        password: hash,
        followers: [],
        following: [],
        followRequests: []
    });

    // Saling follow
    await db.users.updateAsync({ _id: u1._id }, { $set: { following: [u2._id], followers: [u2._id] } });
    await db.users.updateAsync({ _id: u2._id }, { $set: { following: [u1._id], followers: [u1._id] } });

    // Seed beberapa pesan chat
    const messages = [
        { sender: u1._id, receiver: u2._id, message: "Halo test2!" },
        { sender: u2._id, receiver: u1._id, message: "Halo test1, apa kabar?" },
        { sender: u1._id, receiver: u2._id, message: "Baik nih, lagi nyoba fitur chat 😄" },
        { sender: u2._id, receiver: u1._id, message: "Keren, berhasil!" },
    ];
    for (const msg of messages) {
        await new Chat(msg).save();
    }

    // Seed beberapa score
    await db.scores.insertAsync({ score: 42, user: u1._id, timemode: 5, clickmode: "mouse", createdAt: new Date() });
    await db.scores.insertAsync({ score: 38, user: u2._id, timemode: 5, clickmode: "mouse", createdAt: new Date() });
    await db.scores.insertAsync({ score: 75, user: u1._id, timemode: 10, clickmode: "keyboard", createdAt: new Date() });

    console.log("✅ Test users seeded — login: test1/test1234 atau test2/test1234");
}

seedTestUsers().catch(console.error);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "rahasia",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const friendRoutes = require("./routes/friend");
const authRoutes = require("./routes/auth");
const homeRoutes = require("./routes/home");
const changeRoutes = require("./routes/change");
const globalRoutes = require("./routes/global");
const leaderboardRouter = require("./routes/leaderboard");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use("/", authRoutes);
app.use("/", homeRoutes);
app.use("/", changeRoutes);
app.use("/", friendRoutes);
app.use("/global", globalRoutes);
app.use("/leaderboard", leaderboardRouter);

app.use((req, res) => {
  res.status(404).render("error", {
    KodeError: "404 Not Found",
    MessageError: "Halaman tidak ditemukan",
  });
});

app.listen(port, () => console.log(`server on port http://localhost:${port}`));

module.exports = app;
