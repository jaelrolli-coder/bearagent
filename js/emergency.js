// Emergency screen: render the emergency block from config.json,
// scoped to the current kid (for allergies).

(async function () {
  var container = document.getElementById('emergency-content');
  var configCache = null;

  function t(de, en) {
    var lang = document.documentElement.lang || 'de';
    return lang === 'en' ? en : de;
  }
  function val(v) {
    return v ? escapeHtml(v) : '<em class="muted">' + t('Nicht eingetragen', 'Not set') + '</em>';
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function render() {
    if (!configCache) return;
    var profile = window.BearProfile;
    var e = configCache.emergency || {};
    var ped = e.pediatrician || {};
    var doc = e.doctor || {};
    var ins = e.insurance || {};
    var allergies = (e.allergies && e.allergies[profile]) || [];
    var contacts = e.contacts || [];

    var html = '<div class="emergency-grid">';

    html += '<div class="emergency-card">';
    html += '<h3>' + t('Kinderarzt', 'Pediatrician') + '</h3>';
    html += '<p>' + val(ped.name) + '</p>';
    html += '<p class="big-number">' + val(ped.phone) + '</p>';
    html += '</div>';

    html += '<div class="emergency-card">';
    html += '<h3>' + t('Hausarzt', 'Family doctor') + '</h3>';
    html += '<p>' + val(doc.name) + '</p>';
    html += '<p class="big-number">' + val(doc.phone) + '</p>';
    html += '</div>';

    html += '<div class="emergency-card">';
    html += '<h3>' + t('Versicherung', 'Insurance') + '</h3>';
    html += '<p>' + val(ins.provider) + '</p>';
    html += '<p>' + val(ins.number) + '</p>';
    html += '</div>';

    html += '<div class="emergency-card ' + (allergies.length ? 'emergency-card--allergy' : '') + '">';
    html += '<h3>' + t('Allergien', 'Allergies') + ' — ' + (profile === 'nina' ? 'Nina' : 'Noa') + '</h3>';
    if (allergies.length) {
      html += '<ul>' + allergies.map(function (a) { return '<li>' + escapeHtml(a) + '</li>'; }).join('') + '</ul>';
    } else {
      html += '<p><em class="muted">' + t('Keine bekannt', 'None known') + '</em></p>';
    }
    html += '</div>';

    html += '<div class="emergency-card emergency-card--wide">';
    html += '<h3>' + t('Notfall-Nummern Schweiz', 'Emergency numbers (Switzerland)') + '</h3>';
    html += '<p class="big-number"><strong>112</strong> — ' + t('Allgemeiner Notruf (EU)', 'General emergency (EU)') + '</p>';
    html += '<p class="big-number"><strong>144</strong> — ' + t('Sanität / Ambulanz', 'Ambulance') + '</p>';
    html += '<p class="big-number"><strong>117</strong> — ' + t('Polizei', 'Police') + '</p>';
    html += '<p class="big-number"><strong>118</strong> — ' + t('Feuerwehr', 'Fire brigade') + '</p>';
    html += '<p class="big-number"><strong>145</strong> — ' + t('Tox-Info (Vergiftungen)', 'Poison helpline') + '</p>';
    html += '</div>';

    if (contacts.length) {
      html += '<div class="emergency-card emergency-card--wide">';
      html += '<h3>' + t('Kontakte', 'Contacts') + '</h3>';
      html += '<ul>' + contacts.map(function (c) {
        return '<li><strong>' + escapeHtml(c.name || '') + '</strong> — ' + escapeHtml(c.phone || '') + '</li>';
      }).join('') + '</ul>';
      html += '</div>';
    }

    html += '</div>';
    html += '<p class="empty-note"><em>' + t(
      'Tipp: Persönliche Notfall-Daten in config.json eintragen.',
      'Tip: Fill in personal emergency data in config.json.'
    ) + '</em></p>';

    container.innerHTML = html;
  }

  try {
    var res = await fetch('../config.json');
    configCache = await res.json();
    render();
    window.addEventListener('bearagent:langchanged', render);
  } catch (err) {
    container.innerHTML = '<p class="error">' + t('Fehler beim Laden', 'Error loading') + '</p>';
  }
})();
