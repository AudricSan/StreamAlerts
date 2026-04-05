<?php
// ============================================================
//  StreamAlerts — health/index.php
//  Diagnostic local : vérifie que l'installation est opérationnelle.
//
//  URL : http://localhost/StreamAlerts/health/
//  URL JSON : http://localhost/StreamAlerts/health/?format=json
// ============================================================

header('Cache-Control: no-cache');

// ── Fichiers JSON attendus et leur criticité ─────────────────
// critical: true  → ROUGE si absent ou timestamp trop vieux
// ttl: null       → timestamp non vérifié (fichier statique)
// ttl: N          → alerte si timestamp > N secondes
$EXPECTED_FILES = [
    'config'          => ['critical' => true,  'ttl' => null,   'label' => 'Configuration overlay'],
    'visibility'      => ['critical' => false, 'ttl' => null,   'label' => 'Visibilité des zones'],
    'current-scene'   => ['critical' => false, 'ttl' => 30,     'label' => 'Scène OBS courante'],
    'alert'           => ['critical' => false, 'ttl' => null,   'label' => 'Dernière alerte'],
    'chat'            => ['critical' => false, 'ttl' => 120,    'label' => 'Chat (fallback polling)'],
    'last_follower'   => ['critical' => false, 'ttl' => null,   'label' => 'Dernier follower'],
    'last_subscriber' => ['critical' => false, 'ttl' => null,   'label' => 'Dernier sub'],
    'last_raid'       => ['critical' => false, 'ttl' => null,   'label' => 'Dernier raid'],
    'goal'            => ['critical' => false, 'ttl' => null,   'label' => 'Objectif / Goal'],
    'viewers'         => ['critical' => false, 'ttl' => 120,    'label' => 'Spectateurs'],
    'uptime'          => ['critical' => false, 'ttl' => 120,    'label' => 'Uptime stream'],
    'nowplaying'      => ['critical' => false, 'ttl' => null,   'label' => 'Musique en cours'],
    'session'         => ['critical' => false, 'ttl' => null,   'label' => 'Stats de session'],
    'countdown'       => ['critical' => false, 'ttl' => null,   'label' => 'Compte à rebours'],
    'subtrain'        => ['critical' => false, 'ttl' => null,   'label' => 'Sub Train'],
    'leaderboard'     => ['critical' => false, 'ttl' => null,   'label' => 'Classement'],
    'poll'            => ['critical' => false, 'ttl' => null,   'label' => 'Sondage Twitch'],
    'prediction'      => ['critical' => false, 'ttl' => null,   'label' => 'Prédiction Twitch'],
    'hypetrain'       => ['critical' => false, 'ttl' => null,   'label' => 'Hype Train'],
    'queue'           => ['critical' => false, 'ttl' => null,   'label' => 'Queue viewers'],
    'channel_info'    => ['critical' => false, 'ttl' => 300,    'label' => 'Infos chaîne'],
];

$DATA_DIR = realpath(__DIR__ . '/../overlay/data');

// ── Collecte des diagnostics ─────────────────────────────────

$now = time();
$checks = [];
$globalStatus = 'ok'; // ok | warn | error

// Vérification dossier data/
$dataDirOk = ($DATA_DIR !== false && is_dir($DATA_DIR) && is_readable($DATA_DIR));
if (!$dataDirOk) {
    $globalStatus = 'error';
}

