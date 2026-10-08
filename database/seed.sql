-- ============================================================
-- FIN-GAP RWANDA: PostgreSQL Seed Data
-- All 30 districts — EICV7 2023-2024 + FinScope Rwanda 2024
-- ============================================================

-- ============================================================
-- SEED: provinces
-- ============================================================
INSERT INTO provinces (name, region) VALUES
    ('Kigali City',      'Central'),
    ('Southern Province','South'),
    ('Western Province', 'West'),
    ('Northern Province','North'),
    ('Eastern Province', 'East');

-- ============================================================
-- SEED: districts
-- Columns: province_id, name, code,
--   poverty_rate, extreme_poverty_rate, mean_monthly_consumption,
--   banked_rate, mobile_money_rate, informal_only_rate, fully_excluded_rate, financial_access_rate,
--   exclusion_risk_score, mismatch_gap, mismatch_status
-- ============================================================
INSERT INTO districts (
    province_id, name, code,
    poverty_rate, extreme_poverty_rate, mean_monthly_consumption,
    banked_rate, mobile_money_rate, informal_only_rate, fully_excluded_rate, financial_access_rate,
    exclusion_risk_score, mismatch_gap, mismatch_status
) VALUES

-- KIGALI CITY (province_id = 1)
(1, 'Nyarugenge', 'RW-01', 14.20, 3.10,  82500,  58.40, 86.20, 7.10,  6.80,  93.20, 18.50, -12.40, 'Well-Served'),
(1, 'Gasabo',     'RW-02', 12.80, 2.50,  91200,  62.10, 89.40, 5.30,  5.50,  94.50, 15.20, -14.10, 'Well-Served'),
(1, 'Kicukiro',   'RW-03', 9.50,  1.80, 105000,  68.70, 92.10, 4.20,  4.10,  95.90, 11.40, -15.80, 'Well-Served'),

-- SOUTHERN PROVINCE (province_id = 2)
(2, 'Gisagara',   'RW-04', 48.60, 22.40, 29800,  18.20, 51.40, 26.80, 24.30, 75.70, 71.80, 18.60, 'Severely Underserved'),
(2, 'Nyamagabe',  'RW-05', 43.10, 19.50, 32400,  21.50, 54.80, 24.10, 22.80, 77.20, 66.40, 14.20, 'Severely Underserved'),
(2, 'Nyaruguru',  'RW-06', 46.50, 21.10, 30500,  19.80, 52.60, 25.40, 23.50, 76.50, 69.10, 16.80, 'Severely Underserved'),
(2, 'Huye',       'RW-07', 28.40, 9.80,  48200,  38.60, 74.10, 14.20, 12.90, 87.10, 39.40,  2.10, 'Moderately Underserved'),
(2, 'Nyanza',     'RW-08', 36.20, 14.30, 39100,  26.40, 62.50, 19.80, 17.60, 82.40, 52.80,  7.50, 'Moderately Underserved'),
(2, 'Ruhango',    'RW-09', 33.80, 12.60, 41500,  29.10, 66.80, 18.20, 15.40, 84.60, 47.20,  4.80, 'Moderately Underserved'),
(2, 'Muhanga',    'RW-10', 26.90, 8.40,  51200,  41.20, 77.50, 12.80, 11.20, 88.80, 35.80, -1.20, 'Balanced'),
(2, 'Kamonyi',    'RW-11', 24.50, 7.10,  55400,  44.80, 80.60, 11.20,  9.80, 90.20, 30.60, -3.80, 'Well-Served'),

-- WESTERN PROVINCE (province_id = 3)
(3, 'Rutsiro',    'RW-12', 49.50, 23.80, 28400,  16.50, 48.20, 28.50, 26.20, 73.80, 75.40, 20.20, 'Severely Underserved'),
(3, 'Nyamasheke', 'RW-13', 44.20, 20.20, 31800,  19.20, 52.10, 25.80, 23.10, 76.90, 68.20, 16.10, 'Severely Underserved'),
(3, 'Ngororero',  'RW-14', 47.10, 21.80, 29900,  18.10, 50.90, 26.40, 24.60, 75.40, 71.50, 18.10, 'Severely Underserved'),
(3, 'Karongi',    'RW-15', 38.40, 15.60, 37200,  25.80, 61.20, 21.40, 18.50, 81.50, 55.20,  9.40, 'Moderately Underserved'),
(3, 'Nyabihu',    'RW-16', 39.80, 16.90, 35800,  23.40, 58.70, 22.60, 19.80, 80.20, 58.60, 11.80, 'Severely Underserved'),
(3, 'Rubavu',     'RW-17', 25.80, 7.90,  53800,  46.20, 82.40,  9.80,  8.50, 91.50, 28.40, -5.20, 'Well-Served'),
(3, 'Rusizi',     'RW-18', 31.20, 11.40, 44600,  34.50, 71.80, 15.60, 13.80, 86.20, 42.10,  3.60, 'Moderately Underserved'),

