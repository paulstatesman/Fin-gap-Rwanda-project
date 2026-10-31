<?php
// ============================================================
// FIN-GAP RWANDA — Database Configuration
// PostgreSQL connection via PDO (Supports both DATABASE_URL & Individual Variables)
// ============================================================

define('DB_HOST',     getenv('DB_HOST')     ?: 'localhost');
define('DB_PORT',     getenv('DB_PORT')     ?: '5432');
define('DB_NAME',     getenv('DB_NAME')     ?: 'fingap_rwanda');
define('DB_USER',     getenv('DB_USER')     ?: 'postgres');
define('DB_PASSWORD', getenv('DB_PASSWORD') ?: '123');

/**
 * Returns a PDO connection to the PostgreSQL database.
 */
function getDBConnection(): PDO {
    $database_url = getenv('DATABASE_URL');

    try {
        // Option 1: Use DATABASE_URL if available (e.g., Neon connection string)
        if ($database_url) {
            $dbopts = parse_url($database_url);
            $host     = $dbopts["host"] ?? 'localhost';
            $port     = $dbopts["port"] ?? '5432';
            $dbname   = ltrim($dbopts["path"], '/');
            $user     = $dbopts["user"] ?? '';
            $password = $dbopts["pass"] ?? '';

            // Neon and cloud providers require SSL mode
            $dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s;sslmode=require', $host, $port, $dbname);
            
            $pdo = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
            return $pdo;
        }

        // Option 2: Fallback to individual constants/environment variables (Local setup)
        $dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s', DB_HOST, DB_PORT, DB_NAME);
        
        $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        return $pdo;

    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode([
            'success' => false,
            'error'   => 'Database connection failed: ' . $e->getMessage()
        ]));
    }
}
?>