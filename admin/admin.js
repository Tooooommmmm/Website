(function () {
  const DAY_NAMES = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
  const TOKEN_KEY = 'gasthaus_admin_token';

  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const loginForm = document.getElementById('login-form');
  const menuForm = document.getElementById('menu-form');
  const loginError = document.getElementById('login-error');
  const saveSuccess = document.getElementById('save-success');
  const saveError = document.getElementById('save-error');
  const adminDays = document.getElementById('admin-days');
  const logoutBtn = document.getElementById('logout-btn');
  const fillDatesBtn = document.getElementById('fill-dates-btn');

  function apiBase() {
    const configured = window.SITE_CONFIG && window.SITE_CONFIG.menuApiUrl;
    if (configured) return configured.replace(/\/$/, '');
    return '';
  }

  function apiUrl(path) {
    return apiBase() + path;
  }

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  function showLogin() {
    loginSection.hidden = false;
    dashboardSection.hidden = true;
  }

  function showDashboard() {
    loginSection.hidden = true;
    dashboardSection.hidden = false;
  }

  function showMessage(el, text) {
    el.textContent = text;
    el.hidden = false;
  }

  function hideMessage(el) {
    el.hidden = true;
    el.textContent = '';
  }

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken()
    };
  }

  function buildDayRows() {
    adminDays.innerHTML = '';
    DAY_NAMES.forEach(function (name, index) {
      const row = document.createElement('div');
      row.className = 'admin-day-row';
      row.innerHTML =
        '<label>' +
        name +
        '</label>' +
        '<div class="admin-day-fields">' +
        '<input type="date" data-day-date required aria-label="' +
        name +
        ' Datum">' +
        '<textarea data-day-menu rows="2" placeholder="Menü für ' +
        name +
        '"></textarea>' +
        '</div>';
      adminDays.appendChild(row);
    });
  }

  function addDaysToDate(isoDate, daysToAdd) {
    const date = new Date(isoDate + 'T12:00:00');
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().slice(0, 10);
  }

  function fillWeekDates() {
    const start = document.getElementById('week-start').value;
    if (!start) return;

    const dateInputs = adminDays.querySelectorAll('[data-day-date]');
    dateInputs.forEach(function (input, index) {
      input.value = addDaysToDate(start, index);
    });
  }

  function populateForm(data) {
    document.getElementById('calendar-week').value = data.calendarWeek || '';
    document.getElementById('calendar-year').value = data.year || '';
    document.getElementById('week-start').value = data.weekStart || (data.days && data.days[0] ? data.days[0].date : '');

    const dateInputs = adminDays.querySelectorAll('[data-day-date]');
    const menuInputs = adminDays.querySelectorAll('[data-day-menu]');

    DAY_NAMES.forEach(function (name, index) {
      const day = (data.days || []).find(function (d) {
        return d.name === name;
      });
      if (dateInputs[index]) dateInputs[index].value = day ? day.date || '' : '';
      if (menuInputs[index]) menuInputs[index].value = day ? day.menu || '' : '';
    });
  }

  function collectFormData() {
    const dateInputs = adminDays.querySelectorAll('[data-day-date]');
    const menuInputs = adminDays.querySelectorAll('[data-day-menu]');

    const days = DAY_NAMES.map(function (name, index) {
      return {
        name: name,
        date: dateInputs[index].value,
        menu: menuInputs[index].value.trim()
      };
    });

    return {
      calendarWeek: Number(document.getElementById('calendar-week').value),
      year: Number(document.getElementById('calendar-year').value),
      weekStart: days[0].date,
      days: days
    };
  }

  async function loadMenu() {
    const res = await fetch(apiUrl('/api/menu'), { cache: 'no-store' });
    if (!res.ok) throw new Error('Menü konnte nicht geladen werden');
    return res.json();
  }

  async function checkAuth() {
    const token = getToken();
    if (!token) {
      showLogin();
      return;
    }

    const res = await fetch(apiUrl('/api/auth/check'), {
      headers: { Authorization: 'Bearer ' + token }
    });

    if (!res.ok) {
      clearToken();
      showLogin();
      return;
    }

    showDashboard();
    const data = await loadMenu();
    populateForm(data);
  }

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideMessage(loginError);

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(apiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
      });

      const payload = await res.json().catch(function () {
        return {};
      });

      if (!res.ok) {
        showMessage(loginError, payload.error || 'Anmeldung fehlgeschlagen');
        return;
      }

      setToken(payload.token);
      showDashboard();
      hideMessage(loginError);
      const data = await loadMenu();
      populateForm(data);
    } catch {
      showMessage(loginError, 'Server nicht erreichbar. Bitte API starten oder menuApiUrl prüfen.');
    }
  });

  menuForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideMessage(saveSuccess);
    hideMessage(saveError);

    const payload = collectFormData();

    try {
      const res = await fetch(apiUrl('/api/menu'), {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });

      const body = await res.json().catch(function () {
        return {};
      });

      if (!res.ok) {
        showMessage(saveError, body.error || 'Speichern fehlgeschlagen');
        return;
      }

      populateForm(body);
      showMessage(saveSuccess, 'Menüplan wurde gespeichert und ist auf der Website sichtbar.');
    } catch {
      showMessage(saveError, 'Server nicht erreichbar. Speichern nicht möglich.');
    }
  });

  logoutBtn.addEventListener('click', function () {
    clearToken();
    showLogin();
    loginForm.reset();
  });

  fillDatesBtn.addEventListener('click', fillWeekDates);

  document.getElementById('week-start').addEventListener('change', fillWeekDates);

  buildDayRows();
  checkAuth();
})();
