const express = require("express");
const router = express.Router();
const pool = require("../db/database");

router.post("/", async (req, res) => {
    const { artist, title, type } = req.body;
    if (!title) return res.status(400).json({ error: "Trūksta pavadinimo" });

    let points = 1;
    if (type === "good") points = 2;
    if (type === "bad") points = -1;

    try {
        await pool.query(`
            INSERT INTO votes (artist, title, score)
            VALUES ($1, $2, $3)
            ON CONFLICT (title) DO UPDATE SET score = votes.score + $3
        `, [artist || "Nežinomas", title, points]);

        if (global.io) global.io.emit("refresh");
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB klaida" });
    }
});

router.get("/top", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT artist, title, score FROM votes
            ORDER BY score DESC LIMIT 10
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "DB klaida" });
    }
});

module.exports = router;
