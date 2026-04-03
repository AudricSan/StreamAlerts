<?php
// ============================================================
//  StreamAlerts — config/api.php
//  API locale pour lire et écrire les fichiers JSON de l'overlay.
//  Utilisée par la page de configuration (OBS Dock).
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache');

// Seuls ces fichiers sont accessibles en lecture/écriture
const ALLOWED = [
    'alert', 'chat', 'config',
    'goal', 'subtrain', 'nowplaying', 'queue',
    'last_follower', 'last_subscriber',
    'visibility',
    'viewers', 'uptime', 'session', 'countdown',
    'leaderboard', 'poll', 'prediction', 'hypetrain',
];

$DATA_DIR = realpath(__DIR__ . '/../overlay/data');
$file     = preg_replace('/[^a-z_]/', '', strtolower($_GET['file'] ?? ''));
$action   = $_GET['action'] ?? 'read';

if (!in_array($file, ALLOWED)) {
    http_response_code(400);
    echo json_encode(['error' => 'fichier non autorisé']);
    exit;
}

$path = $DATA_DIR . DIRECTORY_SEPARATOR . $file . '.json';

// ── GET : lecture ────────────────────────────────────────────
if ($action === 'read') {
    echo file_exists($path) ? file_get_contents($path) : '{}';

// ── POST : écriture ──────────────────────────────────────────
} elseif ($action === 'write' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw);

    if ($data === null) {
        http_response_code(400);
        echo json_encode(['error' => 'JSON invalide : ' . json_last_error_msg()]);
        exit;
    }

    $written = file_put_contents(
        $path,
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
    );

    if ($written !== false) {
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'impossible d\'écrire le fichier']);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'méthode non supportée']);
}
