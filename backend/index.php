<?php
// ============================================================
// FIN-GAP RWANDA — API Router (Entry Point)
// Compatible with PHP built-in dev server
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Strip leading slash and "api" prefix if present
$route = trim(preg_replace('#^/?api/?#', '', $path), '/');
$method = $_SERVER['REQUEST_METHOD'];

// Route dispatcher
switch (true) {

    // GET /national-summary or /api/national-summary
    case $route === 'national-summary' && $method === 'GET':
        require_once __DIR__ . '/api/national_summary.php';
        break;

    // GET /districts/{id}
    case preg_match('#^districts/(\d+)$#', $route, $matches) && $method === 'GET':
        $_GET['id'] = $matches[1];
        require_once __DIR__ . '/api/district.php';
        break;

    // GET /districts
    case $route === 'districts' && $method === 'GET':
        require_once __DIR__ . '/api/districts.php';
        break;

    // POST /simulate
    case $route === 'simulate' && $method === 'POST':
        require_once __DIR__ . '/api/simulate.php';
        break;

    // Root health check
    case $route === '' || $route === 'api':
        echo json_encode([
            'success' => true,
            'message' => 'FIN-GAP RWANDA API is running',
            'endpoints' => [
                'GET  /api/districts',
                'GET  /api/districts/{id}',
                'GET  /api/national-summary',
                'POST /api/simulate',
            ]
        ]);
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Endpoint not found: ' . $route
        ]);
        break;
}
