'use strict';

/* ============================================================
   components/goals.js — Goal Tracker
   Expose : window.Goals  (étend BaseComponent)
   Zone   : #zone-goal   Données : data/goal.json
   Test   : touche G
   ============================================================ */

var _GOAL_COLORS = {
  sub:      { color: '#F1C40F', rgb: '241, 196, 15' },
  follow:   { color: '#9B59B6', rgb: '155, 89, 182' },
  bits:     { color: '#00BCD4', rgb: '0, 188, 212'  },
  donation: { color: '#2ECC71', rgb: '46, 204, 113' },
  custom:   { color: '#3498DB', rgb: '52, 152, 219' },
};

class GoalsComponent extends BaseComponent {
  constructor() {
    super({
      name:         'goal',
      zoneId:       'zone-goal',
      dataFile:     'goal.json',
      pollInterval: 2000,
      testKey:      'g',
    });
  }

  test() {
    this.onData({ label: 'Objectif subs', current: 47, target: 100, type: 'sub', timestamp: Date.now() });
  }

  onData(data) {
    if (!data || !data.timestamp) { this.clear(); return; }

    var cfg     = _GOAL_COLORS[data.type] || _GOAL_COLORS.custom;
    var current = data.current != null ? data.current : 0;
    var target  = data.target  != null ? data.target  : 1;
    var ratio   = Math.min(1, Math.max(0, current / (target || 1)));
    var pct     = Math.round(ratio * 100);

    this.zone.innerHTML =
      '<div class="goal-card" style="--goal-color:' + cfg.color + ';--goal-color-rgb:' + cfg.rgb + ';">' +
        '<div class="goal-accent"></div>' +
        '<div class="goal-inner">' +
          '<div class="goal-header">' +
            '<span class="goal-label">'  + esc(data.label || labelFor('goal').toUpperCase()) + '</span>' +
            '<span class="goal-count">'  + esc(current) + '<span class="goal-sep">/</span>' + esc(target) + '</span>' +
          '</div>' +
          '<div class="goal-bar-track">' +
            '<div class="goal-bar-fill" style="width:' + pct + '%"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
}

window.Goals = new GoalsComponent();
