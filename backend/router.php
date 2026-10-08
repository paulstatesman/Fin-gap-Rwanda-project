<?php
// PHP Built-in server router script
// This file MUST be passed as the router script: php -S localhost:8000 router.php
// It rewrites ALL requests to index.php for SPA-style routing

if (php_sapi_name() === 'cli-server') {
    // Serve real static files if they exist
    if (is_file(__DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH))) {
        return false;
    }
}

// All other requests → main API router
require_once __DIR__ . '/index.php';
