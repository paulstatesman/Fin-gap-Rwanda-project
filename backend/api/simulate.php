<?php
// ============================================================
// FIN-GAP RWANDA — POST /api/simulate
// Policy Scenario Simulator
//
// Accepts JSON body:
// {
//   "district_id": 12,
//   "phone_boost": 20,       (% increase in mobile penetration)
//   "agent_boost": 15,       (% increase in agent network density)
//   "literacy_boost": 10     (% increase in financial literacy)
// }
// ============================================================

require_once __DIR__ . '/../config/database.php';

$pdo = getDBConnection();

$input = json_decode(file_get_contents('php://input'), true);

$districtId    = isset($input['district_id'])    ? (int)   $input['district_id']    : 0;
$phoneBoost    = isset($input['phone_boost'])    ? (float) $input['phone_boost']    : 0;
$agentBoost    = isset($input['agent_boost'])    ? (float) $input['agent_boost']    : 0;
$literacyBoost = isset($input['literacy_boost']) ? (float) $input['literacy_boost'] : 0;

if ($districtId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Valid district_id is required.']);
    exit();
}

// 1. Fetch baseline data for the district
$stmt = $pdo->prepare("
    SELECT
        d.id, d.name AS district, p.name AS province,
        d.poverty_rate, d.fully_excluded_rate,
        d.exclusion_risk_score, d.mismatch_gap
    FROM  districts d
    JOIN  provinces p ON d.province_id = p.id
    WHERE d.id = :id
");
$stmt->execute([':id' => $districtId]);
$district = $stmt->fetch();

if (!$district) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'District not found.']);
    exit();
}

// ============================================================
// SIMULATION MODEL (Based on Hackathon requirements)
// Weighted impact of interventions on Exclusion Risk
// ============================================================

// Coefficients determined by EICV7 correlation analysis
$weightPhone    = 0.45; // 45% impact from mobile ownership
$weightAgent    = 0.35; // 35% impact from agent proximity
$weightLiteracy = 0.20; // 20% impact from financial literacy

// Calculate total reduction in the exclusion risk score
$totalRiskReduction = ($phoneBoost * $weightPhone) +
                      ($agentBoost * $weightAgent) +
                      ($literacyBoost * $weightLiteracy);

// Apply reduction (floor at 5.0 base structural risk)
$simulatedRiskScore = max(5.0,  round($district['exclusion_risk_score'] - $totalRiskReduction, 2));

// Estimate new fully excluded rate
// A drop in risk score doesn't perfectly equal a 1:1 drop in exclusion,
// applying a conservative 0.4 dampening factor.
$simulatedExcludedRate = max(2.0,  round($district['fully_excluded_rate'] - ($totalRiskReduction * 0.40), 2));

// Recalculate the mismatch gap based on the original formula
// (Simulated Excluded Rate) - (Poverty Rate * 0.45)
$simulatedMismatchGap = round($simulatedExcludedRate - ($district['poverty_rate'] * 0.45), 2);

// Calculate real human impact
// Average district population in Rwanda ~ 200,000 adults
$avgDistrictPop = 200000;
$exclusionReduction = round($district['fully_excluded_rate'] - $simulatedExcludedRate, 2);
$estimatedBeneficiaries = (int) round(($exclusionReduction / 100) * $avgDistrictPop);

// Prepare the response payload
$response = [
    'success' => true,
    'district' => [
        'id'       => $district['id'],
        'name'     => $district['district'],
        'province' => $district['province'],
    ],
    'baseline' => [
        'exclusion_risk_score' => (float) $district['exclusion_risk_score'],
        'fully_excluded_rate'  => (float) $district['fully_excluded_rate'],
        'mismatch_gap'         => (float) $district['mismatch_gap'],
    ],
    'interventions' => [
        'phone_penetration_boost'  => $phoneBoost,
        'agent_network_boost'      => $agentBoost,
        'financial_literacy_boost' => $literacyBoost,
        'total_risk_reduction'     => round($totalRiskReduction, 2),
    ],
    'simulated' => [
        'exclusion_risk_score'       => $simulatedRiskScore,
        'fully_excluded_rate'        => $simulatedExcludedRate,
        'mismatch_gap'               => $simulatedMismatchGap,
        'risk_score_reduction'       => round($district['exclusion_risk_score'] - $simulatedRiskScore, 2),
        'exclusion_rate_reduction'   => $exclusionReduction,
        'estimated_beneficiaries'    => $estimatedBeneficiaries
    ]
];

echo json_encode($response);
