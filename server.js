const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(express.static(__dirname));
app.use(express.json());

const db = new sqlite3.Database("/data/brainrots.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    desc TEXT,
    img TEXT,
    price TEXT,
    robuxLink TEXT,
    visaLink TEXT,
    quantity INTEGER DEFAULT 1,
    rarity TEXT DEFAULT 'Common'
  )`);
});

// This is the /items part you need — it sends all brainrots to the website
app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Server problem" });
    }
    console.log("Sending brainrots:", rows);
    res.json(rows || []);
  });
});

// Save new brainrot
app.post("/add-item", (req, res) => {
  const { name, desc, img, price, robuxLink, visaLink, quantity, rarity } = req.body;
  db.run("INSERT INTO items (name, desc, img, price, robuxLink, visaLink, quantity, rarity) VALUES (?,?,?,?,?,?,?,?)",
    [name, desc, img, price, robuxLink, visaLink, quantity || 1, rarity || 'Common'],
    (err) => {
      if (err) console.error("Add error:", err);
      res.json({ success: true });
    }
  );
});

app.listen(process.env.PORT || 3000, () => console.log("Shop running"));
