<?php
// ============================================================
// FIN-GAP RWANDA — Statistical Model Utilities
//
// Ordinary Least Squares (OLS) linear regression implemented from
// scratch (Gaussian elimination on the normal equations), so the
// API has no external dependencies and runs on any PHP 8 + PDO host.
//
// Predictors are standardised internally for numerical stability and
// the fitted coefficients are converted back to their original units,
// so callers can reason in percentage points.
// ============================================================

if (!function_exists('solveLinearSystem')) {
    /**
     * Solves A·x = b with Gaussian elimination and partial pivoting.
     *
     * @return float[]|null null when the system is singular.
     */
    function solveLinearSystem(array $A, array $b): ?array
    {
        $n = count($A);

        // Augment with the right-hand side.
        for ($i = 0; $i < $n; $i++) {
            $A[$i][] = $b[$i];
        }

        for ($col = 0; $col < $n; $col++) {
            // Partial pivoting keeps the elimination stable.
            $pivotRow = $col;
            $max = abs($A[$col][$col]);
            for ($r = $col + 1; $r < $n; $r++) {
                if (abs($A[$r][$col]) > $max) {
                    $max = abs($A[$r][$col]);
                    $pivotRow = $r;
                }
            }
            if ($max < 1e-10) {
                return null;
            }
            if ($pivotRow !== $col) {
                $swap = $A[$col];
                $A[$col] = $A[$pivotRow];
                $A[$pivotRow] = $swap;
            }

            // Eliminate the column from every other row (Gauss-Jordan).
            for ($r = 0; $r < $n; $r++) {
                if ($r === $col) {
                    continue;
                }
                $factor = $A[$r][$col] / $A[$col][$col];
                if ($factor == 0.0) {
                    continue;
                }
                for ($c = $col; $c <= $n; $c++) {
                    $A[$r][$c] -= $factor * $A[$col][$c];
                }
            }
        }

        $x = [];
        for ($i = 0; $i < $n; $i++) {
            $x[$i] = $A[$i][$n] / $A[$i][$i];
        }

        return $x;
    }
}

if (!function_exists('fitOLS')) {
    /**
     * Fits y = b0 + b1·x1 + ... + bk·xk by ordinary least squares.
     *
     * @param array $X Rows of predictor values; each row must have the same length.
     * @param array $y Response values, one per row of $X.
     * @return array|null ['intercept', 'coefficients', 'r_squared', 'n'] or null if unfit.
     */
    function fitOLS(array $X, array $y): ?array
    {
        $n = count($y);
        if ($n < 3 || count($X) !== $n) {
            return null;
        }

        $k = count($X[0]);
        if ($k < 1) {
            return null;
        }

        // Column means / standard deviations.
        $means = array_fill(0, $k, 0.0);
        $stds  = array_fill(0, $k, 0.0);
        for ($j = 0; $j < $k; $j++) {
            $sum = 0.0;
            for ($i = 0; $i < $n; $i++) {
                $sum += (float) $X[$i][$j];
            }
            $means[$j] = $sum / $n;

            $ss = 0.0;
            for ($i = 0; $i < $n; $i++) {
                $d = (float) $X[$i][$j] - $means[$j];
                $ss += $d * $d;
            }
            $stds[$j] = sqrt($ss / $n);
            if ($stds[$j] < 1e-10) {
                return null; // Constant predictor carries no information.
            }
        }

        // Response mean / standard deviation.
        $meanY = array_sum(array_map('floatval', $y)) / $n;
        $ssY = 0.0;
        foreach ($y as $value) {
            $d = (float) $value - $meanY;
            $ssY += $d * $d;
        }
        $stdY = sqrt($ssY / $n);
        if ($stdY < 1e-10) {
            return null; // Constant response.
        }

        // Standardised design matrix (intercept column first).
        $p = $k + 1;
        $design = [];
        for ($i = 0; $i < $n; $i++) {
            $row = [1.0];
            for ($j = 0; $j < $k; $j++) {
                $row[] = ((float) $X[$i][$j] - $means[$j]) / $stds[$j];
            }
            $design[$i] = $row;
        }

        $yStd = [];
        for ($i = 0; $i < $n; $i++) {
            $yStd[$i] = ((float) $y[$i] - $meanY) / $stdY;
        }

        // Normal equations: (DᵀD)·β = Dᵀy
        $XtX = array_fill(0, $p, array_fill(0, $p, 0.0));
        $Xty = array_fill(0, $p, 0.0);
        for ($i = 0; $i < $n; $i++) {
            for ($a = 0; $a < $p; $a++) {
                for ($b = 0; $b < $p; $b++) {
                    $XtX[$a][$b] += $design[$i][$a] * $design[$i][$b];
                }
                $Xty[$a] += $design[$i][$a] * $yStd[$i];
            }
        }

        $beta = solveLinearSystem($XtX, $Xty);
        if ($beta === null) {
            return null;
        }

        // Convert standardised coefficients back to original units.
        $coefficients = [];
        $intercept = $meanY;
        for ($j = 0; $j < $k; $j++) {
            $b = $stdY * $beta[$j + 1] / $stds[$j];
            $coefficients[] = $b;
            $intercept -= $b * $means[$j];
        }

        // R² computed on the original scale.
        $ssRes = 0.0;
        for ($i = 0; $i < $n; $i++) {
            $pred = $intercept;
            for ($j = 0; $j < $k; $j++) {
                $pred += $coefficients[$j] * (float) $X[$i][$j];
            }
            $ssRes += ((float) $y[$i] - $pred) ** 2;
        }
        $r2 = $ssY > 0 ? 1 - ($ssRes / $ssY) : 0.0;

        return [
            'intercept'    => round($intercept, 4),
            'coefficients' => array_map(static fn($c) => round($c, 4), $coefficients),
            'r_squared'    => round($r2, 4),
            'n'            => $n,
        ];
    }
}

