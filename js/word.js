// Word of the day — bilingual side-by-side regardless of UI language (per PRD).
// Nina variant hides the meaning + example (picture-led, big word + sound).

(async function () {
  var container = document.getElementById('word-content');
  var dataCache = null;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function render() {
    if (!dataCache) return;
    var profile = window.BearProfile;
    var isLittle = profile === 'nina';
    var de = dataCache.word.de;
    var en = dataCache.word.en;

    var html = '<div class="word-cards' + (isLittle ? ' word-cards--big' : '') + '">';
    html += '<div class="word-card">';
    html += '<div class="word-flag">🇩🇪</div>';
    html += '<h2 class="word-big">' + escapeHtml(de.word) + '</h2>';
    html += '<button class="speak-btn" data-text="' + escapeHtml(de.word) + '" data-lang="de" aria-label="Hör zu">🔊</button>';
    if (!isLittle) {
      html += '<p class="word-meaning">' + escapeHtml(de.meaning) + '</p>';
      html += '<p class="word-example">„' + escapeHtml(de.example) + '"</p>';
    }
    html += '</div>';

    html += '<div class="word-card">';
    html += '<div class="word-flag">🇬🇧</div>';
    html += '<h2 class="word-big">' + escapeHtml(en.word) + '</h2>';
    html += '<button class="speak-btn" data-text="' + escapeHtml(en.word) + '" data-lang="en" aria-label="Listen">🔊</button>';
    if (!isLittle) {
      html += '<p class="word-meaning">' + escapeHtml(en.meaning) + '</p>';
      html += '<p class="word-example">"' + escapeHtml(en.example) + '"</p>';
    }
    html += '</div>';
    html += '</div>';
    html += '<p class="date-note"><em>' + escapeHtml(dataCache.date || '') + '</em></p>';

    container.innerHTML = html;
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
    container.innerHTML = '<p class="error">Fehler / Error</p>';
  }
})();
