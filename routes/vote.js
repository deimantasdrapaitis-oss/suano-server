const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.post("/", (req, res) => {
    const { artist, title, type } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Trūksta dainos pavadinimo" });
    }

    // good = +2, mid = +1, bad = -1
    let points = 1;
    if (type === "good") points = 2;
    if (type === "bad") points = -1;

    db.run(
        `INSERT INTO votes (artist, title, score)
         VALUES (?, ?, ?)
         ON CONFLICT(title) DO UPDATE SET
         score = score + ?`,
        [artist || "Nežinomas", title, points, points],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "DB klaida" });
            }

            // Pranešame visiems klientams, kad atnaujintų TOP
            if (global.io) {
                global.io.emit("refresh");
            }

            res.json({ success: true });
        }
    );
});

router.get("/top", (req, res) => {
    db.all(
        `SELECT artist, title, score
         FROM votes
         ORDER BY score DESC
         LIMIT 10`,
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: "DB klaida" });
            }
            res.json(rows);
        }
    );
});

module.exports = router;
