(function () {
  function getMenuUrl() {
    const api = window.SITE_CONFIG && window.SITE_CONFIG.menuApiUrl;
    if (api) {
      return api.replace(/\/$/, '') + '/api/menu';
    }
    return 'data/menu.json';
  }

  function formatDateDE(isoDate) {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    return parts[2] + '.' + parts[1] + '.' + parts[0];
  }

  function renderMenu(data) {
    const weekEl = document.querySelector('.menu-plan-week');
    const gridEl = document.getElementById('menu-plan-grid');

    if (!weekEl || !gridEl) return;

    const kw = data.calendarWeek;
    const year = data.year;
    weekEl.textContent = kw && year ? 'KW ' + kw + ' / ' + year : 'Aktuelle Woche';

    gridEl.innerHTML = '';

    const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
    const days = Array.isArray(data.days) ? data.days : [];
    const list = days.filter(function (day) {
      return weekdays.includes(day.name) && day.menu && String(day.menu).trim() !== '';
    });

    list.forEach(function (day) {
      const card = document.createElement('article');
      card.className = 'day-menu-card';

      const title = document.createElement('h3');
      const dateLabel = formatDateDE(day.date);
      title.textContent = day.name + (dateLabel ? ', ' + dateLabel : '');

      const content = document.createElement('p');
      content.className = 'day-menu-content';
      content.textContent = (day.menu && day.menu.trim()) ? day.menu.trim() : 'Kein Menü eingetragen';

      card.appendChild(title);
      card.appendChild(content);
      gridEl.appendChild(card);
    });

    if (list.length === 0) {
      gridEl.innerHTML = '<p class="menu-plan-empty">Der Menüplan wird in Kürze veröffentlicht.</p>';
    }
  }

  function loadMenu() {
    return fetch(getMenuUrl(), { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('Menü konnte nicht geladen werden');
        return res.json();
      })
      .then(renderMenu)
      .catch(function () {
        const gridEl = document.getElementById('menu-plan-grid');
        if (gridEl) {
          gridEl.innerHTML = '<p class="menu-plan-empty">Menüplan momentan nicht verfügbar.</p>';
        }
      });
  }

  document.addEventListener('DOMContentLoaded', loadMenu);

  window.reloadPublicMenu = loadMenu;
})();