-- NORTHERN PROVINCE (province_id = 4)
(4, 'Burera',     'RW-19', 42.80, 18.90, 33100,  20.40, 55.20, 23.50, 21.60, 78.40, 64.20, 13.50, 'Severely Underserved'),
(4, 'Gicumbi',    'RW-20', 37.50, 14.80, 38400,  27.20, 63.80, 19.10, 16.80, 83.20, 51.40,  6.90, 'Moderately Underserved'),
(4, 'Musanze',    'RW-21', 22.10, 5.80,  61200,  51.40, 84.60,  8.20,  7.40, 92.60, 24.80, -6.40, 'Well-Served'),
(4, 'Gakenke',    'RW-22', 35.40, 13.20, 40200,  28.50, 65.20, 17.80, 15.10, 84.90, 46.50,  4.20, 'Moderately Underserved'),
(4, 'Rulindo',    'RW-23', 29.80, 10.10, 47500,  36.20, 73.40, 14.50, 12.50, 87.50, 38.60,  1.20, 'Balanced'),

-- EASTERN PROVINCE (province_id = 5)
(5, 'Bugesera',   'RW-24', 34.20, 12.80, 42800,  32.10, 76.80, 13.40, 11.20, 88.80, 36.20, -5.80, 'Well-Served'),
(5, 'Nyagatare',  'RW-25', 38.90, 15.20, 37900,  29.80, 68.40, 16.20, 14.50, 85.50, 45.80,  1.80, 'Balanced'),
(5, 'Gatsibo',    'RW-26', 41.50, 17.40, 34500,  22.80, 58.10, 21.80, 19.20, 80.80, 59.40, 10.50, 'Severely Underserved'),
(5, 'Kayonza',    'RW-27', 32.50, 11.80, 44100,  35.40, 74.20, 14.10, 12.10, 87.90, 38.20, -0.40, 'Balanced'),
(5, 'Kirehe',     'RW-28', 37.10, 14.50, 38800,  26.80, 64.50, 18.60, 16.20, 83.80, 50.20,  5.80, 'Moderately Underserved'),
(5, 'Ngoma',      'RW-29', 34.80, 13.10, 41200,  30.50, 67.90, 16.80, 14.80, 85.20, 46.80,  4.10, 'Moderately Underserved'),
(5, 'Rwamagana',  'RW-30', 23.40, 6.50,  58200,  48.10, 83.20,  8.90,  7.80, 92.20, 25.40, -6.80, 'Well-Served');


-- ============================================================
-- SEED: district_demographics
-- ============================================================
INSERT INTO district_demographics (district_id, female_exclusion_rate, male_exclusion_rate, urban_ratio, informal_employment, primary_edu_or_less) VALUES
-- Kigali City
(1,  8.20,  5.30, 88.50, 42.10, 31.40),
(2,  6.50,  4.40, 79.20, 36.80, 26.50),
(3,  4.80,  3.30, 92.40, 29.50, 19.80),
-- Southern Province
(4,  29.40, 18.90, 7.20, 84.50, 72.10),
(5,  27.20, 18.10, 11.50, 79.80, 68.40),
(6,  28.50, 18.20,  6.80, 82.60, 70.90),
(7,  15.10, 10.40, 32.60, 61.20, 48.70),
(8,  21.40, 13.50, 18.40, 72.40, 59.20),
(9,  18.60, 12.10, 21.20, 68.90, 54.10),
(10, 13.20,  9.10, 38.90, 56.40, 44.80),
(11, 11.80,  7.70, 41.50, 52.80, 41.20),
-- Western Province
(12, 31.80, 20.40,  5.40, 86.80, 74.60),
(13, 27.90, 18.10,  8.60, 81.20, 69.50),
(14, 29.80, 19.20,  6.10, 84.10, 72.80),
(15, 22.10, 14.80, 16.80, 74.50, 61.40),
(16, 24.20, 15.30, 14.10, 76.80, 64.20),
(17, 10.10,  6.80, 48.20, 49.20, 39.50),
(18, 16.40, 11.10, 26.40, 65.80, 52.60),
-- Northern Province
(19, 25.80, 17.20,  8.90, 79.10, 67.20),
(20, 19.80, 13.60, 15.20, 73.10, 58.40),
(21,  8.90,  5.80, 42.10, 47.50, 36.20),
(22, 18.20, 11.90, 12.80, 71.50, 56.80),
(23, 14.80, 10.10, 22.50, 62.40, 49.10),
-- Eastern Province
(24, 13.10,  9.20, 28.60, 64.20, 51.50),
(25, 17.50, 11.40, 24.10, 69.80, 55.20),
(26, 23.40, 14.90, 13.50, 77.20, 63.80),
(27, 14.20,  9.90, 25.80, 63.10, 50.40),
(28, 19.10, 13.20, 16.40, 72.80, 57.90),
(29, 17.60, 11.80, 19.20, 70.10, 55.60),
(30,  9.20,  6.30, 39.40, 48.60, 37.80);


