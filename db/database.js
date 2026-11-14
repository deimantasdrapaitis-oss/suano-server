const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

pool.on("error", (err) => {
    console.error("DB ryšio klaida:", err.message);
});

async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS votes (
                id SERIAL PRIMARY KEY,
                artist TEXT,
                title TEXT UNIQUE,
                score INTEGER DEFAULT 0
            )
        `);
        console.log("Lentelė paruošta");
    } catch (err) {
        console.error("DB init klaida:", err.message);
        setTimeout(initDB, 5000);
    }
}

initDB();

module.exports = pool;