// Vérification de chaque fichier JSON
foreach ($EXPECTED_FILES as $name => $meta) {
    $path   = $DATA_DIR . DIRECTORY_SEPARATOR . $name . '.json';
    $exists = file_exists($path);
    $status = 'ok';
    $detail = null;
    $tsAge  = null;
    $tsHuman = null;

    if (!$exists) {
        $status = $meta['critical'] ? 'error' : 'warn';
        $detail = 'Fichier absent';
    } else {
        $raw = @file_get_contents($path);
        $decoded = $raw !== false ? @json_decode($raw, true) : null;

        if ($decoded === null) {
            $status = 'warn';
            $detail = 'JSON invalide ou vide';
        } elseif ($meta['ttl'] !== null && isset($decoded['timestamp'])) {
            $ts = $decoded['timestamp'];
            // timestamp en millisecondes → secondes
            if ($ts > 1e10) $ts = intval($ts / 1000);
            $tsAge   = $now - $ts;
            $tsHuman = _humanAge($tsAge);
            if ($tsAge > $meta['ttl']) {
                $status = 'warn';
                $detail = 'Données vieilles de ' . $tsHuman;
            }
        }
    }

    if ($status === 'error' && $globalStatus !== 'error') $globalStatus = 'error';
    if ($status === 'warn'  && $globalStatus === 'ok')    $globalStatus = 'warn';

    $checks[$name] = [
        'label'   => $meta['label'],
        'exists'  => $exists,
        'status'  => $status,
        'detail'  => $detail,
        'tsAge'   => $tsAge,
        'tsHuman' => $tsHuman,
        'critical'=> $meta['critical'],
    ];
}

// ── Sortie JSON ───────────────────────────────────────────────
if (($_GET['format'] ?? '') === 'json') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status'     => $globalStatus,
        'dataDirOk'  => $dataDirOk,
        'dataDir'    => $DATA_DIR ?: null,
        'checks'     => $checks,
        'generatedAt'=> $now,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Sortie HTML ───────────────────────────────────────────────
header('Content-Type: text/html; charset=utf-8');

function _humanAge($seconds) {
    if ($seconds < 60)   return $seconds . 's';
    if ($seconds < 3600) return round($seconds / 60) . 'min';
    return round($seconds / 3600, 1) . 'h';
}

