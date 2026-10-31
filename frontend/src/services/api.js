// frontend/src/services/api.js
import axios from 'axios';
import LOCAL_DISTRICTS from './localDistricts.json';

const API_BASE = (
  process.env.REACT_APP_API_URL || 'https://fin-gap-rwanda-project.onrender.com'
).replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Clean API routes matching the backend router
export const fetchNationalSummary = () =>
  api.get('/api/national-summary').then(r => r.data.data);

export const fetchDistricts = (params = {}) =>
  api.get('/api/districts', { params }).then(r => r.data);

export const fetchDistrict = (id) =>
  api.get(`/api/districts/${id}`).then(r => r.data.data);

export const runSimulation = async (payload) => {
  try {
    const res = await api.post('/api/simulate', payload);
    return res.data;
  } catch (err) {
    console.warn('API unreachable, computing local simulation:', err.message);
    const districtId = parseInt(payload.district_id, 10);
    const district = LOCAL_DISTRICTS.find(d => Number(d.id) === districtId) || LOCAL_DISTRICTS[0];

    const phoneBoost = parseFloat(payload.phone_boost) || 0;
    const agentBoost = parseFloat(payload.agent_boost) || 0;
    const literacyBoost = parseFloat(payload.literacy_boost) || 0;

    // Simulation model weights
    const weightPhone = 0.45;     // 45% mobile penetration weight
    const weightAgent = 0.35;     // 35% agent network density weight
    const weightLiteracy = 0.20;  // 20% financial literacy weight

    // Dynamic calculations
    const totalRiskReduction = (phoneBoost * weightPhone) + (agentBoost * weightAgent) + (literacyBoost * weightLiteracy);
    const simulatedRiskScore = Math.max(5.0, Number((district.exclusion_risk_score - totalRiskReduction).toFixed(2)));
    const simulatedExcludedRate = Math.max(2.0, Number((district.fully_excluded_rate - (totalRiskReduction * 0.40)).toFixed(2)));
    const simulatedMismatchGap = Number((simulatedExcludedRate - (district.poverty_rate * 0.45)).toFixed(2));
    const exclusionReduction = Number((district.fully_excluded_rate - simulatedExcludedRate).toFixed(2));
    const estimatedBeneficiaries = Math.round((exclusionReduction / 100) * 200000);

    return {
      success: true,
      isFallback: true,
      district: {
        id: district.id,
        name: district.district || district.name,
        province: district.province
      },
      baseline: {
        exclusion_risk_score: Number(district.exclusion_risk_score),
        fully_excluded_rate: Number(district.fully_excluded_rate),
        mismatch_gap: Number(district.mismatch_gap)
      },
      interventions: {
        phone_penetration_boost: phoneBoost,
        agent_network_boost: agentBoost,
        financial_literacy_boost: literacyBoost,
        total_risk_reduction: Number(totalRiskReduction.toFixed(2))
      },
      simulated: {
        exclusion_risk_score: simulatedRiskScore,
        fully_excluded_rate: simulatedExcludedRate,
        mismatch_gap: simulatedMismatchGap,
        risk_score_reduction: Number((district.exclusion_risk_score - simulatedRiskScore).toFixed(2)),
        exclusion_rate_reduction: exclusionReduction,
        estimated_beneficiaries: estimatedBeneficiaries
      }
    };
  }
};

export const fetchModel = () =>
  api.get('/api/model').then(r => r.data.data);

/**
 * generatePolicyReport â€” calls the Gemini API directly from the browser
 * to produce a localized policy brief for local government leaders.
 *
 * Falls back to a deterministic template when no API key is configured
 * or when the API call fails, so the feature always works.
 *
 * @param {object} district      - full district data row (from /api/districts)
 * @param {Array}  allDistricts  - all 30 districts (for national context)
 * @returns {Promise<string>}    Markdown-formatted policy brief text
 */
