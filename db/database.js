const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.query(`
    CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        artist TEXT,
        title TEXT UNIQUE,
        score INTEGER DEFAULT 0
    )
`).then(() => console.log("Lentelė paruošta"))
  .catch(err => console.error(err));

module.exports = pool;