$colorMap = [
    'ok'    => ['bg' => '#1a2a1a', 'border' => '#2ECC71', 'text' => '#2ECC71', 'icon' => '✓'],
    'warn'  => ['bg' => '#2a2518', 'border' => '#F39C12', 'text' => '#F39C12', 'icon' => '⚠'],
    'error' => ['bg' => '#2a1a1a', 'border' => '#E74C3C', 'text' => '#E74C3C', 'icon' => '✗'],
];
$globalColor = $colorMap[$globalStatus];
$globalLabel = ['ok' => 'Tout est opérationnel', 'warn' => 'Avertissements détectés', 'error' => 'Erreurs critiques'];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>StreamAlerts — Diagnostic</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0e1117;
      color: #c9d1d9;
      padding: 2rem;
      min-height: 100vh;
    }
    h1 {
      font-size: 1.4rem;
      font-weight: 700;
      color: #e6edf3;
      margin-bottom: 0.25rem;
    }
    .subtitle {
      font-size: 0.82rem;
      color: #6e7681;
      margin-bottom: 1.5rem;
    }
    .banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.9rem 1.2rem;
      border-radius: 8px;
      border: 1px solid <?= $globalColor['border'] ?>;
      background: <?= $globalColor['bg'] ?>;
      color: <?= $globalColor['text'] ?>;
      font-weight: 700;
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }
    .banner .icon { font-size: 1.3rem; }
    .section-title {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #6e7681;
      margin-bottom: 0.6rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 0.6rem;
      margin-bottom: 2rem;
    }
    .check-card {
      border-radius: 6px;
      border: 1px solid;
      padding: 0.65rem 0.9rem;
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
    }
    .check-card.ok    { border-color: #21262d; background: #161b22; }
    .check-card.warn  { border-color: #9e6a03; background: #1f1800; }
    .check-card.error { border-color: #6e1c1c; background: #1f0000; }
    .check-icon {
      font-size: 0.9rem;
      margin-top: 1px;
      min-width: 16px;
      text-align: center;
    }
    .check-icon.ok    { color: #3fb950; }
    .check-icon.warn  { color: #d29922; }
    .check-icon.error { color: #f85149; }
    .check-body { flex: 1; }
    .check-label { font-size: 0.82rem; font-weight: 600; color: #c9d1d9; }
    .check-name  { font-size: 0.72rem; color: #6e7681; font-family: 'Consolas', monospace; }
    .check-detail {
      font-size: 0.72rem;
      margin-top: 0.15rem;
    }
    .check-detail.warn  { color: #d29922; }
    .check-detail.error { color: #f85149; }
    .check-detail.ok    { color: #3fb950; }
    .dir-card {
      border-radius: 6px;
      border: 1px solid;
      padding: 0.65rem 0.9rem;
      margin-bottom: 1.5rem;
      font-size: 0.82rem;
    }
    .dir-card.ok    { border-color: #21262d; background: #161b22; }
    .dir-card.error { border-color: #6e1c1c; background: #1f0000; }
    .dir-card strong { font-family: 'Consolas', monospace; }
    .links {
      font-size: 0.78rem;
      color: #6e7681;
    }
    .links a { color: #58a6ff; text-decoration: none; }
    .links a:hover { text-decoration: underline; }
    .ts { font-size: 0.68rem; color: #6e7681; }
  </style>
</head>
<body>
  <h1>StreamAlerts — Diagnostic</h1>
  <p class="subtitle">Vérification locale de l'installation · <a href="?format=json" style="color:#58a6ff">JSON</a></p>

  <div class="banner">
    <span class="icon"><?= $globalColor['icon'] ?></span>
    <span><?= htmlspecialchars($globalLabel[$globalStatus]) ?></span>
  </div>

  <!-- Dossier data/ -->
  <p class="section-title">Infrastructure</p>
  <div class="dir-card <?= $dataDirOk ? 'ok' : 'error' ?>">
    <?php if ($dataDirOk): ?>
      <span style="color:#3fb950">✓</span> Dossier <strong>overlay/data/</strong> accessible
      <?php if ($DATA_DIR): ?><br><span class="ts"><?= htmlspecialchars($DATA_DIR) ?></span><?php endif; ?>
    <?php else: ?>
      <span style="color:#f85149">✗</span> Dossier <strong>overlay/data/</strong> introuvable ou inaccessible
    <?php endif; ?>
  </div>

  <!-- Fichiers JSON -->
  <p class="section-title">Fichiers JSON (<?= count($checks) ?>)</p>
  <div class="grid">
    <?php foreach ($checks as $name => $c): ?>
    <div class="check-card <?= $c['status'] ?>">
      <div class="check-icon <?= $c['status'] ?>">
        <?php
          if ($c['status'] === 'ok')    echo '✓';
          elseif ($c['status'] === 'warn')  echo '⚠';
          else echo '✗';
        ?>
      </div>
      <div class="check-body">
        <div class="check-label"><?= htmlspecialchars($c['label']) ?><?= $c['critical'] ? ' <span style="color:#f85149;font-size:.65rem">CRITIQUE</span>' : '' ?></div>
        <div class="check-name"><?= htmlspecialchars($name) ?>.json</div>
        <?php if ($c['detail']): ?>
          <div class="check-detail <?= $c['status'] ?>"><?= htmlspecialchars($c['detail']) ?></div>
        <?php elseif ($c['tsHuman']): ?>
          <div class="check-detail ok">Mis à jour il y a <?= htmlspecialchars($c['tsHuman']) ?></div>
        <?php endif; ?>
      </div>
    </div>
    <?php endforeach; ?>
  </div>

  <div class="links">
    Overlay : <a href="/StreamAlerts/overlay/">http://localhost/StreamAlerts/overlay/</a> &nbsp;·&nbsp;
    Config : <a href="/StreamAlerts/config/">http://localhost/StreamAlerts/config/</a> &nbsp;·&nbsp;
    Généré à <?= date('H:i:s') ?>
  </div>
</body>
</html>
