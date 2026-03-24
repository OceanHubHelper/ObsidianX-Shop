const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

const dbPath = "/data/brainrots.db";
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ DB open error:", err.message);
  else console.log("✅ Connected to SQLite at", dbPath);
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    desc TEXT,
    moneyPrice TEXT,
    robuxPrice TEXT,
    robuxLink TEXT,
    visaLink TEXT,
    quantity INTEGER DEFAULT 1,
    rarity TEXT,
    img TEXT
  )`, (err) => {
    if (err) console.error("Table creation error:", err);
    else console.log("✅ Table ready (or already existed)");
  });
});

app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) {
      console.error("Items fetch error:", err);
      return res.status(500).json([]);
    }
    console.log(`📦 Sending ${rows.length} brainrots`);
    res.json(rows || []);
  });
});

app.post("/add-item", (req, res) => {
  const { name, desc, moneyPrice, robuxPrice, robuxLink, visaLink, quantity, rarity, img } = req.body;
  db.run(
    "INSERT INTO items (name, desc, moneyPrice, robuxPrice, robuxLink, visaLink, quantity, rarity, img) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [name, desc, moneyPrice, robuxPrice, robuxLink, visaLink, quantity || 1, rarity, img],
    function(err) {
      if (err) {
        console.error("Add item error:", err);
        return res.status(500).json({error: err.message});
      }
      console.log("✅ Brainrot added:", name);
      res.json({success: true});
    }
  );
});

app.post("/hold/:id", (req, res) => {
  db.run("UPDATE items SET quantity = 0 WHERE id = ?", [req.params.id], () => {
    res.json({success: true});
  });
});

app.post("/purchase-complete", (req, res) => {
  console.log("📩 Purchase data received:", req.body);
  res.json({success: true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
