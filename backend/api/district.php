<?php
// ============================================================
// FIN-GAP RWANDA — GET /api/districts/{id}
// Returns full detail for a single district including
// demographics, exclusion drivers, and policy recommendations
// ============================================================

require_once __DIR__ . '/../config/database.php';

$pdo = getDBConnection();

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid district ID.']);
    exit();
}

// --- 1. Core district metrics ---
$stmtDistrict = $pdo->prepare("
    SELECT
        d.id, d.code, d.name AS district,
        p.name                       AS province,
        d.poverty_rate, d.extreme_poverty_rate, d.mean_monthly_consumption,
        d.banked_rate, d.mobile_money_rate, d.informal_only_rate,
        d.fully_excluded_rate, d.financial_access_rate,
        d.exclusion_risk_score, d.mismatch_gap, d.mismatch_status
    FROM  districts d
    JOIN  provinces p ON d.province_id = p.id
    WHERE d.id = :id
");
$stmtDistrict->execute([':id' => $id]);
$district = $stmtDistrict->fetch();

if (!$district) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'District not found.']);
    exit();
}

// --- 2. Demographic breakdown ---
$stmtDemo = $pdo->prepare("
    SELECT female_exclusion_rate, male_exclusion_rate,
           urban_ratio, informal_employment, primary_edu_or_less
    FROM   district_demographics
    WHERE  district_id = :id
");
$stmtDemo->execute([':id' => $id]);
$demographics = $stmtDemo->fetch();

// --- 3. Exclusion drivers ---
$stmtDrivers = $pdo->prepare("
    SELECT driver
    FROM   exclusion_drivers
    WHERE  district_id = :id
    ORDER  BY display_order ASC
");
$stmtDrivers->execute([':id' => $id]);
$drivers = $stmtDrivers->fetchAll(PDO::FETCH_COLUMN);

// --- 4. Policy recommendations ---
$stmtPolicy = $pdo->prepare("
    SELECT target_body, recommendation
    FROM   policy_recommendations
    WHERE  district_id = :id
    ORDER  BY display_order ASC
");
$stmtPolicy->execute([':id' => $id]);
$policies = $stmtPolicy->fetchAll();

// --- 5. Combine and respond ---
echo json_encode([
    'success' => true,
    'data' => array_merge($district, [
        'demographics'           => $demographics,
        'exclusion_drivers'      => $drivers,
        'policy_recommendations' => $policies
    ])
]);
