const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.static(__dirname));
app.use(express.json()); // so we can send JSON from frontend

const ITEMS_FILE = "items.json";

// load or create items
let items = [];
if (fs.existsSync(ITEMS_FILE)) {
  items = JSON.parse(fs.readFileSync(ITEMS_FILE));
} else {
  // sample brainrots
  items = [
    { id: 1, name: "Sigma Skibidi Pack", desc: "500+ sigma edits + rizz sounds", img: "https://picsum.photos/id/237/300/200", price: "399 Robux", type: "robux" },
    { id: 2, name: "Ohio Visa Brainrot", desc: "Prepaid $20 visa + full brainrot bundle", img: "https://picsum.photos/id/201/300/200", price: "$15", type: "visa" },
    { id: 3, name: "Fanum Tax Rizzler", desc: "Limited 1-of-1 voice changer pack", img: "https://picsum.photos/id/180/300/200", price: "299 Robux", type: "robux" }
  ];
  saveItems();
}

function saveItems() {
  fs.writeFileSync(ITEMS_FILE, JSON.stringify(items, null, 2));
}

// API
app.get("/items", (req, res) => res.json(items));

app.post("/add-item", (req, res) => {
  const newItem = { id: Date.now(), ...req.body };
  items.unshift(newItem);
  saveItems();
  res.json({ success: true });
});

app.delete("/delete/:id", (req, res) => {
  items = items.filter(i => i.id != req.params.id);
  saveItems();
  res.json({ success: true });
});

app.post("/confirm-buy/:id", (req, res) => {
  items = items.filter(i => i.id != req.params.id); // delete after confirmed purchase
  saveItems();
  res.json({ success: true, message: "✅ Brainrot sold & removed!" });
});

app.listen(3000, () => console.log("🖤 ObsidianX Store running → http://localhost:3000"));