if (!function_exists('buildExclusionModel')) {
    /**
     * Fits the two models that power FIN-GAP RWANDA from live district data.
     *
     * 1. Mismatch-Gap model  : fully_excluded_rate ~ poverty_rate
     *    Gives the "expected" exclusion for a district's poverty level; the
     *    residual (actual − expected) is the Mismatch Gap.
     * 2. Intervention model  : fully_excluded_rate ~ mobile_money_rate
     *                                             + banked_rate
     *                                             + primary_edu_or_less
     *    Gives empirically estimated sensitivity coefficients used by the
     *    policy simulator instead of hard-coded weights.
     *
     * @return array Model metadata, or ['available' => false, 'reason' => ...].
     */
    function buildExclusionModel(PDO $pdo): array
    {
        $sql = "
            SELECT
                d.id,
                d.name AS district,
                d.poverty_rate,
                d.fully_excluded_rate,
                d.mobile_money_rate,
                d.banked_rate,
                dd.primary_edu_or_less
            FROM   districts d
            LEFT   JOIN district_demographics dd ON dd.district_id = d.id
            ORDER  BY d.id
        ";

        $rows = $pdo->query($sql)->fetchAll();

        // Only complete observations can enter the regression.
        $observed = [];
        foreach ($rows as $row) {
            if ($row['poverty_rate'] === null || $row['fully_excluded_rate'] === null) {
                continue;
            }
            $observed[] = $row;
        }

        if (count($observed) < 3) {
            return [
                'available' => false,
                'reason'    => 'Not enough district observations to fit the model.',
                'n'         => count($observed),
            ];
        }

        $y = array_map(static fn($r) => (float) $r['fully_excluded_rate'], $observed);

        // --- Model 1: expected exclusion from poverty ---
        $povertyX = array_map(static fn($r) => [(float) $r['poverty_rate']], $observed);
        $povertyModel = fitOLS($povertyX, $y);

        // --- Model 2: intervention sensitivities ---
        $accessX = [];
        $accessY = [];
        foreach ($observed as $row) {
            if ($row['mobile_money_rate'] === null
                || $row['banked_rate'] === null
                || $row['primary_edu_or_less'] === null) {
                continue;
            }
            $accessX[] = [
                (float) $row['mobile_money_rate'],
                (float) $row['banked_rate'],
                (float) $row['primary_edu_or_less'],
            ];
            $accessY[] = (float) $row['fully_excluded_rate'];
        }

        $predictors = ['mobile_money_rate', 'banked_rate', 'primary_edu_or_less'];

        $interventionModel = null;
        $method = null;

        if (count($accessX) >= 4) {
            $joint = fitOLS($accessX, $accessY);

            // Trust the joint fit only when every coefficient carries the
            // economically expected sign. Collinear access indicators can
            // otherwise flip a sign and drive the simulator backwards:
            //   mobile money ↑ → exclusion ↓
            //   formal banking ↑ → exclusion ↓
            //   low education share ↑ → exclusion ↑
            $signsOk = $joint !== null
                && $joint['coefficients'][0] < 0
                && $joint['coefficients'][1] < 0
                && $joint['coefficients'][2] > 0;

            if ($signsOk) {
                $interventionModel = $joint;
                $method = 'multiple_ols';
            }
        }

        // Fall back to one regression per driver when the joint fit is
        // unstable, so each coefficient keeps its expected sign.
        if ($interventionModel === null && count($accessX) >= 3) {
            $method = 'univariate_ols';
            $coefficients = [];
            foreach (array_keys($predictors) as $j) {
                $column = array_map(static fn($row) => [$row[$j]], $accessX);
                $fit = fitOLS($column, $accessY);
                $coefficients[$j] = $fit ? $fit['coefficients'][0] : 0.0;
            }
            $interventionModel = [
                'intercept'    => null,
                'coefficients' => array_map(static fn($c) => round($c, 4), $coefficients),
                'r_squared'    => null,
                'n'            => count($accessX),
            ];
        }

        return [
            'available' => true,
            'n'         => count($observed),
            'mismatch_gap_model' => [
                'formula'     => 'expected_fully_excluded_rate = intercept + poverty_slope × poverty_rate',
                'intercept'   => $povertyModel['intercept'] ?? null,
                'poverty_slope' => $povertyModel['coefficients'][0] ?? null,
                'r_squared'   => $povertyModel['r_squared'] ?? null,
                'n'           => $povertyModel['n'] ?? null,
            ],
            'intervention_model' => [
                'method'       => $method,
                'predictors'   => $predictors,
                'intercept'    => $interventionModel['intercept'] ?? null,
                'coefficients' => $interventionModel['coefficients'] ?? null,
                'r_squared'    => $interventionModel['r_squared'] ?? null,
                'n'            => $interventionModel['n'] ?? null,
            ],
        ];
    }
}
