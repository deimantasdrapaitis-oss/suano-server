const express = require("express");
const cors = require("cors");
const http = require("http");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*"
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
const metadataRoutes = require("./routes/metadata");
const voteRoutes = require("./routes/vote");

app.use("/api/metadata", metadataRoutes);
app.use("/api/vote", voteRoutes);

// ============================================
// Klausytojų skaičius + statistika
// ============================================
let totalVisits = 0;
let todayVisits = 0;
let lastDate = new Date().toDateString();

io.on("connection", socket => {
  // Dabartiniai klausytojai
  const currentListeners = io.engine.clientsCount;
  console.log("Prisijungė. Dabar klausytojų:", currentListeners);
  io.emit("listeners", currentListeners);

  // Iš viso apsilankymų
  totalVisits++;

  // Šiandien
  const today = new Date().toDateString();
  if (today !== lastDate) {
    todayVisits = 0;
    lastDate = today;
  }
  todayVisits++;

  io.emit("stats", {
    total: totalVisits,
    today: todayVisits
  });

  socket.on("disconnect", () => {
    const currentListeners = io.engine.clientsCount;
    console.log("Atsijungė. Dabar klausytojų:", currentListeners);
    io.emit("listeners", currentListeners);
  });
});

global.io = io;

// Start
server.listen(process.env.PORT || 3000, () => {
  console.log("Running on port 3000");
});
