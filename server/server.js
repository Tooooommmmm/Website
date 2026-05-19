require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const menuStore = require('./github-menu');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);


if (process.env.GITHUB_TOKEN && (!process.env.GITHUB_OWNER || !process.env.GITHUB_REPO)) {
  console.warn('WARNUNG: GITHUB_TOKEN gesetzt, aber GITHUB_OWNER oder GITHUB_REPO fehlt – Menü wird nur lokal gespeichert.');
}

function validateMenuPayload(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Ungültige Daten' };
  }

  const calendarWeek = Number(body.calendarWeek);
  const year = Number(body.year);

  if (!Number.isInteger(calendarWeek) || calendarWeek < 1 || calendarWeek > 54) {
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

app.get('/api/menu', async (req, res) => {
  try {
    const menu = await menuStore.readMenu();
    res.json(menu);
  } catch (error) {
    console.error('Menü lesen fehlgeschlagen:', error.message);
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

app.put('/api/menu', authMiddleware, async (req, res) => {
  const validation = validateMenuPayload(req.body);

  if (!validation.ok) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const saved = await menuStore.writeMenu(validation.data);
    res.json(saved);
  } catch (error) {
    console.error('Menü speichern fehlgeschlagen:', error.message);
    const message =
      error.status === 401 || error.status === 403
        ? 'GitHub-Zugriff verweigert. Token und Repository-Rechte prüfen.'
        : 'Menü konnte nicht gespeichert werden';
    res.status(500).json({ error: message });
  }
});

app.get('/admin', (req, res) => {
  res.redirect('/admin/');
});

app.listen(PORT, () => {
  const storage = menuStore.useGitHub()
    ? 'GitHub (' + process.env.GITHUB_OWNER + '/' + process.env.GITHUB_REPO + ')'
    : 'lokale Datei data/menu.json';
  console.log('Menü-Speicher: ' + storage);
  console.log('Server läuft auf http://localhost:' + PORT);
  console.log('Admin: http://localhost:' + PORT + '/admin/');
});
