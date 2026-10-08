<?php
// Mock Data layer for local testing without a database
// This matches exactly what would come out of PostgreSQL

$mockDistricts = [
    ['id'=>1, 'province_id'=>1, 'code'=>'RW-01', 'district'=>'Nyarugenge', 'province'=>'Kigali City', 'poverty_rate'=>14.20, 'extreme_poverty_rate'=>3.10, 'mean_monthly_consumption'=>82500, 'banked_rate'=>58.40, 'mobile_money_rate'=>86.20, 'informal_only_rate'=>7.10, 'fully_excluded_rate'=>6.80, 'financial_access_rate'=>93.20, 'exclusion_risk_score'=>18.50, 'mismatch_gap'=>-12.40, 'mismatch_status'=>'Well-Served'],
    ['id'=>2, 'province_id'=>1, 'code'=>'RW-02', 'district'=>'Gasabo', 'province'=>'Kigali City', 'poverty_rate'=>12.80, 'extreme_poverty_rate'=>2.50, 'mean_monthly_consumption'=>91200, 'banked_rate'=>62.10, 'mobile_money_rate'=>89.40, 'informal_only_rate'=>5.30, 'fully_excluded_rate'=>5.50, 'financial_access_rate'=>94.50, 'exclusion_risk_score'=>15.20, 'mismatch_gap'=>-14.10, 'mismatch_status'=>'Well-Served'],
    ['id'=>3, 'province_id'=>1, 'code'=>'RW-03', 'district'=>'Kicukiro', 'province'=>'Kigali City', 'poverty_rate'=>9.50, 'extreme_poverty_rate'=>1.80, 'mean_monthly_consumption'=>105000, 'banked_rate'=>68.70, 'mobile_money_rate'=>92.10, 'informal_only_rate'=>4.20, 'fully_excluded_rate'=>4.10, 'financial_access_rate'=>95.90, 'exclusion_risk_score'=>11.40, 'mismatch_gap'=>-15.80, 'mismatch_status'=>'Well-Served'],
    ['id'=>4, 'province_id'=>2, 'code'=>'RW-04', 'district'=>'Gisagara', 'province'=>'Southern Province', 'poverty_rate'=>48.60, 'extreme_poverty_rate'=>22.40, 'mean_monthly_consumption'=>29800, 'banked_rate'=>18.20, 'mobile_money_rate'=>51.40, 'informal_only_rate'=>26.80, 'fully_excluded_rate'=>24.30, 'financial_access_rate'=>75.70, 'exclusion_risk_score'=>71.80, 'mismatch_gap'=>18.60, 'mismatch_status'=>'Severely Underserved'],
    ['id'=>5, 'province_id'=>2, 'code'=>'RW-05', 'district'=>'Nyamagabe', 'province'=>'Southern Province', 'poverty_rate'=>43.10, 'extreme_poverty_rate'=>19.50, 'mean_monthly_consumption'=>32400, 'banked_rate'=>21.50, 'mobile_money_rate'=>54.80, 'informal_only_rate'=>24.10, 'fully_excluded_rate'=>22.80, 'financial_access_rate'=>77.20, 'exclusion_risk_score'=>66.40, 'mismatch_gap'=>14.20, 'mismatch_status'=>'Severely Underserved'],
    ['id'=>6, 'province_id'=>2, 'code'=>'RW-06', 'district'=>'Nyaruguru', 'province'=>'Southern Province', 'poverty_rate'=>46.50, 'extreme_poverty_rate'=>21.10, 'mean_monthly_consumption'=>30500, 'banked_rate'=>19.80, 'mobile_money_rate'=>52.60, 'informal_only_rate'=>25.40, 'fully_excluded_rate'=>23.50, 'financial_access_rate'=>76.50, 'exclusion_risk_score'=>69.10, 'mismatch_gap'=>16.80, 'mismatch_status'=>'Severely Underserved'],
    ['id'=>7, 'province_id'=>2, 'code'=>'RW-07', 'district'=>'Huye', 'province'=>'Southern Province', 'poverty_rate'=>28.40, 'extreme_poverty_rate'=>9.80, 'mean_monthly_consumption'=>48200, 'banked_rate'=>38.60, 'mobile_money_rate'=>74.10, 'informal_only_rate'=>14.20, 'fully_excluded_rate'=>12.90, 'financial_access_rate'=>87.10, 'exclusion_risk_score'=>39.40, 'mismatch_gap'=>2.10, 'mismatch_status'=>'Moderately Underserved'],
    ['id'=>12, 'province_id'=>3, 'code'=>'RW-12', 'district'=>'Rutsiro', 'province'=>'Western Province', 'poverty_rate'=>49.50, 'extreme_poverty_rate'=>23.80, 'mean_monthly_consumption'=>28400, 'banked_rate'=>16.50, 'mobile_money_rate'=>48.20, 'informal_only_rate'=>28.50, 'fully_excluded_rate'=>26.20, 'financial_access_rate'=>73.80, 'exclusion_risk_score'=>75.40, 'mismatch_gap'=>20.20, 'mismatch_status'=>'Severely Underserved'],
    ['id'=>17, 'province_id'=>3, 'code'=>'RW-17', 'district'=>'Rubavu', 'province'=>'Western Province', 'poverty_rate'=>25.80, 'extreme_poverty_rate'=>7.90, 'mean_monthly_consumption'=>53800, 'banked_rate'=>46.20, 'mobile_money_rate'=>82.40, 'informal_only_rate'=>9.80, 'fully_excluded_rate'=>8.50, 'financial_access_rate'=>91.50, 'exclusion_risk_score'=>28.40, 'mismatch_gap'=>-5.20, 'mismatch_status'=>'Well-Served'],
    ['id'=>30, 'province_id'=>5, 'code'=>'RW-30', 'district'=>'Rwamagana', 'province'=>'Eastern Province', 'poverty_rate'=>23.40, 'extreme_poverty_rate'=>6.50, 'mean_monthly_consumption'=>58200, 'banked_rate'=>48.10, 'mobile_money_rate'=>83.20, 'informal_only_rate'=>8.90, 'fully_excluded_rate'=>7.80, 'financial_access_rate'=>92.20, 'exclusion_risk_score'=>25.40, 'mismatch_gap'=>-6.80, 'mismatch_status'=>'Well-Served'],
];

function getMockDemographics($id) {
    return ['female_exclusion_rate'=>29.40, 'male_exclusion_rate'=>18.90, 'urban_ratio'=>7.20, 'informal_employment'=>84.50, 'primary_edu_or_less'=>72.10];
}

function getMockDrivers($id) {
    return ['Geographical isolation from financial infrastructure', 'High subsistence agriculture with no cash income', 'Wide gender gap in phone ownership'];
}

function getMockPolicies($id) {
    return [
        ['target_body'=>'BNR', 'recommendation'=>'Deploy subsidized mobile money agent kits to rural sector markets.'],
        ['target_body'=>'MINECOFIN', 'recommendation'=>'Launch female-focused VSLA (Ikimina) digital linkage programs.']
    ];
}
