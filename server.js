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

app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => res.json(rows || []));
});

app.post("/add-item", (req, res) => {
  const { name, desc, img, price, robuxLink, visaLink, quantity, rarity } = req.body;
  db.run(`INSERT INTO items (name, desc, img, price, robuxLink, visaLink, quantity, rarity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, desc, img, price, robuxLink, visaLink, quantity || 1, rarity || 'Common'],
    () => res.json({ success: true })
  );
});

app.post("/hold/:id", (req, res) => {
  db.run("UPDATE items SET quantity = quantity - 1 WHERE id = ?", req.params.id);
  res.json({ success: true });
});

app.post("/complete/:id", (req, res) => {
  db.run("DELETE FROM items WHERE id = ?", req.params.id);
  res.json({ success: true });
});

app.listen(process.env.PORT || 3000, () => console.log("✅ Ready"));
