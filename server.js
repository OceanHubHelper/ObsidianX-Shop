const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database("/data/brainrots.db");

db.serialize(() => {
  // Drop old table so we get the new columns
  db.run("DROP TABLE IF EXISTS items");

  db.run(`CREATE TABLE items (
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
  )`);
  console.log("✅ Database table recreated with moneyPrice and robuxPrice");
});

app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) console.error(err);
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
        console.error(err);
        return res.status(500).json({error: err.message});
      }
      console.log("✅ New brainrot added:", name);
      res.json({success: true});
    }
  );
});

app.post("/hold/:id", (req, res) => {
  db.run("UPDATE items SET quantity = 0 WHERE id = ?", [req.params.id]);
  res.json({success: true});
});

app.post("/purchase-complete", (req, res) => {
  console.log("📩 Purchase received from shop:", req.body);
  res.json({success: true});
});

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
