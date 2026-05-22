// Tiny per-page language toggle. Reads `.i18n` elements with data-de/data-en
// and swaps their visible text. Persists choice in localStorage.
// Dispatches `bearagent:langchanged` so feature scripts can re-render.

(function () {
  function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('.i18n').forEach(function (el) {
      var text = el.dataset[lang];
      if (text) el.textContent = text;
    });
    document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    localStorage.setItem('bearagent.lang', lang);
    window.dispatchEvent(new CustomEvent('bearagent:langchanged', { detail: lang }));
  }

  document.addEventListener('DOMContentLoaded', function () {
    var saved = localStorage.getItem('bearagent.lang') || 'de';
    setLanguage(saved);
    document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
      btn.addEventListener('click', function () { setLanguage(btn.dataset.lang); });
    });
  });
})();
