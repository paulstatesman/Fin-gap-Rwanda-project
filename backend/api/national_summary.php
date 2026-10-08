<?php
// ============================================================
// FIN-GAP RWANDA — GET /api/national-summary
// Returns national-level KPI statistics for the dashboard banner
// ============================================================

require_once __DIR__ . '/../config/database.php';

$pdo = getDBConnection();

$sql = "
    SELECT
        COUNT(id) AS total_districts,
        ROUND(AVG(fully_excluded_rate), 2) AS avg_fully_excluded_rate,
        ROUND(AVG(mobile_money_rate), 2) AS avg_mobile_money_rate,
        SUM(CASE WHEN mismatch_status = 'Severely Underserved' THEN 1 ELSE 0 END) AS severely_underserved_count
    FROM districts
";

$stmt = $pdo->query($sql);
$summary = $stmt->fetch();

$sqlWorst = "
    SELECT name, mismatch_gap
    FROM   districts
    ORDER  BY mismatch_gap DESC
    LIMIT  1
";
$stmtWorst = $pdo->query($sqlWorst);
$worst = $stmtWorst->fetch();

$summary['worst_district'] = $worst;

// Cast to numbers where appropriate for JSON
$summary['total_districts'] = (int) $summary['total_districts'];
$summary['avg_fully_excluded_rate'] = (float) $summary['avg_fully_excluded_rate'];
$summary['avg_mobile_money_rate'] = (float) $summary['avg_mobile_money_rate'];
$summary['severely_underserved_count'] = (int) $summary['severely_underserved_count'];
$summary['worst_district']['mismatch_gap'] = (float) $summary['worst_district']['mismatch_gap'];

echo json_encode([
    'success' => true,
    'data' => $summary
]);
