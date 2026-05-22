// Fun fact of the day — single language at a time (toggle to switch),
// with a read-aloud button.

(async function () {
  var container = document.getElementById('fact-content');
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
    var text = dataCache.fact[lang] || dataCache.fact.de;

    container.innerHTML =
      '<div class="fact-card">' +
        '<div class="fact-icon">💡</div>' +
        '<p class="fact-text">' + escapeHtml(text) + '</p>' +
        '<button class="speak-btn-big" aria-label="' + t('Hör zu', 'Listen') + '">' +
          '🔊 ' + t('Hör zu', 'Listen') +
        '</button>' +
      '</div>';

    container.querySelector('.speak-btn-big').addEventListener('click', function () {
      window.BearTTS.speak(text, lang);
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
