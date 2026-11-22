// server/index.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/pesan", (req, res) => {
  res.json({ pesan: "Halo dari Express.js!" });
});

app.listen(PORT, (err) => {
  if (err) {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} sudah digunakan proses lain.`);
    } else {
      console.error("Gagal menjalankan server:", err.message);
    }
    process.exit(1);
  }
  console.log(`Server jalan di http://localhost:${PORT}`);
});
