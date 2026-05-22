// Tile router for kid home screens.
// Real features route to their page; tiles without a route still show a
// "coming soon" toast and keep the tile--coming visual marker.

(function () {
  var FEATURE_ROUTES = {
    word: 'word.html',
    fact: 'fact.html',
    news: 'news.html',
    schedule: 'schedule.html',
    emergency: 'emergency.html',
    sudoku: 'sudoku.html'
    // videos: 'videos.html' — task #8
  };

  function ctaLabel() {
    return (document.documentElement.lang || 'de') === 'en' ? 'Öffnen' : 'Öffnen';
  }
  function ctaLabelLocalized(lang) {
    return lang === 'en' ? 'Open' : 'Öffnen';
  }

  function profile() {
    var main = document.querySelector('main');
    return (main && main.dataset.profile) || 'noa';
  }

  function showToast(feature) {
    var lang = document.documentElement.lang || 'de';
    var msg = lang === 'en'
      ? 'Coming soon: ' + feature
      : 'Kommt bald: ' + feature;
    var toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = [
      'position:fixed', 'bottom:1.5rem', 'left:50%', 'transform:translateX(-50%)',
      'background:#2D2A26', 'color:#FAF6F0', 'padding:0.75rem 1.25rem',
      'border-radius:999px', 'font-size:0.95rem', 'box-shadow:0 4px 12px rgba(0,0,0,0.15)',
      'z-index:1000', 'opacity:0', 'transition:opacity 0.2s ease'
    ].join(';');
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.style.opacity = '1'; });
    setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () { toast.remove(); }, 250);
    }, 1800);
  }

  function refreshTileStates() {
    var lang = document.documentElement.lang || 'de';
    document.querySelectorAll('.tile').forEach(function (tile) {
      var feature = tile.dataset.feature;
      var hasRoute = !!FEATURE_ROUTES[feature];
      tile.classList.toggle('tile--coming', !hasRoute);
      var cta = tile.querySelector('.tile-cta');
      if (cta) {
        if (hasRoute) {
          cta.textContent = ctaLabelLocalized(lang);
        } else {
          cta.textContent = lang === 'en' ? 'Coming soon' : 'Bald verfügbar';
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.tile').forEach(function (tile) {
      tile.addEventListener('click', function () {
        var feature = tile.dataset.feature;
        var route = FEATURE_ROUTES[feature];
        if (route) {
          window.location.href = route + '?profile=' + profile();
        } else {
          showToast(feature);
        }
      });
    });
    refreshTileStates();
    window.addEventListener('bearagent:langchanged', refreshTileStates);
  });
})();
