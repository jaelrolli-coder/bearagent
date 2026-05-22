// Profile picker — remembers last selection and routes to the kid page.
// Parent override is a stub until task A11 wires the real PIN flow.

(function () {
  document.querySelectorAll('.profile').forEach(function (el) {
    el.addEventListener('click', function () {
      localStorage.setItem('bearagent.lastProfile', el.dataset.profile);
    });
  });

  var corner = document.querySelector('.parent-corner');
  if (corner) {
    corner.addEventListener('click', function () {
      // Placeholder. The real flow is long-press → PIN → admin screen.
      alert('Eltern-Menü kommt bald. (PIN-gesichert.)\n\nParent menu coming soon. (PIN protected.)');
    });
  }
})();
