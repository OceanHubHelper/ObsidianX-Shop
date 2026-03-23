const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(express.static(__dirname));
app.use(express.json());

const db = new sqlite3.Database("/data/brainrots.db", (err) => {
  if (err) console.error("❌ DB error:", err);
  else console.log("✅ Connected to persistent /data/brainrots.db");
});

// Create table + samples (only once)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      desc TEXT,
      img TEXT,
      price TEXT NOT NULL,
      type TEXT NOT NULL
    )
  `);

  db.get("SELECT COUNT(*) as count FROM items", (err, row) => {
    if (row.count === 0) {
      const samples = [
        ["Sigma Skibidi Pack", "500+ sigma edits + rizz sounds", "https://picsum.photos/id/237/300/200", "399 Robux", "robux"],
        ["Ohio Visa Brainrot", "Prepaid $20 visa + full bundle", "https://picsum.photos/id/201/300/200", "$15", "visa"],
        ["Fanum Tax Rizzler", "Limited 1-of-1 voice pack", "https://picsum.photos/id/180/300/200", "299 Robux", "robux"]
      ];
      const stmt = db.prepare("INSERT INTO items (name, desc, img, price, type) VALUES (?, ?, ?, ?, ?)");
      samples.forEach(s => stmt.run(...s));
      stmt.finalize();
      console.log("📦 Added starter brainrots");
    }
  });
});

// Routes
app.get("/items", (req, res) => {
  db.all("SELECT * FROM items ORDER BY id DESC", [], (err, rows) => res.json(rows || []));
});

app.post("/add-item", (req, res) => {
  const { name, desc, img, price, type } = req.body;
  db.run("INSERT INTO items (name, desc, img, price, type) VALUES (?, ?, ?, ?, ?)",
    [name, desc || "", img || "https://picsum.photos/300/200", price, type],
    () => res.json({ success: true })
  );
});

app.delete("/delete/:id", (req, res) => {
  db.run("DELETE FROM items WHERE id = ?", req.params.id, () => res.json({ success: true }));
});

app.post("/confirm-buy/:id", (req, res) => {
  db.run("DELETE FROM items WHERE id = ?", req.params.id, () => res.json({ success: true, message: "✅ Sold & removed forever!" }));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🖤 ObsidianX live on port ${PORT} → Railway`));
