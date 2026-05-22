// Per-kid daily video timer.
// State is keyed by profile+UTC-date in localStorage so reloads can't reset
// the count; midnight UTC starts a fresh budget.
//
// Public API:
//   BearTimer.init(profile, budgetMinutes) -> state
//   BearTimer.startTick()  // begin decrementing
//   BearTimer.stopTick()   // pause decrementing
//   BearTimer.remainingSeconds()
//   BearTimer.isExhausted()
//   BearTimer.reset()  // parent override only
//   BearTimer.onTick(fn) / onExhausted(fn)

window.BearTimer = (function () {
  var state = null;
  var interval = null;
  var tickHandlers = [];
  var exhaustHandlers = [];

  function todayUTC() {
    return new Date().toISOString().slice(0, 10);
  }
  function key(profile) {
    return 'bearagent.timer.' + profile;
  }
  function load(profile, budgetMinutes) {
    var raw = localStorage.getItem(key(profile));
    var today = todayUTC();
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (parsed.date === today && parsed.budgetSeconds === budgetMinutes * 60) {
          return parsed;
        }
      } catch (e) { /* fall through */ }
    }
    return { date: today, profile: profile, usedSeconds: 0, budgetSeconds: budgetMinutes * 60 };
  }
  function save() {
    localStorage.setItem(key(state.profile), JSON.stringify(state));
  }

  return {
    init: function (profile, budgetMinutes) {
      state = load(profile, budgetMinutes);
      save();
      return state;
    },
    startTick: function () {
      if (interval || !state) return;
      interval = setInterval(function () {
        if (state.usedSeconds >= state.budgetSeconds) {
          this.stopTick();
          exhaustHandlers.forEach(function (fn) { fn(); });
          return;
        }
        state.usedSeconds++;
        save();
        tickHandlers.forEach(function (fn) { fn(state); });
        if (state.usedSeconds >= state.budgetSeconds) {
          clearInterval(interval); interval = null;
          exhaustHandlers.forEach(function (fn) { fn(); });
        }
      }.bind(this), 1000);
    },
    stopTick: function () {
      if (interval) { clearInterval(interval); interval = null; }
    },
    remainingSeconds: function () {
      return Math.max(0, state.budgetSeconds - state.usedSeconds);
    },
    isExhausted: function () {
      return state.usedSeconds >= state.budgetSeconds;
    },
    reset: function () {
      if (!state) return;
      state.usedSeconds = 0;
      save();
      tickHandlers.forEach(function (fn) { fn(state); });
    },
    onTick: function (fn) { tickHandlers.push(fn); },
    onExhausted: function (fn) { exhaustHandlers.push(fn); },
    getState: function () { return state; }
  };
})();
