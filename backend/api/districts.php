<?php
// ============================================================
// FIN-GAP RWANDA — GET /api/districts
// Returns all 30 districts with financial inclusion metrics
// Supports: ?province=Western+Province&status=Severely+Underserved
//           ?sort=mismatch_gap&order=desc
// ============================================================

require_once __DIR__ . '/../config/database.php';

$pdo = getDBConnection();

// Read optional query parameters
$province = $_GET['province'] ?? null;
$status   = $_GET['status']   ?? null;
$sort     = $_GET['sort']     ?? 'mismatch_gap';
$order    = strtoupper($_GET['order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

// Whitelist sortable columns to prevent SQL injection
$allowedSorts = [
    'mismatch_gap', 'exclusion_risk_score', 'poverty_rate',
    'fully_excluded_rate', 'banked_rate', 'name'
];
if (!in_array($sort, $allowedSorts)) {
    $sort = 'mismatch_gap';
}

// Build dynamic WHERE clause
$conditions = [];
$params     = [];

if ($province) {
    $conditions[] = 'p.name = :province';
    $params[':province'] = $province;
}

if ($status) {
    $conditions[] = 'd.mismatch_status = :status';
    $params[':status'] = $status;
}

$where = count($conditions) > 0 ? 'WHERE ' . implode(' AND ', $conditions) : '';

$sql = "
    SELECT
        d.id,
        d.code,
        d.name                       AS district,
        p.name                       AS province,
        d.poverty_rate,
        d.extreme_poverty_rate,
        d.mean_monthly_consumption,
        d.banked_rate,
        d.mobile_money_rate,
        d.informal_only_rate,
        d.fully_excluded_rate,
        d.financial_access_rate,
        d.exclusion_risk_score,
        d.mismatch_gap,
        d.mismatch_status
    FROM   districts d
    JOIN   provinces p ON d.province_id = p.id
    $where
    ORDER BY d.$sort $order
";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$districts = $stmt->fetchAll();

echo json_encode([
    'success' => true,
    'count'   => count($districts),
    'data'    => $districts
]);