-- ============================================================
-- SEED: exclusion_drivers
-- ============================================================
INSERT INTO exclusion_drivers (district_id, driver, display_order) VALUES
-- Nyarugenge
(1, 'Informal urban trading dominance', 1),
(1, 'Agent network saturation reducing demand for formal banking', 2),
-- Gasabo
(2, 'High digital smartphone penetration', 1),
(2, 'Strong salary account usage among employed workers', 2),
-- Kicukiro
(3, 'Formal sector wage employment dominance', 1),
(3, 'High fintech app adoption among youth', 2),
-- Gisagara
(4, 'High subsistence agriculture with no cash income', 1),
(4, 'Wide gender gap in phone ownership', 2),
(4, 'Long distance to nearest mobile money agent', 3),
-- Nyamagabe
(5, 'Low financial literacy in rural households', 1),
(5, 'Mountainous terrain and poor network connectivity', 2),
(5, 'High dependence on informal savings groups', 3),
-- Nyaruguru
(6, 'Geographical isolation from financial infrastructure', 1),
(6, 'Low household cash income liquidity', 2),
(6, 'High adult illiteracy rate', 3),
-- Huye
(7, 'University student population boosts mobile money metrics', 1),
(7, 'Rural hinterland lagging behind urban core', 2),
-- Nyanza
(8, 'Low access to formal credit products', 1),
(8, 'Strong reliance on traditional tontines (ikimina)', 2),
-- Ruhango
(9, 'Cassava and informal trade economy dominance', 1),
(9, 'SACCO branches too distant for rural households', 2),
-- Muhanga
(10, 'Trade hub connectivity', 1),
(10, 'Growing MFI network', 2),
-- Kamonyi
(11, 'Proximity to Kigali economic corridor', 1),
(11, 'High mobile money adoption in peri-urban areas', 2),
-- Rutsiro
(12, 'Extreme geographical isolation from services', 1),
(12, 'Absence of financial service access points', 2),
(12, 'High female illiteracy rate', 3),
-- Nyamasheke
(13, 'Lake Kivu fishing economy informality', 1),
(13, 'Very limited MFI and bank branch presence', 2),
(13, 'Gender digital divide in phone ownership', 3),
-- Ngororero
(14, 'High slope topography limiting physical access', 1),
(14, 'Very low smartphone penetration', 2),
(14, 'Informal artisanal mining reliance', 3),
-- Karongi
(15, 'Tourism vs rural agricultural economic divide', 1),
(15, 'Strong reliance on informal savings groups', 2),
-- Nyabihu
(16, 'Irish potato supply chain reliance on cash', 1),
(16, 'Remote cold-climate highlands with poor coverage', 2),
-- Rubavu
(17, 'High cross-border trade volume with DRC (Goma)', 1),
(17, 'Active mobile money and currency exchange density', 2),
-- Rusizi
(18, 'Cross-border trade hub with moderate agent network', 1),
(18, 'Rice and tea farming hinterland', 2),
-- Burera
(19, 'Challenging border geography', 1),
(19, 'High informal cross-border trade', 2),
(19, 'Absence of bank branches in rural sectors', 3),
-- Gicumbi
(20, 'Dairy cooperative networks rely on cash', 1),
(20, 'Hilly terrain limiting physical access', 2),
-- Musanze
(21, 'Gorilla tourism economy boosting financial activity', 1),
(21, 'Strong commercial agricultural trade', 2),
-- Gakenke
(22, 'Coffee farming seasonal income cycles', 1),
(22, 'Informal savings reliance between seasons', 2),
-- Rulindo
(23, 'Proximity to Northern transport corridor', 1),
(23, 'Mining and agriculture economic mix', 2),
-- Bugesera
(24, 'New Bugesera Airport construction driving mobile money', 1),
(24, 'Flat terrain enabling good mobile network coverage', 2),
-- Nyagatare
(25, 'Vast land area creating distance to physical banks', 1),
(25, 'Cattle ranching and dairy sector rely on cash', 2),
-- Gatsibo
(26, 'High agricultural informality', 1),
(26, 'Low female financial literacy', 2),
(26, 'Limited formal bank branch presence', 3),
-- Kayonza
(27, 'Akagera tourism corridor boosting local economy', 1),
(27, 'Cross-border transit trade activity', 2),
-- Kirehe
(28, 'Rusumo border transit economy', 1),
(28, 'High agricultural informal labour', 2),
-- Ngoma
(29, 'Banana production supply chain cash reliance', 1),
(29, 'Informal tontine savings groups', 2),
-- Rwamagana
(30, 'Eastern Province administrative hub with high service density', 1),
(30, 'Strong digital adoption among youth', 2);


