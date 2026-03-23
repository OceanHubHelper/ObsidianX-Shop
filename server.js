const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(express.static(__dirname));
app.use(express.json());

const db = new sqlite3.Database("/data/brainrots.db", (err) => {
  if (err) console.error(err);
  else console.log("✅ Persistent DB ready");
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    desc TEXT,
    img TEXT,
    price TEXT NOT NULL,
    robuxLink TEXT,
    visaLink TEXT,
    status TEXT DEFAULT 'available'
  )`);
  // Starts completely empty - no samples
});

app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => res.json(rows || []));
});

app.post("/add-item", (req, res) => {
  const { name, desc, img, price, robuxLink, visaLink } = req.body;
  db.run(`INSERT INTO items (name, desc, img, price, robuxLink, visaLink) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, desc, img, price, robuxLink, visaLink], () => res.json({success: true}));
});

app.post("/hold/:id", (req, res) => {
  db.run("UPDATE items SET status = 'on-hold' WHERE id = ?", req.params.id, () => res.json({success: true}));
});

app.post("/complete/:id", (req, res) => {
  db.run("DELETE FROM items WHERE id = ?", req.params.id, () => res.json({success: true, message: "✅ Transaction complete - item removed"}));
});

app.delete("/delete/:id", (req, res) => {
  db.run("DELETE FROM items WHERE id = ?", req.params.id, () => res.json({success: true}));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🖤 ObsidianX with full payment flow running"));
