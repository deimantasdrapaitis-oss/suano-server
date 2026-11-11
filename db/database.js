const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "suano.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("DB klaida:", err.message);
    } else {
        console.log("Prisijungta prie SQLite duomenų bazės");
    }
});

// Sukuriame lentelę, jei jos dar nėra
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            artist TEXT,
            title TEXT UNIQUE,
            score INTEGER DEFAULT 0
        )
    `, (err) => {
        if (err) {
            console.error("Lentelės kūrimo klaida:", err.message);
        } else {
            console.log("Lentelė 'votes' paruošta");
        }
    });
});

module.exports = db;
