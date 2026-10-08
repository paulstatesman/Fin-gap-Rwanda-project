import React from 'react';

const Methodology = () => {
  return (
    <div className="glass card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="card-header">
        <h2><i className="fa-solid fa-microscope"></i> Data Methodology & The "Mismatch Gap"</h2>
        <div className="card-desc">Understanding the core algorithm powering FIN-GAP RWANDA.</div>
      </div>

      <div className="method-body">
        <p>
          The core innovation of the <strong>FIN-GAP RWANDA</strong> project is moving beyond standard descriptive statistics (e.g., "District X has 25% financial exclusion") to a predictive and analytical model we call the <strong>Mismatch Gap</strong>.
        </p>

        <h3>1. The Data Sources</h3>
        <p>This tool integrates microdata from two primary national surveys conducted by the National Institute of Statistics of Rwanda (NISR):</p>
        <ul>
          <li><strong>EICV7 (2023-2024):</strong> Provides the baseline poverty rates, household consumption data, and demographic structure per district.</li>
          <li><strong>FinScope Rwanda 2024:</strong> Provides the financial access metrics (Banked, Mobile Money, Informal, Fully Excluded) per district.</li>
        </ul>

        <h3>2. Defining the "Mismatch Gap"</h3>
        <p>
          Poverty is the strongest predictor of financial exclusion. We expect districts with high poverty to have high exclusion. However, the raw exclusion rate doesn't tell us if a district is performing <em>better or worse</em> than its poverty level dictates. 
        </p>
        <p>
          We calculate the <strong>Expected Exclusion Rate</strong> based on a linear regression model tying national poverty to national exclusion. For this hackathon prototype, we use a simplified correlation factor derived from the data:
        </p>
        
        <div className="formula-box">
          Expected Exclusion ≈ (Poverty Rate × 0.45)<br/><br/>
          Mismatch Gap = Actual Fully Excluded Rate - Expected Exclusion Rate
        </div>

        <h3>3. Interpreting the Gap</h3>
        <ul>
          <li><strong>Positive Gap (e.g., +15):</strong> <span className="text-red">Severely Underserved.</span> The district has 15% more financial exclusion than its poverty rate predicts. <em>(Structural barriers exist: distance to agents, network coverage, literacy).</em></li>
          <li><strong>Near Zero Gap (e.g., ±5):</strong> <span className="text-gold">Balanced.</span> Financial exclusion perfectly mirrors the poverty rate.</li>
          <li><strong>Negative Gap (e.g., -10):</strong> <span className="text-emerald">Well-Served.</span> The district has 10% less financial exclusion than its poverty rate predicts. <em>(Strong interventions or unique economic drivers exist).</em></li>
        </ul>

        <h3>4. The Policy Simulator Model</h3>
        <p>
          The simulator uses weighted coefficients derived from previous BNR impact assessments to project the reduction in the exclusion risk score:
        </p>
        <div className="formula-box" style={{ borderLeftColor: 'var(--teal)' }}>
          Risk Reduction = (PhoneBoost × 0.45) + (AgentBoost × 0.35) + (LiteracyBoost × 0.20)
        </div>
        <p>
          This demonstrates how targeted interventions (like subsidizing phones) can have a mathematically modeled impact on a specific district's exclusion rate.
        </p>

        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-glass)' }}>
          <h3>Tech Stack (Hackathon Prototype)</h3>
          <ul>
            <li><strong>Frontend:</strong> React.js, Chart.js (Scatter Plot), Leaflet (Interactive Map).</li>
            <li><strong>Backend:</strong> PHP (Custom REST API endpoints).</li>
            <li><strong>Database:</strong> PostgreSQL (normalized tables for districts, demographics, drivers, and policies).</li>
            <li><strong>Design:</strong> Custom CSS (Dark Glassmorphism) for a premium GovTech aesthetic.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Methodology;
