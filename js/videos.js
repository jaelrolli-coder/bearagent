// Curated YouTube videos for the active kid, with a per-kid daily timer.
// Uses youtube-nocookie.com via the IFrame Player API. No related-videos
// sidebar (rel=0, modestbranding, iv_load_policy=3).

(function () {
  var profile = window.BearProfile;
  var grid = document.getElementById('videos-grid');
  var emptyState = document.getElementById('videos-empty');
  var playerSection = document.getElementById('videos-player');
  var pill = document.getElementById('timer-pill');
  var lockout = document.getElementById('videos-lockout');
  var addBtn = document.getElementById('add-video-btn');
  var ytPlayer = null;
  var ytApiReady = false;
  var pendingVideoId = null;
  var whitelist = [];
  var config = null;

  function t(de, en) {
    return (document.documentElement.lang || 'de') === 'en' ? en : de;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }
  function parseVideoId(input) {
    // Accept full URL, short URL, or bare ID.
    var s = String(input || '').trim();
    var m = s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
    return null;
  }
  function thumbUrl(id) {
    return 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg';
  }

  function fmtTime(s) {
    var m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function renderPill() {
    var rem = BearTimer.remainingSeconds();
    var min = Math.ceil(rem / 60);
    pill.textContent = '⏱ ' + min + ' ' + t('Min übrig', 'min left');
    pill.classList.toggle('timer-pill--low', rem <= 300);
    pill.classList.toggle('timer-pill--out', rem === 0);
  }

  function localAdditions() {
    try {
      var raw = localStorage.getItem('bearagent.localVideos.' + profile);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveLocalAdditions(arr) {
    localStorage.setItem('bearagent.localVideos.' + profile, JSON.stringify(arr));
  }

  function renderGrid() {
    var all = whitelist.concat(localAdditions());
    if (all.length === 0) {
      grid.innerHTML = '';
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;
    grid.innerHTML = all.map(function (v) {
      return '<button class="video-card" data-id="' + escapeHtml(v.id) + '">' +
        '<img class="video-thumb" src="' + thumbUrl(v.id) + '" alt="">' +
        '<div class="video-meta">' +
          '<h3 class="video-title">' + escapeHtml(v.title || v.id) + '</h3>' +
          (v.channel ? '<p class="video-channel">' + escapeHtml(v.channel) + '</p>' : '') +
        '</div>' +
      '</button>';
    }).join('');
    grid.querySelectorAll('.video-card').forEach(function (card) {
      card.addEventListener('click', function () {
        if (BearTimer.isExhausted()) return;
        playVideo(card.dataset.id);
      });
    });
  }

  function showGrid() {
    playerSection.hidden = true;
    grid.hidden = false;
    if (ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();
    BearTimer.stopTick();
  }

  function playVideo(id) {
    grid.hidden = true;
    playerSection.hidden = false;
    if (!ytApiReady) {
      pendingVideoId = id;
      return;
    }
    if (ytPlayer) {
      ytPlayer.loadVideoById(id);
    } else {
      createPlayer(id);
    }
  }

  function createPlayer(id) {
    ytPlayer = new YT.Player('ytplayer', {
      height: '390',
      width: '100%',
      videoId: id,
      host: 'https://www.youtube-nocookie.com',
      playerVars: {
        rel: 0,
        modestbranding: 1,
        controls: 1,
        iv_load_policy: 3,
        fs: 1,
        disablekb: 0,
        playsinline: 1
      },
      events: {
        onReady: function () { ytPlayer.playVideo(); },
        onStateChange: function (ev) {
          if (ev.data === YT.PlayerState.PLAYING) {
            BearTimer.startTick();
          } else {
            BearTimer.stopTick();
          }
        }
      }
    });
  }

  function showLockout() {
    lockout.hidden = false;
    showGrid();
  }

  function tryAddVideo() {
    var url = prompt(t(
      'YouTube-URL oder Video-ID einfügen:',
      'Paste YouTube URL or video ID:'
    ));
    if (!url) return;
    var id = parseVideoId(url);
    if (!id) {
      alert(t('Konnte keine YouTube-Video-ID erkennen.', "Couldn't parse a YouTube video ID."));
      return;
    }
    var title = prompt(t('Titel? (kurz)', 'Title? (short)')) || 'Untitled';
    var additions = localAdditions();
    additions.push({ id: id, title: title, channel: '', addedAt: new Date().toISOString().slice(0,10), local: true });
    saveLocalAdditions(additions);
    renderGrid();
    alert(t(
      'Hinzugefügt (nur auf diesem Gerät). Für alle Geräte: in content/whitelist-' + profile + '.json eintragen und committen.',
      'Added (this device only). To make it permanent across devices: add to content/whitelist-' + profile + '.json and commit.'
    ));
  }

  // YouTube IFrame API global callback
  window.onYouTubeIframeAPIReady = function () {
    ytApiReady = true;
    if (pendingVideoId) {
      var id = pendingVideoId; pendingVideoId = null;
      createPlayer(id);
    }
  };

  async function init() {
    try {
      var [cfgRes, wlRes] = await Promise.all([
        fetch('../config.json'),
        fetch('../content/whitelist-' + profile + '.json')
      ]);
      config = await cfgRes.json();
      var wl = await wlRes.json();
      whitelist = wl.videos || [];

      var budget = (config.profiles[profile] || {}).dailyVideoBudgetMinutes || 30;
      BearTimer.init(profile, budget);
      BearTimer.onTick(renderPill);
      BearTimer.onExhausted(showLockout);
      renderPill();
      if (BearTimer.isExhausted()) showLockout();
      renderGrid();

      // Load YouTube IFrame API once
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);

      document.getElementById('player-back').addEventListener('click', showGrid);
      addBtn.addEventListener('click', tryAddVideo);

      // Re-render on language change
      window.addEventListener('bearagent:langchanged', function () {
        renderPill();
      });
    } catch (err) {
      grid.innerHTML = '<p class="error">' + t('Fehler beim Laden', 'Error loading') + '</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
