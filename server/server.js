require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');
const MENU_FILE = path.join(ROOT, 'data', 'menu.json');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || 'get-from-render';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

if (!ADMIN_PASSWORD || ADMIN_PASSWORD === 'bitte-ein-sicheres-passwort-setzen') {
  console.warn('WARNUNG: Bitte ADMIN_PASSWORD in server/.env setzen.');
}

function readMenu() {
  const raw = fs.readFileSync(MENU_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeMenu(data) {
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(MENU_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function validateMenuPayload(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Ungültige Daten' };
  }

  const calendarWeek = Number(body.calendarWeek);
  const year = Number(body.year);

  if (!Number.isInteger(calendarWeek) || calendarWeek < 1 || calendarWeek > 53) {
    return { ok: false, error: 'Kalenderwoche muss zwischen 1 und 53 liegen' };
  }

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return { ok: false, error: 'Jahr ist ungültig' };
  }

  if (!Array.isArray(body.days) || body.days.length !== 5) {
    return { ok: false, error: 'Es müssen genau 5 Tage (Montag–Freitag) übermittelt werden' };
  }

  const dayNames = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
  const days = body.days.map((day, index) => ({
    name: dayNames[index],
    date: String(day.date || '').trim(),
    menu: String(day.menu || '').trim()
  }));

  for (const day of days) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date)) {
      return { ok: false, error: 'Datum für ' + day.name + ' ist ungültig (YYYY-MM-DD)' };
    }
  }

  return {
    ok: true,
    data: {
      calendarWeek,
      year,
      weekStart: days[0].date,
      days
    }
  };
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Nicht angemeldet' });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Sitzung abgelaufen, bitte erneut anmelden' });
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.static(ROOT));

app.get('/api/menu', (req, res) => {
  try {
    res.json(readMenu());
  } catch {
    res.status(500).json({ error: 'Menü konnte nicht gelesen werden' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Benutzername oder Passwort falsch' });
  }

  const token = jwt.sign({ role: 'admin', sub: username }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

app.get('/api/auth/check', authMiddleware, (req, res) => {
  res.json({ ok: true });
});

app.put('/api/menu', authMiddleware, (req, res) => {
  const validation = validateMenuPayload(req.body);

  if (!validation.ok) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    writeMenu(validation.data);
    res.json(validation.data);
  } catch {
    res.status(500).json({ error: 'Menü konnte nicht gespeichert werden' });
  }
});

app.get('/admin', (req, res) => {
  res.redirect('/admin/');
});

app.listen(PORT, () => {
  console.log('Server läuft auf http://localhost:' + PORT);
  console.log('Admin: http://localhost:' + PORT + '/admin/');
});
