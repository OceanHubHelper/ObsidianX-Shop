const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(express.static(__dirname));
app.use(express.json());

const db = new sqlite3.Database("/data/brainrots.db");

db.serialize(() => {
  // Drop old table if it exists (safe - only runs once)
  db.run("DROP TABLE IF EXISTS items");

  // Create fresh table with ALL columns you need
  db.run(`CREATE TABLE items (
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

  console.log("Database table ready with all columns");
});

app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) {
      console.error("DB read error:", err);
      return res.status(500).json({ error: "Server issue" });
    }
    console.log("Sending to client:", rows.length, "items");
    res.json(rows || []);
  });
});

app.post("/add-item", (req, res) => {
  const { name, desc, img, price, robuxLink, visaLink, quantity, rarity } = req.body;
  console.log("Trying to add:", name, price);
  db.run("INSERT INTO items (name, desc, img, price, robuxLink, visaLink, quantity, rarity) VALUES (?,?,?,?,?,?,?,?)",
    [name, desc, img, price, robuxLink, visaLink, quantity || 1, rarity || 'Common'],
    (err) => {
      if (err) {
        console.error("Add error:", err);
        return res.status(500).json({ error: "Save failed" });
      }
      console.log("Successfully added:", name);
      res.json({ success: true });
    }
  );
});

app.listen(process.env.PORT || 3000, () => console.log("✅ Shop running"));
