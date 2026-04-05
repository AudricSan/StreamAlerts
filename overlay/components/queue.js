'use strict';

/* ============================================================
   components/queue.js — File d'attente viewers
   Expose : window.Queue  (étend BaseComponent)
   Zone   : #zone-queue   Données : data/queue.json
   Test   : touche U
   ============================================================ */

class QueueComponent extends BaseComponent {
  constructor() {
    super({
      name:         'queue',
      zoneId:       'zone-queue',
      dataFile:     'queue.json',
      pollInterval: 1000,
      testKey:      'u',
    });
    this._maxVisible = 8;
  }

  setup(cfg) {
    this._maxVisible = cfg.maxVisible || 8;
  }

  test() {
    this.onData({
      isOpen:  true,
      entries: [
        { user: 'GamerPro99'    },
        { user: 'FanAcharné'    },
        { user: 'SubFidèle'     },
        { user: 'NouveauJoueur' },
      ],
      timestamp: Date.now(),
    });
  }

  onData(data) {
    if (!data) return;
    var hasContent = data.isOpen || (data.entries && data.entries.length > 0);
    if (!hasContent) { this.clear(); return; }

    var all     = data.entries || [];
    var visible = all.slice(0, this._maxVisible);
    var more    = all.length - this._maxVisible;

    var statusCls   = data.isOpen ? 'queue-open' : 'queue-closed';
    var statusLabel = data.isOpen ? 'OUVERTE'    : 'FERM\u00C9E';
    var totalHtml   = all.length > 0 ? '<span class="queue-total">' + all.length + '</span>' : '';

    var listHtml = '';
    if (visible.length > 0) {
      listHtml = '<div class="queue-list">';
      for (var i = 0; i < visible.length; i++) {
        var firstCls = i === 0 ? ' queue-first' : '';
        listHtml += '<div class="queue-entry' + firstCls + '">' +
          '<span class="queue-pos">'  + (i + 1)              + '</span>' +
          '<span class="queue-user">' + esc(visible[i].user) + '</span>' +
        '</div>';
      }
      if (more > 0) {
        listHtml += '<div class="queue-more">+' + more + ' autres</div>';
      }
      listHtml += '</div>';
    } else {
      listHtml = '<div class="queue-empty">Aucun joueur</div>';
    }

    this.zone.innerHTML =
      '<div class="queue-card">' +
        '<div class="queue-header">' +
          '<span class="queue-title">QUEUE</span>' +
          '<span class="queue-badge ' + statusCls + '">' + statusLabel + '</span>' +
          totalHtml +
        '</div>' +
        listHtml +
      '</div>';
  }
}

window.Queue = new QueueComponent();
