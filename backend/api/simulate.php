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
//
// The sensitivity coefficients are FITTED from the live district
// dataset (see ../model.php) rather than hard-coded, so the
// projections move with the underlying data.
// ============================================================
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../model.php';

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
// SENSITIVITY MODEL
// Fit fully_excluded_rate ~ mobile_money_rate + banked_rate +
// primary_edu_or_less across all districts, then read the
// coefficients as the marginal effect of each intervention.
// ============================================================
$model = null;
try {
    $model = buildExclusionModel($pdo);
} catch (Throwable $e) {
    error_log('Simulation model fit failed: ' . $e->getMessage());
}

$coefficients = $model['intervention_model']['coefficients'] ?? null;
$method       = $model['intervention_model']['method'] ?? null;

$modelApplied = is_array($coefficients)
    && count($coefficients) === 3
    && ($coefficients[0] != 0.0 || $coefficients[1] != 0.0 || $coefficients[2] != 0.0);

if ($modelApplied) {
    [$cMobile, $cBanked, $cEducation] = array_map('floatval', $coefficients);

    // Boosts raise access indicators and reduce the low-education share.
    $exclusionDelta = ($cMobile * $phoneBoost)
                    + ($cBanked * $agentBoost)
                    + ($cEducation * (-$literacyBoost));
} else {
    // Prototype fallback used only if the regression cannot be fitted.
    $totalRiskReduction = ($phoneBoost * 0.45) + ($agentBoost * 0.35) + ($literacyBoost * 0.20);
    $exclusionDelta = -1 * ($totalRiskReduction * 0.40);
    $method = 'prototype_fallback';
}

$simulatedExcludedRate = round(max(0.5, min(100.0, (float) $district['fully_excluded_rate'] + $exclusionDelta)), 2);
$exclusionReduction    = round((float) $district['fully_excluded_rate'] - $simulatedExcludedRate, 2);

// Move the risk score in proportion to the exclusion reduction.
$baselineExcluded   = max((float) $district['fully_excluded_rate'], 0.01);
$riskRatio          = (float) $district['exclusion_risk_score'] / $baselineExcluded;
$simulatedRiskScore = round(max(5.0, (float) $district['exclusion_risk_score'] - ($exclusionReduction * $riskRatio)), 2);
$riskScoreReduction = round((float) $district['exclusion_risk_score'] - $simulatedRiskScore, 2);

// Expected exclusion for this district's poverty level, from the fitted
// poverty model (the definition behind the "Mismatch Gap").
$mismatchModel = $model['mismatch_gap_model'] ?? null;
if (is_array($mismatchModel) && $mismatchModel['intercept'] !== null && $mismatchModel['poverty_slope'] !== null) {
    $expectedExclusion = (float) $mismatchModel['intercept']
                       + ((float) $mismatchModel['poverty_slope'] * (float) $district['poverty_rate']);
} else {
    $expectedExclusion = (float) $district['poverty_rate'] * 0.45;
}

$simulatedMismatchGap = round($simulatedExcludedRate - $expectedExclusion, 2);

// Real-world scale: average district adult population in Rwanda ~ 200,000.
$avgDistrictPop         = 200000;
$estimatedBeneficiaries = (int) round(($exclusionReduction / 100) * $avgDistrictPop);

// Prepare the response payload
$response = [
    'success' => true,
    'district' => [
        'id'       => $district['id'],
        'name'     => $district['district'],
        'province' => $district['province'],
    ],
    'model' => [
        'source'                 => $method,
        'predictors'             => $model['intervention_model']['predictors'] ?? null,
        'coefficients'           => $coefficients,
        'r_squared'              => $model['intervention_model']['r_squared'] ?? null,
        'n_observations'         => $model['intervention_model']['n'] ?? null,
        'expected_exclusion_rate' => round($expectedExclusion, 2),
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
        'exclusion_rate_delta'     => round($exclusionDelta, 2),
    ],
    'simulated' => [
        'exclusion_risk_score'     => $simulatedRiskScore,
        'fully_excluded_rate'      => $simulatedExcludedRate,
        'mismatch_gap'             => $simulatedMismatchGap,
        'risk_score_reduction'     => $riskScoreReduction,
        'exclusion_rate_reduction' => $exclusionReduction,
        'estimated_beneficiaries'  => $estimatedBeneficiaries
    ]
];

echo json_encode($response);
