const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

// ── Multer (image uploads) ────────────────────────────────────────────────────

const ARTIFACTS_DIR = path.join(__dirname, 'assets', 'images', 'artifacts');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
    cb(null, ARTIFACTS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `artifact-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pavel2024';

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

// ── Artifact routes ───────────────────────────────────────────────────────────

app.post('/api/artifacts/upload', requireAuth, upload.single('image'), (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const artifact = {
      id: Date.now().toString(),
      url: `/assets/images/artifacts/${req.file.filename}`,
      alt: req.body.alt || 'Design artifact',
      size: req.body.size || 'small'
    };
    data.artifacts = data.artifacts || [];
    data.artifacts.push(artifact);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, artifact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/artifacts/:id', requireAuth, (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const artifact = (data.artifacts || []).find(a => a.id === req.params.id);
    if (!artifact) return res.status(404).json({ error: 'Not found' });
    // Delete the file (ignore errors for placeholders/missing files)
    const filePath = path.join(__dirname, artifact.url.replace(/^\//, ''));
    try { fs.unlinkSync(filePath); } catch {}
    data.artifacts = data.artifacts.filter(a => a.id !== req.params.id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/artifacts/:id/size', requireAuth, (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const artifact = (data.artifacts || []).find(a => a.id === req.params.id);
    if (!artifact) return res.status(404).json({ error: 'Not found' });
    artifact.size = artifact.size === 'large' ? 'small' : 'large';
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, size: artifact.size });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Deploy — commit data.json and push to GitHub ─────────────────────────────

app.post('/api/deploy', requireAuth, (req, res) => {
  const { execSync } = require('child_process');
  const message = (req.body && req.body.message) || 'Update content via admin';
  // Inherit the full shell environment so SSH agent + git credentials work
  const opts = { cwd: __dirname, env: process.env, stdio: 'pipe' };

  function run(cmd) {
    try {
      return execSync(cmd, opts).toString().trim();
    } catch (err) {
      const stderr = err.stderr ? err.stderr.toString().trim() : '';
      const stdout = err.stdout ? err.stdout.toString().trim() : '';
      throw new Error(stderr || stdout || err.message);
    }
  }

  try {
    run('git add data.json');
    const status = run('git status --porcelain data.json');
    if (!status) {
      return res.json({ success: true, message: 'Nothing to deploy — already up to date.' });
    }
    run(`git commit -m "${message.replace(/"/g, "'")}"`);
    run('git push origin main');
    res.json({ success: true, message: 'Deployed successfully.' });
  } catch (err) {
    console.error('Deploy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Root site files (mirrors what GitHub Pages serves statically) ─────────────

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/site.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'site.js'));
});

app.get('/animations.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'animations.js'));
});

app.get('/work.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'work.html'));
});

app.get('/feed.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'feed.html'));
});

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/project.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'project.html'));
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
