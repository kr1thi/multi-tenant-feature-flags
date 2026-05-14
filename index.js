const express = require('express');
const pool = require('./db'); // Unga db.js connection
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

/* middleware-auth check */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Token Missing" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    req.user = user;
    next();
  });
};

/*  SUPER ADMIN - login and org create */
app.post('/superadmin/login', (req, res) => {
  const { username, password } = req.body;
  // .env la irukura static credentials check
  if (username === process.env.SUPER_ADMIN_USER && password === process.env.SUPER_ADMIN_PASS) {
    const token = jwt.sign({ role: 'SUPER_ADMIN' }, JWT_SECRET);
    return res.json({ token });
  }
  res.status(401).json({ message: "Invalid Credentials" });
});


app.post('/org', authenticateToken, async (req, res) => {
  if (req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ message: "Super Admin only" });
  
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO organizations (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
  } catch (err) {
    
    console.error("DEBUG: Database Query Error ->", err); 
    res.status(500).json({ error: err.message });
  }
});
/*  ORG ADMIN - signup and login */
app.post('/admin/signup', async (req, res) => {
  const { username, password, orgId } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      'INSERT INTO users (username, password, role, org_id) VALUES ($1, $2, $3, $4)',
      [username, hashedPassword, 'ORG_ADMIN', orgId]
    );
    res.json({ message: "Org Admin Created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (user.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const validPass = await bcrypt.compare(password, user.rows[0].password);
    if (!validPass) return res.status(401).json({ message: "Invalid Password" });

    const token = jwt.sign({ id: user.rows[0].id, orgId: user.rows[0].org_id, role: 'ORG_ADMIN' }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*feature management(org admin only) */
app.post('/feature', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ORG_ADMIN') return res.status(403).json({ message: "Org Admins only" });
  
  const { key, enabled } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO feature_flags (flag_key, enabled, org_id) VALUES ($1, $2, $3) RETURNING *',
      [key, enabled || false, req.user.orgId] // Automatically scopes to admin's org
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Logic-Flag status-a toggle panna
app.put('/feature/toggle', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ORG_ADMIN') return res.status(403).json({ message: "Org Admins only" });

  const { key, enabled } = req.body;
  try {
    const result = await pool.query(
      'UPDATE feature_flags SET enabled = $1 WHERE flag_key = $2 AND org_id = $3 RETURNING *',
      [enabled, key, req.user.orgId] // Security: Admin's orgId a token la irunthu edukrom
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Flag not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Logic- Flag la permanent ah remove panna
app.delete('/feature/:key', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ORG_ADMIN') return res.status(403).json({ message: "Org Admins only" });

  const flagKey = req.params.key;
  try {
    const result = await pool.query(
      'DELETE FROM feature_flags WHERE flag_key = $1 AND org_id = $2 RETURNING *',
      [flagKey, req.user.orgId]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Flag not found or unauthorized" });
    res.json({ message: "Flag deleted successfully", deletedFlag: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* END USER: check feature */
app.get('/check', async (req, res) => {
  const { orgId, key } = req.query;
  try {
    const result = await pool.query(
      'SELECT enabled FROM feature_flags WHERE org_id = $1 AND flag_key = $2',
      [orgId, key]
    );
    if (result.rows.length === 0) return res.json({ enabled: false, message: "Not found" });
    res.json({ enabled: result.rows[0].enabled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));