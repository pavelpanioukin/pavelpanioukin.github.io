const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const ADMIN_PASSWORD = 'pavel2024';

const sessions = new Set();

app.use(express.json({ limit: '10mb' }));

// ── Auth helpers ──────────────────────────────────────────────────────────────

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function requireAuth(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.slice(7);
  if (!sessions.has(token)) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  next();
}

// ── Auth routes ───────────────────────────────────────────────────────────────

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const token = generateToken();
  sessions.add(token);
  res.json({ token });
});

app.post('/api/logout', requireAuth, (req, res) => {
  const token = req.headers['authorization'].slice(7);
  sessions.delete(token);
  res.json({ success: true });
});

// ── Data routes ───────────────────────────────────────────────────────────────

app.get('/api/data', (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    res.setHeader('Cache-Control', 'no-cache');
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Failed to read data.json:', err.message);
    res.status(500).json({ error: 'Failed to read data file' });
  }
});

app.put('/api/data', requireAuth, (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, message: 'Data saved successfully' });
  } catch (err) {
    console.error('Failed to write data.json:', err.message);
    res.status(500).json({ error: 'Failed to write data file' });
  }
});

// ── Root site files (mirrors what GitHub Pages serves statically) ─────────────

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});

// Serve data.json directly so the same relative fetch('data.json') works locally
app.get('/data.json', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, 'data.json'));
});

// Serve local images/assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ── Admin panel (local only — served from public/) ────────────────────────────

app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('');
  console.log(`  Portfolio   →  http://localhost:${PORT}`);
  console.log(`  Admin CMS   →  http://localhost:${PORT}/admin`);
  console.log(`  Password    →  pavel2024`);
  console.log('');
});
