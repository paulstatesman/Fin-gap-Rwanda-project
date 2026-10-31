<?php
// ============================================================
// FIN-GAP RWANDA — CORS Helper
// Centralised cross-origin policy for the PHP API (Render).
// Include this BEFORE any output in every entry point:
//     require_once __DIR__ . '/cors.php';        // backend root
//     require_once __DIR__ . '/../cors.php';     // backend/api/*
// ============================================================

if (!function_exists('applyCorsHeaders')) {
    /**
     * Emits the CORS headers and short-circuits OPTIONS preflight requests.
     */
    function applyCorsHeaders(): void
    {
        // Origins allowed by default (production + local dev).
        $allowedOrigins = [
            'https://fingap-rw.vercel.app',
            'http://localhost:3000',
            'http://localhost:5173',
        ];

        // Extend at runtime, e.g. CORS_ALLOWED_ORIGINS="https://a.com,https://b.com"
        $fromEnv = getenv('CORS_ALLOWED_ORIGINS');
        if ($fromEnv) {
            foreach (explode(',', $fromEnv) as $origin) {
                $origin = trim($origin);
                if ($origin !== '') {
                    $allowedOrigins[] = $origin;
                }
            }
        }

        // Vercel preview deployments for this project look like
        // https://fingap-rw-<hash>-<team>.vercel.app
        $previewPattern = '#^https://fingap-rw[a-z0-9-]*\.vercel\.app$#i';

        $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $originAllowed = in_array($requestOrigin, $allowedOrigins, true)
            || ($requestOrigin !== '' && preg_match($previewPattern, $requestOrigin) === 1);

        // Echo the matched origin back (never "*") so the policy can be tightened later.
        if ($originAllowed) {
            header('Access-Control-Allow-Origin: ' . $requestOrigin);
            header('Vary: Origin');
        }

        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
        header('Access-Control-Max-Age: 86400');
        header('Content-Type: application/json; charset=UTF-8');

        // Answer the browser preflight immediately, before any routing/DB work.
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}

applyCorsHeaders();
