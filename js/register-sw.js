// Register the service worker for offline support + "Add to Home Screen".
// Failure is silent — the site works fine without it.

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/bearagent/sw.js', { scope: '/bearagent/' })
      .catch(function (err) { console.warn('SW registration failed:', err); });
  });
}
