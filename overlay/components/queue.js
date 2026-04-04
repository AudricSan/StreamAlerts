'use strict';

/* ============================================================
   Composant : Queue Viewers
   Expose : window.Queue  →  { init() }
   Zone    : #zone-queue  |  Données : data/queue.json
   Test    : touche U
   ============================================================ */

class QueueComponent extends BaseComponent {
  constructor() {
    super({
      name:         'queue',
      zoneId:       'zone-queue',
      dataFile:     'queue.json',
      pollInterval: 1000,
      testKey:      'u',
      testData: [{
        isOpen:  true,
        entries: [
          { user: 'GamerPro99'    },
          { user: 'FanAcharné'    },
          { user: 'SubFidèle'     },
          { user: 'NouveauJoueur' },
        ],
        timestamp: 1,
      }],
    });
    this._maxVisible = 8;
  }

  setup(cfg) {
    this._maxVisible = cfg.maxVisible || 8;
  }

  onData(data) {
    const hasContent = data.isOpen || (data.entries && data.entries.length > 0);
    if (!hasContent) { this.clear(); return; }

    const all     = data.entries || [];
    const entries = all.slice(0, this._maxVisible);
    const more    = all.length - this._maxVisible;

    this.zone.innerHTML = `
      <div class="queue-card">
        <div class="queue-header">
          <span class="queue-title">QUEUE</span>
          <span class="queue-badge ${data.isOpen ? 'queue-open' : 'queue-closed'}">
            ${data.isOpen ? 'OUVERTE' : 'FERMÉE'}
          </span>
          ${all.length > 0 ? `<span class="queue-total">${all.length}</span>` : ''}
        </div>
        ${entries.length > 0 ? `
          <div class="queue-list">
            ${entries.map((e, i) => `
              <div class="queue-entry${i === 0 ? ' queue-first' : ''}">
                <span class="queue-pos">${i + 1}</span>
                <span class="queue-user">${esc(e.user)}</span>
              </div>
            `).join('')}
            ${more > 0 ? `<div class="queue-more">+${more} autres</div>` : ''}
          </div>
        ` : `<div class="queue-empty">Aucun joueur</div>`}
      </div>
    `;
  }
}

window.Queue = new QueueComponent();
