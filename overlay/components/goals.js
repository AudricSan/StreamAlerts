'use strict';

/* ============================================================
   Composant : Goal Tracker
   Expose : window.Goals  →  { init() }
   Zone    : #zone-goal  |  Données : data/goal.json
   Test    : touche G
   ============================================================ */

const _GOAL_COLORS = {
  sub:      { color: '#F1C40F', rgb: '241, 196, 15'  },
  follow:   { color: '#9B59B6', rgb: '155, 89, 182'  },
  bits:     { color: '#00BCD4', rgb: '0, 188, 212'   },
  donation: { color: '#2ECC71', rgb: '46, 204, 113'  },
  custom:   { color: '#3498DB', rgb: '52, 152, 219'  },
};

class GoalsComponent extends BaseComponent {
  constructor() {
    super({
      name:         'goal',
      zoneId:       'zone-goal',
      dataFile:     'goal.json',
      pollInterval: 2000,
      testKey:      'g',
      testData:     [{ label: 'Objectif subs', current: 47, target: 100, type: 'sub', timestamp: 1 }],
    });
  }

  onData(data) {
    if (!data.timestamp) { this.clear(); return; }

    const cfg   = _GOAL_COLORS[data.type] || _GOAL_COLORS.custom;
    const ratio = Math.min(1, Math.max(0, (data.current || 0) / (data.target || 1)));
    const pct   = Math.round(ratio * 100);

    this.zone.innerHTML = `
      <div class="goal-card" style="--goal-color:${cfg.color};--goal-color-rgb:${cfg.rgb};">
        <div class="goal-accent"></div>
        <div class="goal-inner">
          <div class="goal-header">
            <span class="goal-label">${esc(data.label || 'OBJECTIF')}</span>
            <span class="goal-count">${data.current}<span class="goal-sep">/</span>${data.target}</span>
          </div>
          <div class="goal-bar-track">
            <div class="goal-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
      </div>
    `;
  }
}

window.Goals = new GoalsComponent();
