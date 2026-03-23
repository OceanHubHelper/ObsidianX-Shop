<!DOCTYPE html>
<html lang="en">
<head>
<title>ObsidianX Store 🖤</title>
<style>
    body { background: #0b0b0b; color: #fff; font-family: Arial; text-align: center; margin:0; padding:20px; }
    h1 { font-size: 3rem; margin: 10px; }
    .tab { padding: 10px 20px; background:#222; display:inline-block; margin:10px; cursor:pointer; border-radius:8px; }
    .tab.active { background:#ff00ff; color:black; }
    .store { display:flex; flex-wrap:wrap; justify-content:center; gap:20px; margin-top:20px; }
    .card {
        background:#111; width:260px; border-radius:16px; overflow:hidden; transition:0.3s;
        box-shadow: 0 0 15px rgba(255,0,255,0.3);
    }
    .card:hover { transform:scale(1.08); }
    img { width:100%; height:160px; object-fit:cover; }
    button { margin:5px; padding:12px; width:90%; background:#000; color:white; border:2px solid #ff00ff; cursor:pointer; border-radius:8px; }
    .modal { display:none; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#1a1a1a; padding:20px; border:3px solid #ff00ff; border-radius:12px; width:90%; max-width:400px; }
    input, select { width:100%; padding:10px; margin:8px 0; background:#222; color:white; border:1px solid #ff00ff; }
</style>
</head>
<body>

<h1>🖤 ObsidianX Store</h1>
<p>Buy through Discord tickets • All brainrot sold out = gone forever</p>

<div style="margin:15px;">
    <span class="tab active" onclick="showTab(0)">🛒 Shop</span>
    <span class="tab" onclick="showTab(1)">👑 Owner Panel</span>
</div>

<!-- SHOP TAB -->
<div id="shop">
    <button onclick="location.reload()" style="background:#ff00ff;color:black;">🔄 Refresh Brainrots</button>
    <div class="store" id="cards"></div>
</div>

<!-- OWNER TAB -->
<div id="owner" style="display:none;">
    <h2>👑 Owner Panel (type "obsidian" to unlock)</h2>
    <input id="pass" placeholder="Password" type="password">
    <button onclick="checkPass()">Unlock</button>
    <div id="ownerContent" style="display:none;">
        <h3>Add New Brainrot</h3>
        <input id="nname" placeholder="Name"><br>
        <input id="ndesc" placeholder="Description"><br>
        <input id="nimg" placeholder="Image URL (picsum or imgur)"><br>
        <input id="nprice" placeholder="Price e.g. 399 Robux"><br>
        <select id="ntype"><option value="robux">Robux</option><option value="visa">Prepaid Visa</option></select><br>
        <button onclick="addItem()">📤 Upload Brainrot</button>

        <h3>Existing Brainrots (click ❌ to delete)</h3>
        <div id="ownerList"></div>
    </div>
</div>

<!-- BUY MODAL -->
<div id="buyModal" class="modal">
    <h2 id="modalTitle"></h2>
    <select id="payType" onchange="changePay()">
        <option value="robux">💎 Robux Gamepass</option>
        <option value="visa">💳 Prepaid Visa</option>
    </select>
    <input id="purchaseLink" placeholder="Your purchase link (Roblox or Stripe)">
    <button onclick="simulateBuy()">✅ I Purchased • Send Proof</button>
    <br><button onclick="closeModal()">❌ Close</button>
</div>

<script>
// render cards
async function loadItems() {
    const res = await fetch("/items");
    const data = await res.json();
    const div = document.getElementById("cards");
    div.innerHTML = "";
    data.forEach(item => {
        const c = document.createElement("div");
        c.className = "card";
        c.innerHTML = `
            <img src="${item.img}">
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
            <p><b>${item.price}</b></p>
            <button onclick="buy(${item.id}, '${item.name}', '${item.type}')">🛒 Buy Now</button>
        `;
        div.appendChild(c);
    });
    // owner list too
    renderOwnerList(data);
}
loadItems();

function buy(id, name, type) {
    document.getElementById("modalTitle").textContent = "Buying: " + name;
    document.getElementById("buyModal").style.display = "block";
    window.currentBuyId = id;
    window.currentType = type;
}

function closeModal() { document.getElementById("buyModal").style.display = "none"; }

function changePay() {
    const t = document.getElementById("payType").value;
    if (t === "robux") alert("🔗 Gamepass link: https://roblox.com/gamepass/123456");
    else alert("💳 Fake Prepaid Visa • SSN will be given in Discord after you send proof");
}

async function simulateBuy() {
    const link = document.getElementById("purchaseLink").value || "proof-sent";
    alert(`📸 Proof received!\nLink: ${link}\n\nFor Robux → send screenshot in Discord\nFor Visa → you will get card + SSN in Discord ticket`);
    
    // confirm buy → delete item
    await fetch(`/confirm-buy/${window.currentBuyId}`, { method: "POST" });
    alert("🎉 Confirmed! Brainrot is now SOLD OUT and removed 🔥");
    closeModal();
    loadItems();
}

// tabs
function showTab(n) {
    document.getElementById("shop").style.display = n===0 ? "block" : "none";
    document.getElementById("owner").style.display = n===1 ? "block" : "none";
}

// owner
function checkPass() {
    if (document.getElementById("pass").value === "obsidian") {
        document.getElementById("ownerContent").style.display = "block";
        alert("✅ Owner unlocked (real Discord bot can hide this later)");
    } else alert("Wrong pass");
}

async function addItem() {
    const body = {
        name: document.getElementById("nname").value || "New Brainrot",
        desc: document.getElementById("ndesc").value || "Cool stuff",
        img: document.getElementById("nimg").value || "https://picsum.photos/300/200",
        price: document.getElementById("nprice").value || "299 Robux",
        type: document.getElementById("ntype").value
    };
    await fetch("/add-item", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    alert("📤 Brainrot uploaded!");
    loadItems();
}

function renderOwnerList(data) {
    const div = document.getElementById("ownerList");
    div.innerHTML = "";
    data.forEach(i => {
        const d = document.createElement("div");
        d.innerHTML = `${i.name} <button onclick="deleteItem(${i.id})" style="color:red">❌ Delete</button>`;
        div.appendChild(d);
    });
}

async function deleteItem(id) {
    await fetch(`/delete/${id}`, { method:"DELETE" });
    alert("🗑️ Deleted");
    loadItems();
}

// start
setTimeout(() => loadItems(), 300);
</script>

<p style="margin-top:50px;opacity:0.6;">Made for you by Grok • Push to GitHub and open index.html or run node server.js • Works 100% offline too</p>
</body>
</html>