export const generatePolicyReport = async (district, allDistricts = []) => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  // â”€â”€ National context helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sorted = [...allDistricts].sort((a, b) => b.mismatch_gap - a.mismatch_gap);
  const nationalAvgExclusion = allDistricts.length
    ? (allDistricts.reduce((s, d) => s + parseFloat(d.fully_excluded_rate || 0), 0) / allDistricts.length).toFixed(1)
    : 'N/A';
  const nationalAvgPoverty = allDistricts.length
    ? (allDistricts.reduce((s, d) => s + parseFloat(d.poverty_rate || 0), 0) / allDistricts.length).toFixed(1)
    : 'N/A';
  const districtRank = sorted.findIndex(d => d.id === district.id) + 1;

  // â”€â”€ Gap category and intervention tier â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const gap = parseFloat(district.mismatch_gap);
  let gapCategory, interventionTier;
  if (gap > 10) {
    gapCategory = 'Severely Underserved';
    interventionTier = 'Priority Tier 1 â€” Infrastructure & Access';
  } else if (gap > 0) {
    gapCategory = 'Moderately Underserved';
    interventionTier = 'Priority Tier 2 â€” Inclusion & Uptake';
  } else {
    gapCategory = 'Well-Served / Over-performing';
    interventionTier = 'Priority Tier 3 â€” Depth & Quality of Services';
  }

  // â”€â”€ Deterministic fallback template (always works, no API needed) â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const buildFallbackReport = () => {
    const recsByGap =
      gap > 10
        ? [
            'Mandate BNR-subsidised mobile-money agents within 5 km of every sector office.',
            'Deploy USSD-based micro-savings products that function without internet connectivity.',
            'Launch an "Agent Kazi" female agent pilot with start-up grants targeting rural sectors.',
            'Prioritise telecom network expansion through tax incentives for rural MNO investment.',
          ]
        : gap > 0
        ? [
            'Run targeted financial-literacy campaigns in partnership with local cooperatives (Umurenge SACCOs).',
            'Incentivise MFI branch openings through a BNR rural expansion credit scheme.',
            'Digitise VSLA (Village Savings & Loan Association) ledgers and link payouts to mobile wallets.',
          ]
        : [
            'Transition strategy from access to quality: promote micro-insurance and digital credit products.',
            'Expand merchant QR-code payment adoption among informal urban traders.',
            'Encourage EjoHeza digital pension plan uptake through employer payroll integration.',
            'Pilot retail investment products for underserved youth and women entrepreneurs.',
          ];

    const drivers =
      district.exclusion_drivers && district.exclusion_drivers.length > 0
        ? district.exclusion_drivers
        : ['Distance to nearest financial agent', 'Low digital literacy', 'High informal employment rate'];

    return `## Executive Policy Brief â€” ${district.district} District

**Prepared for:** Local Government Leadership — ${district.district} District
**Reference Framework:** NST2 Â· National Financial Inclusion Strategy 2026
**Date:** ${new Date().toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric' })}
**Classification:** For Official Use

---

### 1. District Snapshot

${district.district} is located in **${district.province}** and ranks **#${districtRank} of ${allDistricts.length || 30}** nationally on the FIN-GAP Mismatch Index.

| Metric | ${district.district} | National Avg |
|---|---|---|
| Financial Exclusion Rate | **${district.fully_excluded_rate}%** | ${nationalAvgExclusion}% |
| Mobile Money Penetration | **${district.mobile_money_rate}%** | â€” |
| Formal Banking Rate | **${district.banked_rate}%** | â€” |
| Informal-Only (Ikimina) | **${district.informal_only_rate}%** | â€” |
| Poverty Rate | **${district.poverty_rate}%** | ${nationalAvgPoverty}% |
| Exclusion Risk Score | **${district.exclusion_risk_score}/100** | â€” |

---

### 2. Mismatch Gap Analysis

**Gap Score: ${gap > 0 ? '+' : ''}${district.mismatch_gap}** â€” *${gapCategory}*

The Mismatch Gap measures how much worse (or better) financial exclusion is in ${district.district} compared to what its poverty level alone would predict. A positive gap signals **structural barriers beyond income poverty** â€” such as limited agent networks, connectivity deficits, or gender-based exclusion â€” that require targeted policy action independent of economic growth.

**Intervention Category:** ${interventionTier}

---

### 3. Key Structural Barriers

Based on district-level data from the FIN-GAP Mismatch Tool, the following barriers are driving exclusion in ${district.district}:

${drivers.map(d => `- **${d}**`).join('\n')}

---

### 4. Priority Policy Recommendations (MINECOFIN / BNR / District)

${recsByGap.map((r, i) => `**${i + 1}.** ${r}`).join('\n\n')}

---

### 5. NST2 Strategic Alignment

| NST2 Pillar | Recommended Action for ${district.district} |
|---|---|
| Economic Transformation | Digitise cooperative payouts; integrate agri-payrolls into mobile wallets |
| Social Transformation | Female agent networks; subsidised smart-feature phones for female heads of household |
| Transformational Governance | MFI digital kiosks at Sector offices; BNR float subsidies for rural agents |

---

### 6. Monitoring & Evaluation KPIs

The District Executive Committee should track the following indicators quarterly via FinScope survey data:

- **Financial exclusion rate reduction:** target âˆ’3 percentage points per year
- **Mobile money penetration:** target â‰¥ 70% within 24 months
- **Gender exclusion gap closure:** target â‰¤ 5 pp difference within 18 months
- **Agent density:** target â‰¥ 1 active agent per 500 adults in rural sectors

---

*Generated by the FIN-GAP RWANDA Mismatch Tool Â· NISR Big Data Hackathon 2026 Â· Source data: FinScope Rwanda 2024 / EICV6*`;
  };

  // â”€â”€ Gemini API path â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!apiKey) {
    return buildFallbackReport();
  }

  const prompt = `You are a senior financial inclusion policy advisor writing for the local government leadership of ${district.district} District, Rwanda.

Using the statistical data below from the FIN-GAP Mismatch Tool, write a concise, authoritative Executive Policy Brief in Markdown format. The brief must:
1. Be written in English, reference Rwanda's NST2 and MINECOFIN / BNR where relevant.
2. Include sections: District Snapshot, Mismatch Gap Analysis, Key Structural Barriers, Priority Policy Recommendations, NST2 Strategic Alignment, and Monitoring & Evaluation KPIs.
3. Be specific to the district's data â€” avoid generic language.
4. Be suitable for printing as a PDF for a government official.

## District Data
- District: ${district.district}
- Province: ${district.province}
- Mismatch Gap: ${district.mismatch_gap} (${gapCategory})
- Intervention Tier: ${interventionTier}
- Exclusion Risk Score: ${district.exclusion_risk_score}/100
- Poverty Rate: ${district.poverty_rate}% (national avg: ${nationalAvgPoverty}%)
- Financial Exclusion Rate: ${district.fully_excluded_rate}% (national avg: ${nationalAvgExclusion}%)
- Mobile Money Rate: ${district.mobile_money_rate}%
- Formal Banking Rate: ${district.banked_rate}%
- Informal-Only (Ikimina): ${district.informal_only_rate}%
- Primary Exclusion Drivers: ${(district.exclusion_drivers || []).join(', ') || 'Not specified'}
- National Mismatch Rank: #${districtRank} of ${allDistricts.length || 30}
- Date: ${new Date().toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric' })}

Keep the brief under 700 words. Use Markdown tables where appropriate. Return only the Markdown document â€” no extra commentary.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1200 },
      },
      { timeout: 30000 }
    );
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini API');
    return text;
  } catch (err) {
    console.warn('Gemini API failed, using deterministic fallback:', err.message);
    return buildFallbackReport();
  }
};

export default api;
