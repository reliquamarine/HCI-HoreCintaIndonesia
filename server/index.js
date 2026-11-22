// server/index.js
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/pesan", (req, res) => {
  res.json({ pesan: "Halo dari Express.js!" });
});

app.listen(5000, () => {
  console.log("Server jalan di http://localhost:5000");
});
