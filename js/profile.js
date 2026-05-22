// Shared per-feature setup: figure out which kid is using this page,
// wire the back link to their home, and apply the nina layout variant.

(function () {
  var url = new URL(window.location.href);
  window.BearProfile = url.searchParams.get('profile')
    || localStorage.getItem('bearagent.lastProfile')
    || 'noa';

  document.addEventListener('DOMContentLoaded', function () {
    var back = document.querySelector('[data-back-to-kid]');
    if (back) back.href = window.BearProfile + '.html';
    document.body.dataset.profile = window.BearProfile;
    if (window.BearProfile === 'nina') {
      var main = document.querySelector('main');
      if (main) main.classList.add('kid-page--nina');
    }
  });
})();
