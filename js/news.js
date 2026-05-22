// Kids' news: one DE headline (logo!) + one EN headline (Newsround) per day.
// Both shown side-by-side; toggle highlights the active language.

(async function () {
  var container = document.getElementById('news-content');
  var dataCache = null;

  function t(de, en) {
    var lang = document.documentElement.lang || 'de';
    return lang === 'en' ? en : de;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function render() {
    if (!dataCache) return;
    var lang = document.documentElement.lang || 'de';
    var de = dataCache.news.de;
    var en = dataCache.news.en;

    function card(payload, cardLang) {
      var active = cardLang === lang ? ' news-card--active' : '';
      var flag = cardLang === 'de' ? '🇩🇪' : '🇬🇧';
      var html = '<article class="news-card' + active + '">';
      html += '<div class="news-flag">' + flag + '</div>';
      html += '<h3 class="news-headline">' + escapeHtml(payload.headline) + '</h3>';
      html += '<p class="news-source">' + escapeHtml(payload.source) + '</p>';
      html += '<button class="speak-btn" data-text="' + escapeHtml(payload.headline) + '" data-lang="' + cardLang + '" aria-label="' + t('Hör zu', 'Listen') + '">🔊</button>';
      if (payload.url) {
        html += '<a class="news-link" href="' + escapeHtml(payload.url) + '" target="_blank" rel="noopener">' + t('Mehr lesen', 'Read more') + ' →</a>';
      }
      html += '</article>';
      return html;
    }

    container.innerHTML =
      '<div class="news-grid">' + card(de, 'de') + card(en, 'en') + '</div>' +
      '<p class="empty-note"><em>' + t(
        'Schlagzeilen aus ZDF logo! und BBC Newsround. Aktualisierung folgt automatisch.',
        'Headlines from ZDF logo! and BBC Newsround. Automated updates coming soon.'
      ) + '</em></p>';

    container.querySelectorAll('.speak-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.BearTTS.speak(btn.dataset.text, btn.dataset.lang);
      });
    });
  }

  try {
    var res = await fetch('../content/today.json');
    dataCache = await res.json();
    render();
    window.addEventListener('bearagent:langchanged', render);
  } catch (err) {
    container.innerHTML = '<p class="error">' + t('Fehler', 'Error') + '</p>';
  }
})();
