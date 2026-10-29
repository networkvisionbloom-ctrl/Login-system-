const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "gpr_studio_secret_2026_super_strong"; // এটা পরে Change করে দিও
let users = []; // আপাতত এখানেই save থাকবে, পরে Database লাগাবো

// SIGNUP API
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if(users.find(u => u.email === email)) return res.json({ error: "User already exists" });
  
  const hash = await bcrypt.hash(password, 10);
  users.push({ id: Date.now(), email, password_hash: hash });
  res.json({ message: "Signup Success!" });
});

// LOGIN API
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if(!user) return res.json({ error: "User not found" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if(!ok) return res.json({ error: "Wrong password" });

  const token = jwt.sign({ email: user.email, id: user.id }, SECRET, { expiresIn: '7d' });
  res.json({ message: "Login Success!", token });
});

// Token Check API - তোমাদের সব App এটা দিয়ে চেক করবে
app.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);
    res.json({ user: decoded });
  } catch { res.json({ error: "Invalid token" }); }
});

app.get('/', (req, res) => res.send("GPR Auth Server is Running!"));

app.listen(10000, () => console.log("Server running on 10000"));
