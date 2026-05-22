// Placeholder tile handler. Each tile currently shows a "coming soon" toast.
// Real handlers land per feature task (A2 videos, A3 sudoku, etc).

(function () {
  document.querySelectorAll('.tile').forEach(function (tile) {
    tile.addEventListener('click', function () {
      var feature = tile.dataset.feature || 'feature';
      var lang = document.documentElement.lang || 'de';
      var msg = lang === 'en'
        ? 'This is coming soon: ' + feature
        : 'Diese Funktion kommt bald: ' + feature;
      // Tiny inline toast rather than a blocking alert
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
    });
  });
})();
