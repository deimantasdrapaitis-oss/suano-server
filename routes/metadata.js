const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "Metadata veikia per frontend EventSource" });
});

module.exports = router;
