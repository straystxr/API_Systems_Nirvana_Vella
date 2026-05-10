<?php

header("Access-Control-Allow-Origin: http://localhost:8100");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Content-Type: application/json');

echo json_encode([
    "index_working" => true,
    "path" => $_SERVER['REQUEST_URI']
]);

exit;


// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); exit; 
}

require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/auth.php'; // adjust path if auth.php is elsewhere

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($path) {
    case '/API_Systems_Nirvana_Vella/flashpoint-api/api/auth/login':
        authLogin($_SERVER['REQUEST_METHOD']);
        break;

    default:
        http_response_code(404);
        echo json_encode([
            "error" => "Not found",
            "path" => $path
        ]);
}

// ─── SIMPLE ROUTER ────────────────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Strip any base path before /api
$uri    = preg_replace('#^.*/api#', '/api', $uri);
$uri    = rtrim($uri, '/');

// Split path into segments
$seg = explode('/', trim($uri, '/'));
// e.g. ['api','auth','login'] or ['api','news','42','verify'] 

if (($seg[0] ?? '') !== 'api') {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
    exit;
}

$resource  = $seg[1] ?? '';   // news | auth | users | events | journalism
$subA      = $seg[2] ?? '';   // id or sub-resource
$subB      = $seg[3] ?? '';   // action  e.g. verify | comments | report

switch ($resource) {

    // ── AUTH ──────────────────────────────────────────────────────────────────
    case 'auth':
        require_once __DIR__ . '/api/auth/auth.php';
        handleAuth($method, $subA);
        break;

    // ── NEWS ──────────────────────────────────────────────────────────────────
    case 'news':
        require_once __DIR__ . '/api/news/news.php';
        handleNews($method, $subA, $subB);
        break;

    // ── USERS ─────────────────────────────────────────────────────────────────
    case 'users':
        require_once __DIR__ . '/api/users/users.php';
        handleUsers($method, $subA, $subB);
        break;

    // ── EVENTS ───────────────────────────────────────────────────────────────
    case 'events':
        require_once __DIR__ . '/api/events/events.php';
        handleEvents($method, $subA);
        break;

    // ── JOURNALISM ────────────────────────────────────────────────────────────
    case 'journalism':
        require_once __DIR__ . '/api/journalism/journalism.php';
        handleJournalism($method, $subA);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
}