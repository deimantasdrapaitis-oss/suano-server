const SUPABASE_URL = "https://nlxrndavgoqsxubexgew.supabase.co";
const SUPABASE_KEY = "sb_publishable_n2owILRv4O7w0i7e0mP2_Q_460vqRql";

async function query(sql, params = []) {
    return [];
}

async function addVote(artist, title, points) {
    try {
        const check = await fetch(`${SUPABASE_URL}/rest/v1/votes?title=eq.${encodeURIComponent(title)}`, {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        });
        const existing = await check.json();

        if (existing.length > 0) {
            const newScore = existing[0].score + points;
            await fetch(`${SUPABASE_URL}/rest/v1/votes?title=eq.${encodeURIComponent(title)}`, {
                method: "PATCH",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({ score: newScore })
            });
        } else {
            await fetch(`${SUPABASE_URL}/rest/v1/votes`, {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({ artist, title, score: points })
            });
        }
    } catch (err) {
        console.error("Balsavimo klaida:", err);
    }
}

async function getTop() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/votes?select=*&order=score.desc&limit=10`, {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        });
        return await res.json();
    } catch (err) {
        console.error("TOP klaida:", err);
        return [];
    }
}

module.exports = { query, addVote, getTop };
