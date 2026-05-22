// Daily Sudoku — generates a deterministic 9x9 puzzle seeded by today's
// UTC date so every device sees the same puzzle. No network calls.
//
// Generation strategy:
//   1. Start from a known-valid base grid.
//   2. Shuffle rows/cols within bands and digits using a seeded PRNG.
//   3. Remove cells to a target count based on difficulty.
//
// "Easy" target: 45 clues. "Medium": 36 clues.

(function () {
  // -------- seeded PRNG (Mulberry32) --------
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = seed;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function seedFromDate(d) {
    // Day-of-year as a stable int seed.
    var y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
    return y * 10000 + (m + 1) * 100 + day;
  }
  function shuffle(arr, rng) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  // -------- grid construction --------
  function basePattern(r, c) {
    // Classic Sudoku base pattern.
    return (3 * (r % 3) + Math.floor(r / 3) + c) % 9;
  }
  function buildGrid(rng) {
    var bands = shuffle([0,1,2], rng);
    var rowsInBand = bands.map(function () { return shuffle([0,1,2], rng); });
    var stacks = shuffle([0,1,2], rng);
    var colsInStack = stacks.map(function () { return shuffle([0,1,2], rng); });
    var digits = shuffle([1,2,3,4,5,6,7,8,9], rng);

    var grid = [];
    for (var bi = 0; bi < 3; bi++) {
      for (var ri = 0; ri < 3; ri++) {
        var rowIdx = bands[bi] * 3 + rowsInBand[bi][ri];
        var row = [];
        for (var si = 0; si < 3; si++) {
          for (var ci = 0; ci < 3; ci++) {
            var colIdx = stacks[si] * 3 + colsInStack[si][ci];
            row.push(digits[basePattern(rowIdx, colIdx)]);
          }
        }
        grid.push(row);
      }
    }
    return grid;
  }
  function makePuzzle(solution, rng, targetClues) {
    var puzzle = solution.map(function (row) { return row.slice(); });
    var cells = [];
    for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) cells.push([r, c]);
    shuffle(cells, rng);
    var toRemove = 81 - targetClues;
    for (var i = 0; i < toRemove && i < cells.length; i++) {
      puzzle[cells[i][0]][cells[i][1]] = 0;
    }
    return puzzle;
  }

  // -------- rendering --------
  var board, solution, puzzle, selected = null;
  var difficulty = 'easy';
  var TARGETS = { easy: 45, medium: 36 };

  function generate() {
    var rng = mulberry32(seedFromDate(new Date()) ^ (difficulty === 'easy' ? 1 : 2));
    solution = buildGrid(rng);
    puzzle = makePuzzle(solution, rng, TARGETS[difficulty]);
    renderBoard();
    updateStatus('');
  }

  function renderBoard() {
    board.innerHTML = '';
    for (var r = 0; r < 9; r++) {
      for (var c = 0; c < 9; c++) {
        var cell = document.createElement('button');
        cell.className = 'sudoku-cell';
        if (c % 3 === 2 && c !== 8) cell.classList.add('sudoku-cell--rborder');
        if (r % 3 === 2 && r !== 8) cell.classList.add('sudoku-cell--bborder');
        var v = puzzle[r][c];
        if (v !== 0) {
          cell.textContent = v;
          cell.classList.add('sudoku-cell--given');
          cell.disabled = false;
          cell.dataset.given = '1';
        } else {
          cell.textContent = '';
        }
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener('click', function (e) {
          selectCell(e.currentTarget);
        });
        board.appendChild(cell);
      }
    }
  }

  function selectCell(cell) {
    document.querySelectorAll('.sudoku-cell--selected').forEach(function (el) {
      el.classList.remove('sudoku-cell--selected');
    });
    cell.classList.add('sudoku-cell--selected');
    selected = cell;
  }

  function placeDigit(d) {
    if (!selected || selected.dataset.given === '1') return;
    var r = +selected.dataset.row, c = +selected.dataset.col;
    if (d === 0) {
      selected.textContent = '';
      puzzle[r][c] = 0;
      selected.classList.remove('sudoku-cell--wrong');
    } else {
      selected.textContent = d;
      puzzle[r][c] = d;
      selected.classList.toggle('sudoku-cell--wrong', d !== solution[r][c]);
    }
    checkWin();
  }

  function checkWin() {
    for (var r = 0; r < 9; r++)
      for (var c = 0; c < 9; c++)
        if (puzzle[r][c] !== solution[r][c]) return;
    var lang = document.documentElement.lang || 'de';
    updateStatus(lang === 'en' ? '🎉 Solved!' : '🎉 Gelöst!');
  }

  function updateStatus(msg) {
    var s = document.getElementById('sudoku-status');
    if (s) s.textContent = msg;
  }

  function renderKeypad() {
    var pad = document.getElementById('sudoku-pad');
    pad.innerHTML = '';
    for (var i = 1; i <= 9; i++) {
      (function (d) {
        var btn = document.createElement('button');
        btn.className = 'sudoku-key';
        btn.textContent = d;
        btn.addEventListener('click', function () { placeDigit(d); });
        pad.appendChild(btn);
      })(i);
    }
    var erase = document.createElement('button');
    erase.className = 'sudoku-key sudoku-key--erase';
    erase.textContent = '⌫';
    erase.addEventListener('click', function () { placeDigit(0); });
    pad.appendChild(erase);
  }

  document.addEventListener('DOMContentLoaded', function () {
    board = document.getElementById('sudoku-board');
    renderKeypad();
    generate();

    document.querySelectorAll('.sudoku-diff button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        difficulty = btn.dataset.diff;
        document.querySelectorAll('.sudoku-diff button').forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
        generate();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key >= '1' && e.key <= '9') placeDigit(parseInt(e.key, 10));
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') placeDigit(0);
    });

    window.addEventListener('bearagent:langchanged', function () {
      // Re-render only the status (board doesn't depend on language).
      updateStatus('');
    });
  });
})();
