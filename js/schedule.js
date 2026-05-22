// Today's schedule — reads content/schedule.json (hand-edited per PRD).
// Nina sees icon-only big cards; Noa sees time + icon + label.

(async function () {
  var container = document.getElementById('schedule-content');
  var dataCache = null;
  var DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

  function t(de, en) {
    var lang = document.documentElement.lang || 'de';
    return lang === 'en' ? en : de;
  }
  function dayName(idx) {
    var de = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
    var en = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return t(de[idx], en[idx]);
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function render() {
    if (!dataCache) return;
    var profile = window.BearProfile;
    var lang = document.documentElement.lang || 'de';
    var todayIdx = new Date().getDay();
    var todayKey = DAYS[todayIdx];
    var events = ((dataCache[profile] || {}).weekly || {})[todayKey] || [];

    var html = '<h2 class="schedule-day">' + dayName(todayIdx) + '</h2>';

    if (events.length === 0) {
      html += '<p class="empty-note">' + t(
        'Heute steht nichts im Kalender. 🎉',
        'Nothing on the calendar today. 🎉'
      ) + '</p>';
    } else {
      var isLittle = profile === 'nina';
      html += '<ul class="schedule-list' + (isLittle ? ' schedule-list--big' : '') + '">';
      events.forEach(function (ev) {
        html += '<li class="schedule-item">';
        html += '<span class="schedule-icon">' + (ev.icon || '📌') + '</span>';
        if (!isLittle) {
          html += '<span class="schedule-time">' + escapeHtml(ev.time || '') + '</span>';
        }
        html += '<span class="schedule-label">' + escapeHtml(ev[lang] || ev.de || '') + '</span>';
        html += '</li>';
      });
      html += '</ul>';
    }

    html += '<p class="empty-note"><em>' + t(
      'Wochenplan in content/schedule.json bearbeiten.',
      'Edit the weekly schedule in content/schedule.json.'
    ) + '</em></p>';

    container.innerHTML = html;
  }

  try {
    var res = await fetch('../content/schedule.json');
    dataCache = await res.json();
    render();
    window.addEventListener('bearagent:langchanged', render);
  } catch (err) {
    container.innerHTML = '<p class="error">' + t('Fehler', 'Error') + '</p>';
  }
})();
