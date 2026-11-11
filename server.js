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
// Klausytojų skaičius
// ============================================
let listenerCount = 0;

io.on("connection", socket => {
  listenerCount++;
  console.log("Prisijungė. Dabar klausytojų:", listenerCount);

  // Siunčiame visiems naują skaičių
  io.emit("listeners", listenerCount);

  socket.on("disconnect", () => {
    listenerCount--;
    console.log("Atsijungė. Dabar klausytojų:", listenerCount);
    io.emit("listeners", listenerCount);
  });
});

global.io = io;

// Start
server.listen(process.env.PORT || 3000, () => {
  console.log("Running on port 3000");
});