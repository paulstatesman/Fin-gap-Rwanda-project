<?php
// ============================================================
// FIN-GAP RWANDA — GET /api/model
// Returns the live-fitted regression metadata that powers the
// "Mismatch Gap" definition and the policy simulator, so the
// Methodology page can display real numbers instead of claims.
// ============================================================
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../model.php';

try {
    $pdo = getDBConnection();
    $model = buildExclusionModel($pdo);

    echo json_encode([
        'success' => true,
        'data'    => $model,
    ]);
} catch (Throwable $e) {
    // Log the detail for operators; never expose internals to the client.
    error_log('Model endpoint failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Unable to fit the model at this time.',
    ]);
}
