const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(express.static(__dirname));
app.use(express.json());

const db = new sqlite3.Database("./brainrots.db", (err) => {
  if (err) console.error("DB error:", err);
  else console.log("Connected to brainrots.db");
});

// Create table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      desc TEXT,
      img TEXT,
      price TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('robux', 'visa'))
    )
  `);

  // Optional: insert sample data only if table is empty
  db.get("SELECT COUNT(*) as count FROM items", (err, row) => {
    if (row.count === 0) {
      const samples = [
        ["Sigma Skibidi Pack", "500+ sigma edits + rizz sounds", "https://picsum.photos/id/237/300/200", "399 Robux", "robux"],
        ["Ohio Visa Brainrot", "Prepaid $20 visa + full brainrot bundle", "https://picsum.photos/id/201/300/200", "$15", "visa"],
        ["Fanum Tax Rizzler", "Limited 1-of-1 voice changer pack", "https://picsum.photos/id/180/300/200", "299 Robux", "robux"]
      ];
      const stmt = db.prepare("INSERT INTO items (name, desc, img, price, type) VALUES (?, ?, ?, ?, ?)");
      samples.forEach(s => stmt.run(...s));
      stmt.finalize();
      console.log("Added sample brainrots");
    }
  });
});

// Routes
app.get("/items", (req, res) => {
  db.all("SELECT * FROM
