


// ============================================
// Spectrum analyzer animacija
// ============================================
const barsContainer = document.getElementById("bars");

for (let i = 0; i < 40; i++) {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = "50px";
    barsContainer.appendChild(bar);
}

setInterval(() => {
    document.querySelectorAll(".bar").forEach((bar) => {
        const height = 4 + Math.random() * 42;
        bar.style.height = height + "px";
    });
}, 100);


// ============================================
// Play / Pause mygtukas
// ============================================


const playBtn = document.getElementById("playBtn");
const player = document.getElementById("radioPlayer");
const onairStatus = document.getElementById("onairStatus");
let playing = false;

function updateOnAirStatus() {
    if (playing) {
        onairStatus.classList.remove("stopped");
        onairStatus.classList.add("playing");
    } else {
        onairStatus.classList.remove("playing");
        onairStatus.classList.add("stopped");
    }
}

playBtn.addEventListener("click", () => {
    if (!playing) {
        player.play();
        playBtn.innerHTML = "⏸";
        playing = true;
    } else {
        player.pause();
        playBtn.innerHTML = "▶";
        playing = false;
    }
    updateOnAirStatus();
});

// Pradžioje – raudona
updateOnAirStatus();


// ============================================
// Dabartinė daina + balsavimo kontrolė
// ============================================
let currentSong = {
    artist: "Nežinomas",
    title: "Nežinoma daina"
};

let lastVotedSong = null;   // Atsimename, už kurią dainą jau balsavome


// ============================================
// Zeno metadata – realiu laiku atnaujina dainą
// ============================================
function updateNowPlaying() {
    const es = new EventSource(
        "https://api.zeno.fm/mounts/metadata/subscribe/lustr3bpsafuv"
    );

    es.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            const fullTitle = data.streamTitle || "Nežinoma daina";

            let artist = "Nežinomas";
            let title = fullTitle;

            if (fullTitle.includes(" - ")) {
                const parts = fullTitle.split(" - ");
                artist = parts[0].trim();
                title = parts.slice(1).join(" - ").trim();
            }

            const newSongKey = artist + "|" + title;
            const oldSongKey = currentSong.artist + "|" + currentSong.title;

            // Jei daina pasikeitė
            if (newSongKey !== oldSongKey) {
                currentSong = { artist, title };

                const songTitleEl = document.getElementById("songTitle");
                if (songTitleEl) {
                    songTitleEl.textContent = fullTitle;
                }

                // Atblokuojame mygtukus, jei dar nebalsavome už šitą dainą
                if (lastVotedSong !== newSongKey) {
                    enableVoteButtons();
                }

                console.log("Daina pasikeitė:", fullTitle);
            }
        } catch (err) {
            console.error("Nepavyko apdoroti metadata:", err);
        }
    };

    es.onerror = (err) => {
        console.warn("SSE ryšys nutrūko, bandome iš naujo...", err);
        es.close();
        setTimeout(updateNowPlaying, 5000);
    };
}


// ============================================
// Balsavimo mygtukų valdymas
// ============================================
function enableVoteButtons() {
    document.querySelectorAll(".votes button").forEach(btn => {
        btn.disabled = false;
        btn.style.boxShadow = "";

        if (btn.classList.contains("good")) btn.innerHTML = "👍 GERAS";
        if (btn.classList.contains("mid"))  btn.innerHTML = "😐 ŠIAIP SAU";
        if (btn.classList.contains("bad"))  btn.innerHTML = "👎 BLOGAS";
    });
}

function disableVoteButtons() {
    document.querySelectorAll(".votes button").forEach(btn => {
        btn.disabled = true;
    });
}


// ============================================
// Balsavimas
// ============================================
async function vote(btn, scoreType) {
    const songKey = currentSong.artist + "|" + currentSong.title;

    // Jei jau balsavome už šitą dainą – nieko nedarome
    if (lastVotedSong === songKey) {
        return;
    }

    disableVoteButtons();

    btn.style.boxShadow = "0 0 20px #00e5ff";
    btn.innerHTML = "✓ AČIŪ";

    lastVotedSong = songKey;

    try {
        await fetch("https://suano-server.onrender.com/api/vote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                artist: currentSong.artist,
                title: currentSong.title,
                type: scoreType
            })
        });

        loadTop();  // <-- pridėk šitą eilutę

        console.log("Balsas išsiųstas:", currentSong, scoreType);
    } catch (err) {
        console.error("Balsavimo klaida:", err);
        // Jei klaida – atblokuojame atgal
        lastVotedSong = null;
        enableVoteButtons();
    }
}


// ============================================
// TOP 5 sąrašas
// ============================================
async function loadTop() {
    try {
    const res = await fetch("https://suano-server.onrender.com/api/vote/top");
        const data = await res.json();

        const ol = document.querySelector(".top-panel ol");
        if (!ol) return;

        ol.innerHTML = data.slice(0, 10).map(item => `
            <li>
                ${item.artist} - ${item.title}
                <span>${item.score} 👍</span>
            </li>
        `).join("");
    } catch (err) {
        console.error("TOP klaida:", err);
    }
}

// Užkrauname iš karto
loadTop();



// ============================================
// Socket.io – vienas prisijungimas viskam
// ============================================

function getListenerWord(count) {
    const n = Math.abs(count) % 100;
    const n1 = n % 10;

    if (n1 === 1 && n !== 11) return "klausytojas";
    if (n1 >= 2 && n1 <= 9 && (n < 10 || n > 20)) return "klausytojai";
    return "klausytojų";
}



if (typeof io !== "undefined") {
const socket = io("https://suano-server.onrender.com", {
    transports: ["websocket", "polling"],
    forceNew: true
});

    socket.on("connect", () => {
        console.log("Prisijungta prie serverio");
    });

    socket.on("listeners", (count) => {
        const el = document.getElementById("listenerCount");
        if (el) {
            el.textContent = count + " " + getListenerWord(count);
        }
    });

    socket.on("refresh", loadTop);
}



// Paleidžiame metadata
updateNowPlaying();





// ============================================
// Laikas (SPECTRUM ANALYZER)
// ============================================
function updateTime() {
    const timerEl = document.getElementById("timer");
    if (!timerEl) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    timerEl.textContent = `${hours}:${minutes}:${seconds}`;
}

// Atnaujiname kas sekundę
setInterval(updateTime, 1000);
updateTime(); // iš karto


document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        console.log("Programėlė pabudo");
        setTimeout(() => {
            loadTop();
            updateNowPlaying();
        }, 1000);
        
        if (playing && player.paused) {
            player.play().catch(e => console.log("Play klaida:", e));
        }
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const { NativeAudio } = window.Capacitor?.Plugins || {};
        if (NativeAudio) {
            await NativeAudio.preload({
                assetId: "radio",
                assetPath: "https://stream.zeno.fm/lustr3bpsafuv",
                audioChannelNum: 1,
                isUrl: true
            });
            console.log("Native audio paruoštas");
        }
    } catch (e) {
        console.log("Native audio klaida:", e);
    }
});

// Gradientas pagal aukštį
function updateBarColors() {
    const bars = document.querySelectorAll(".bar");
    bars.forEach(bar => {
        const height = parseInt(bar.style.height) || 0;
        const ratio = Math.min(height / 50, 1);
        
        const r = Math.floor(255 * (1 - ratio));
        const g = Math.floor(255 * ratio);
        const b = 100;
        
        bar.style.setProperty("background", `rgb(${r}, ${g}, ${b})`, "important");
    });
}

setInterval(updateBarColors, 100);