-- ============================================================
-- SEED: policy_recommendations
-- ============================================================
INSERT INTO policy_recommendations (district_id, target_body, recommendation, display_order) VALUES
-- Nyarugenge (1)
(1, 'MINICT', 'Expand merchant QR code adoption for informal traders in Kimironko and Nyabugogo markets.', 1),
(1, 'BNR', 'Promote micro-insurance products tailored to urban informal workers.', 2),
-- Gasabo (2)
(2, 'MINICT', 'Target rural peri-urban sub-counties (Jali, Nduba) with mobile financial literacy programs.', 1),
(2, 'BNR', 'Integrate SACCO digitisation into national instant payment platforms.', 2),
-- Kicukiro (3)
(3, 'BNR', 'Pilot digital credit scoring models using utility payment history.', 1),
(3, 'MINECOFIN', 'Promote youth retail investment and digital pension (EjoHeza) onboarding.', 2),
-- Gisagara (4)
(4, 'BNR', 'Deploy subsidized mobile money agent kits to rural sector markets in Mamba and Gishubi.', 1),
(4, 'MINECOFIN', 'Launch female-focused VSLA (Ikimina) digital linkage programs via BNR-approved MFIs.', 2),
(4, 'MINAGRI', 'Provide agricultural micro-credit tied to seasonal crop cycles.', 3),
-- Nyamagabe (5)
(5, 'MINICT', 'Incentivize telecom network expansion in mountainous tea-growing zones.', 1),
(5, 'BNR', 'Digitize tea farmer cooperative payouts directly to mobile wallets.', 2),
-- Nyaruguru (6)
(6, 'BNR', 'Establish mobile banking vans and floating agent networks for border sector markets.', 1),
(6, 'MINECOFIN', 'Support Umurenge SACCO interoperability with mobile wallets.', 2),
-- Huye (7)
(7, 'MINICT', 'Scale campus fintech incubation to build low-cost financial tools for surrounding farmers.', 1),
(7, 'MINAGRI', 'Expand digital micro-savings programs for smallholder rice farmers in Mukura marshland.', 2),
-- Nyanza (8)
(8, 'BNR', 'Provide agent liquidity management support during harvest seasons.', 1),
(8, 'MINAGRI', 'Digitize dairy cooperative payments in Busasamana sector.', 2),
-- Ruhango (9)
(9, 'BNR', 'Link cassava trading associations directly with digital MFI loans.', 1),
(9, 'MINECOFIN', 'Conduct community financial education campaigns targeting female heads of households.', 2),
-- Muhanga (10)
(10, 'BNR', 'Introduce digital safety compliance payments for artisanal mining workers.', 1),
(10, 'MINICT', 'Strengthen digital loan protection frameworks against predatory lending apps.', 2),
-- Kamonyi (11)
(11, 'MINECOFIN', 'Promote digital micro-pension enrollment (EjoHeza) across suburban agricultural workers.', 1),
(11, 'BNR', 'Support female agro-processing entrepreneurs with collateral-free digital loans.', 2),
-- Rutsiro (12)
(12, 'BNR', 'Priority financial inclusion: mandate agent cash-float subsidy program.', 1),
(12, 'MINICT', 'Deploy offline-capable USSD digital wallet solutions for remote coffee and tea farmers.', 2),
(12, 'MINECOFIN', 'Partner with local NGOs for radio-based financial literacy programs in Kinyarwanda.', 3),
-- Nyamasheke (13)
(13, 'MINICT', 'Digitize Lake Kivu cross-border trade transactions with DRC.', 1),
(13, 'BNR', 'Deploy female agent networks (Agent Kazi model) in rural sector markets.', 2),
-- Ngororero (14)
(14, 'BNR', 'Establish shared MFI digital kiosks in sector administrative offices.', 1),
(14, 'MINECOFIN', 'Expand EjoHeza micro-pension match funding for informal miners and farmers.', 2),
-- Karongi (15)
(15, 'MINICT', 'Link Lake Kivu eco-tourism operators with local agricultural supplier digital payouts.', 1),
(15, 'BNR', 'Digitize rural VSLAs using USSD group accounting applications.', 2),
-- Nyabihu (16)
(16, 'MINAGRI', 'Digitize Irish Potato collection center transactions via mobile wallets.', 1),
(16, 'BNR', 'Introduce weather-index crop insurance linked to digital loan products.', 2),
-- Rubavu (17)
(17, 'BNR', 'Establish multi-currency digital wallets for cross-border informal women traders.', 1),
(17, 'MINICT', 'Strengthen anti-fraud and consumer protection awareness for digital remittances.', 2),
-- Rusizi (18)
(18, 'MINICT', 'Expand digital payment access points at Bugarama market and border post.', 1),
(18, 'BNR', 'Promote mobile-based micro-lease financing for smallholder rice tillers.', 2),
-- Burera (19)
(19, 'BNR', 'Scale agency banking partnerships with local retail shopkeepers.', 1),
(19, 'MINECOFIN', 'Implement financial literacy programs for female cross-border porters.', 2),
-- Gicumbi (20)
(20, 'MINAGRI', 'Digitize milk collection center payments across all Gicumbi dairy farmers.', 1),
(20, 'MINICT', 'Deploy solar-powered digital agent charging hubs in remote sectors.', 2),
-- Musanze (21)
(21, 'MINICT', 'Promote digital supplier payments for eco-tourism lodges and local craft cooperatives.', 1),
(21, 'MINECOFIN', 'Expand youth digital entrepreneurship micro-grants.', 2),
-- Gakenke (22)
(22, 'BNR', 'Provide digital pre-harvest micro-loans to coffee washing station members.', 1),
(22, 'MINECT', 'Strengthen SACCO mobile banking integration.', 2),
-- Rulindo (23)
(23, 'BNR', 'Expand mobile-based asset financing for smallholder mining equipment.', 1),
(23, 'MINICT', 'Promote digital literacy training through local youth centres.', 2),
-- Bugesera (24)
(24, 'BNR', 'Leverage high mobile adoption to convert mobile wallet users to formal micro-investors.', 1),
(24, 'MINECOFIN', 'Support female construction workers with formal mobile savings plans.', 2),
-- Nyagatare (25)
(25, 'BNR', 'Digitize livestock sales payments at Nyagatare livestock auctions.', 1),
(25, 'MINICT', 'Deploy satellite-connected mobile banking units for remote ranching sectors.', 2),
-- Gatsibo (26)
(26, 'MINAGRI', 'Target Gatsibo rice and maize farmer cooperatives with digital literacy workshops.', 1),
(26, 'BNR', 'Incentivize commercial banks to open low-cost agency banking points.', 2),
-- Kayonza (27)
(27, 'MINICT', 'Integrate local craft vendors into digital tourist payment platforms.', 1),
(27, 'BNR', 'Expand micro-irrigation digital loan schemes for drought-prone farming sectors.', 2),
-- Kirehe (28)
(28, 'MINICT', 'Accelerate mobile phone ownership schemes for female smallholder farmers.', 1),
(28, 'BNR', 'Establish digital cross-border trade desks at Rusumo One-Stop Border Post.', 2),
-- Ngoma (29)
(29, 'BNR', 'Digitize banana wine and produce cooperative payment channels.', 1),
(29, 'MINECOFIN', 'Link SACCO savings groups directly to digital micro-loans.', 2),
-- Rwamagana (30)
(30, 'BNR', 'Serve as Eastern Province testbed for Central Bank Digital Currency (CBDC) offline trials.', 1),
(30, 'MINICT', 'Expand digital financial education in secondary schools.', 2);
