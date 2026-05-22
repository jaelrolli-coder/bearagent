// Parent override mode.
//
// Trigger: long-press (1s) on the .parent-corner button OR triple-click it.
// PIN flow:
//   - First time:  prompt to CREATE a 4-digit PIN; stored as SHA-256 hash in
//                  localStorage (per device). config.json may carry a default
//                  hash that's checked if no local one is set.
//   - Subsequent:  prompt to ENTER PIN; on match, show admin panel.
//
// Admin panel actions (v1):
//   - Reset Noa / Nina video timer
//   - Add a video to a kid's per-device whitelist (extends videos.js add UX)
//   - Show "current state": today's used video time per kid
//   - Change the PIN
//   - Quick links to GitHub edit URLs for config.json + whitelists (for
//     edits that need to persist across devices)

(function () {
  var STORAGE_KEY = 'bearagent.pinHash';
  var corner = document.querySelector('.parent-corner');
  if (!corner) return;

  var pressTimer = null;
  var clickCount = 0;
  var clickResetTimer = null;
  var config = null;

  // ---------- hashing ----------
  async function sha256Hex(text) {
    var buf = new TextEncoder().encode(text);
    var hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  function getStoredHash() {
    return localStorage.getItem(STORAGE_KEY) || (config && config.parent && config.parent.pinHash) || '';
  }
  function saveHash(hash) {
    localStorage.setItem(STORAGE_KEY, hash);
  }

  // ---------- UI ----------
  function makeOverlay() {
    var existing = document.getElementById('parent-overlay');
    if (existing) return existing;
    var o = document.createElement('div');
    o.id = 'parent-overlay';
    o.className = 'parent-overlay';
    o.innerHTML = '<div class="parent-modal"></div>';
    o.addEventListener('click', function (e) { if (e.target === o) close(); });
    document.body.appendChild(o);
    return o;
  }
  function close() {
    var o = document.getElementById('parent-overlay');
    if (o) o.remove();
  }
  function lang() { return document.documentElement.lang || 'de'; }
  function t(de, en) { return lang() === 'en' ? en : de; }

  // ---------- PIN entry / creation ----------
  function showPinScreen(mode) {
    // mode: 'enter' | 'create' | 'change'
    var overlay = makeOverlay();
    var modal = overlay.querySelector('.parent-modal');
    var title = mode === 'enter'
      ? t('PIN eingeben', 'Enter PIN')
      : mode === 'create'
        ? t('PIN festlegen', 'Set PIN')
        : t('Neuer PIN', 'New PIN');

    modal.innerHTML =
      '<button class="parent-close" aria-label="Close">×</button>' +
      '<h2>🐾 ' + title + '</h2>' +
      '<div class="pin-dots">' +
        '<span class="pin-dot"></span><span class="pin-dot"></span>' +
        '<span class="pin-dot"></span><span class="pin-dot"></span>' +
      '</div>' +
      '<div class="pin-pad"></div>' +
      '<p class="pin-error" id="pin-error"></p>';

    var pad = modal.querySelector('.pin-pad');
    var keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
    keys.forEach(function (k) {
      var b = document.createElement('button');
      b.className = 'pin-key';
      b.textContent = k;
      if (!k) b.style.visibility = 'hidden';
      b.addEventListener('click', function () { handleKey(k, mode); });
      pad.appendChild(b);
    });

    modal.querySelector('.parent-close').addEventListener('click', close);

    window._pinBuffer = '';
    updateDots();
  }

  function updateDots() {
    var dots = document.querySelectorAll('.pin-dot');
    dots.forEach(function (d, i) {
      d.classList.toggle('pin-dot--filled', i < window._pinBuffer.length);
    });
  }
  function showError(msg) {
    var e = document.getElementById('pin-error');
    if (e) { e.textContent = msg; setTimeout(function () { if (e) e.textContent = ''; }, 2500); }
  }

  async function handleKey(k, mode) {
    if (k === '⌫') {
      window._pinBuffer = window._pinBuffer.slice(0, -1);
    } else if (k && window._pinBuffer.length < 4) {
      window._pinBuffer += k;
    }
    updateDots();
    if (window._pinBuffer.length !== 4) return;

    var entered = window._pinBuffer;
    window._pinBuffer = '';

    if (mode === 'enter') {
      var h = await sha256Hex(entered);
      if (h === getStoredHash()) {
        showAdminPanel();
      } else {
        showError(t('Falscher PIN', 'Wrong PIN'));
        updateDots();
      }
    } else {
      // create or change: confirm by re-entering
      if (!window._pinFirst) {
        window._pinFirst = entered;
        showError(t('Nochmals zur Bestätigung', 'Once more to confirm'));
        updateDots();
      } else {
        if (window._pinFirst === entered) {
          var hash = await sha256Hex(entered);
          saveHash(hash);
          window._pinFirst = null;
          showAdminPanel(t('PIN gesetzt ✓', 'PIN set ✓'));
        } else {
          window._pinFirst = null;
          showError(t('Stimmt nicht. Nochmal.', 'Did not match. Try again.'));
          updateDots();
        }
      }
    }
  }

  // ---------- Admin panel ----------
  function formatMin(seconds) {
    var m = Math.floor(seconds / 60);
    return m + ' min';
  }
  function timerStateFor(profile) {
    try {
      var raw = localStorage.getItem('bearagent.timer.' + profile);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function showAdminPanel(flash) {
    var overlay = makeOverlay();
    var modal = overlay.querySelector('.parent-modal');
    modal.classList.add('parent-modal--admin');

    var noaState = timerStateFor('noa');
    var ninaState = timerStateFor('nina');

    function row(profile, state) {
      var used = state ? state.usedSeconds : 0;
      var budget = state ? state.budgetSeconds : 0;
      var label = profile === 'noa' ? 'Noa' : 'Nina';
      return '<div class="admin-row">' +
        '<div><strong>' + label + '</strong> — ' +
          t('Heute verwendet', 'Used today') + ': ' + formatMin(used) +
          (budget ? ' / ' + formatMin(budget) : '') +
        '</div>' +
        '<button class="admin-btn" data-action="reset-' + profile + '">' +
          t('Reset', 'Reset') + '</button>' +
      '</div>';
    }

    var repoBase = 'https://github.com/jaelrolli-coder/bearagent/edit/main';

    modal.innerHTML =
      '<button class="parent-close" aria-label="Close">×</button>' +
      '<h2>🐾 ' + t('Eltern-Menü', 'Parent menu') + '</h2>' +
      (flash ? '<p class="admin-flash">' + flash + '</p>' : '') +

      '<h3>' + t('Video-Timer', 'Video timer') + '</h3>' +
      row('noa', noaState) +
      row('nina', ninaState) +

      '<h3>' + t('Auf diesem Gerät', 'On this device') + '</h3>' +
      '<div class="admin-row">' +
        '<button class="admin-btn admin-btn--wide" data-action="change-pin">' +
          t('PIN ändern', 'Change PIN') +
        '</button>' +
      '</div>' +

      '<h3>' + t('Gerätübergreifend (GitHub)', 'Cross-device (GitHub)') + '</h3>' +
      '<p class="admin-hint">' + t(
        'Änderungen für alle Geräte bearbeitest du im Repo:',
        'Edits that persist across devices go via the repo:'
      ) + '</p>' +
      '<div class="admin-links">' +
        '<a href="' + repoBase + '/content/whitelist-noa.json" target="_blank" rel="noopener">whitelist-noa.json</a>' +
        '<a href="' + repoBase + '/content/whitelist-nina.json" target="_blank" rel="noopener">whitelist-nina.json</a>' +
        '<a href="' + repoBase + '/content/schedule.json" target="_blank" rel="noopener">schedule.json</a>' +
        '<a href="' + repoBase + '/config.json" target="_blank" rel="noopener">config.json (allergies, doctor…)</a>' +
      '</div>';

    modal.querySelector('.parent-close').addEventListener('click', close);
    modal.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var a = btn.dataset.action;
        if (a === 'reset-noa' || a === 'reset-nina') {
          var profile = a.slice(6);
          localStorage.removeItem('bearagent.timer.' + profile);
          showAdminPanel(t(
            'Timer für ' + (profile === 'noa' ? 'Noa' : 'Nina') + ' zurückgesetzt ✓',
            "Timer reset for " + (profile === 'noa' ? 'Noa' : 'Nina') + ' ✓'
          ));
        } else if (a === 'change-pin') {
          showPinScreen('change');
        }
      });
    });
  }

  // ---------- Trigger detection ----------
  function startPress() {
    pressTimer = setTimeout(function () {
      pressTimer = null;
      trigger();
    }, 1000);
  }
  function cancelPress() {
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
  }
  function trigger() {
    if (getStoredHash()) {
      showPinScreen('enter');
    } else {
      showPinScreen('create');
    }
  }

  // Long-press
  corner.addEventListener('mousedown', startPress);
  corner.addEventListener('mouseup', cancelPress);
  corner.addEventListener('mouseleave', cancelPress);
  corner.addEventListener('touchstart', startPress, { passive: true });
  corner.addEventListener('touchend', cancelPress);
  corner.addEventListener('touchcancel', cancelPress);

  // Triple-click fallback (for mouse users who don't want to hold)
  corner.addEventListener('click', function (e) {
    e.preventDefault();
    clickCount++;
    clearTimeout(clickResetTimer);
    clickResetTimer = setTimeout(function () { clickCount = 0; }, 600);
    if (clickCount >= 3) {
      clickCount = 0;
      trigger();
    }
  });

  // Load config (for fallback PIN hash)
  fetch('config.json').then(function (r) { return r.json(); }).then(function (c) { config = c; }).catch(function () {});
})();
