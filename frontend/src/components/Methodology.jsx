import React, { useState, useEffect } from 'react';
import { fetchModel } from '../services/api';

const Methodology = () => {
  const [model, setModel] = useState(null);
  const [modelError, setModelError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchModel()
      .then(data => {
        if (!cancelled) setModel(data);
      })
      .catch(err => {
        console.error('Could not load model metadata:', err);
        if (!cancelled) setModelError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const format = (value, digits = 2) =>
    value === null || value === undefined ? '—' : Number(value).toFixed(digits);

  const gapModel = model && model.available ? model.mismatch_gap_model : null;
  const interventionModel = model && model.available ? model.intervention_model : null;

  return (
    <div className="glass card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="card-header">
        <h2><i className="fa-solid fa-microscope"></i> Data Methodology &amp; The "Mismatch Gap"</h2>
        <div className="card-desc">Understanding the core algorithm powering FIN-GAP RWANDA.</div>
      </div>

      <div className="method-body">
        <p>
          The core innovation of <strong>FIN-GAP RWANDA</strong> is moving beyond descriptive
          statistics (e.g. "District X has 25% financial exclusion") to a diagnostic model we call
          the <strong>Mismatch Gap</strong>: how far a district's exclusion deviates from what its
          poverty level predicts. A large positive gap means structural barriers are suppressing
          inclusion beyond what poverty alone explains.
        </p>

        <h3>1. Alignment with National Priorities</h3>
        <p>
          The tool is designed to support two pillars of Rwanda's{' '}
          <strong>National Strategy for Transformation (NST2, 2024&ndash;2029)</strong>:
        </p>
        <ul>
          <li>
            <strong>Economic Transformation &mdash; "Resilient and broadened financial sector for
            private sector growth":</strong> the Mismatch Matrix and heatmap show where the financial
            sector is structurally failing to reach the population.
          </li>
          <li>
            <strong>Social Transformation &mdash; "Enhanced graduation from poverty and increased
            resilience":</strong> the policy briefs connect exclusion hotspots to concrete,
            district-level interventions by named institutions (BNR, MINICT, MINECOFIN, MINAGRI).
          </li>
        </ul>
        <p>
          This supports the{' '}
          <a href="https://www.minecofin.gov.rw" target="_blank" rel="noreferrer">
            Vision 2050
          </a>{' '}
          ambition of universal access to financial services by turning national survey data into a
          district-level prioritisation tool.
        </p>

        <h3>2. Data Sources</h3>
        <p>
          The indicators modelled here mirror the structure of two Rwanda sources. Both should be
          obtained through their official channels before production use:
        </p>
        <ul>
          <li>
            <strong>EICV7 (2023/24) &mdash; National Institute of Statistics of Rwanda (NISR).</strong>{' '}
            Provides poverty rates, household consumption and demographic structure per district.
            Available from the{' '}
            <a href="https://microdata.statistics.gov.rw/index.php/catalog" target="_blank" rel="noreferrer">
              NISR Microdata Portal
            </a>{' '}
            (registration + access request required).
          </li>
          <li>
            <strong>FinScope Rwanda 2024 &mdash; Access to Finance Rwanda (AFR), with MINECOFIN, BNR and NISR.</strong>{' '}
            Provides the financial access strands (banked, other formal, informal only, excluded).
            Recommended citation: <em>Access to Finance Rwanda, FinScope 2024 report, June 2024.</em>{' '}
            See the{' '}
            <a
              href="https://www.minecofin.gov.rw/fileadmin/user_upload/Minecofin/Publications/REPORTS/Finance_Sector_Development/Rwanda-Finscope-2024-Report_.pdf"
              target="_blank"
              rel="noreferrer"
            >
              FinScope 2024 report
            </a>{' '}
            and{' '}
            <a href="https://www.afr.rw" target="_blank" rel="noreferrer">afr.rw</a>.
          </li>
        </ul>

        <div className="formula-box" style={{ borderLeftColor: 'var(--gold)' }}>
          <strong>Prototype data notice.</strong><br />
          The dataset bundled in <code>database/seed.sql</code> is an <strong>illustrative,
          synthetic dataset</strong> built to match the column structure and approximate ranges of
          the real sources above, so the prototype runs without restricted microdata. It is
          <strong> not official NISR or AFR statistics</strong>. Findings are methodologically valid
          but the specific district figures must be replaced with the real microdata (via the portal
          links above) before any policy use.
        </div>

        <h3>3. Defining the "Mismatch Gap"</h3>
        <p>
          Poverty is the strongest single predictor of financial exclusion, so high-poverty
          districts are <em>expected</em> to have high exclusion. Raw exclusion figures cannot tell
          us whether a district is doing worse than that expectation. We therefore fit an
          Ordinary Least Squares regression of exclusion on poverty:
        </p>
        <div className="formula-box">
          Expected Exclusion = intercept + slope &times; Poverty Rate<br /><br />
          Mismatch Gap = Actual Fully Excluded Rate &minus; Expected Exclusion
        </div>

        <div className="section-label" style={{ marginTop: '20px' }}>
          <i className="fa-solid fa-square-root-variable"></i> Fitted on live data
        </div>
        {gapModel && (
          <ul>
            <li><strong>Expected Exclusion</strong> = {format(gapModel.intercept, 3)} + {format(gapModel.poverty_slope, 4)} &times; Poverty Rate</li>
            <li><strong>R&sup2;</strong> = {format(gapModel.r_squared, 3)} &nbsp;&middot;&nbsp; <strong>Observations</strong> = {gapModel.n}</li>
          </ul>
        )}
        {!gapModel && (
          <p>
            {modelError
              ? 'The regression could not be fitted from the live API at this time.'
              : 'Fitting the regression from the live district data…'}
          </p>
        )}

        <h3>4. Interpreting the Gap</h3>
        <ul>
          <li><strong>Positive Gap:</strong> <span className="text-red">Severely Underserved.</span> Exclusion is higher than poverty predicts &mdash; structural barriers such as distance to agents, network coverage or literacy are at work.</li>
          <li><strong>Near Zero Gap:</strong> <span className="text-gold">Balanced.</span> Exclusion closely tracks the poverty rate.</li>
          <li><strong>Negative Gap:</strong> <span className="text-emerald">Well-Served.</span> Exclusion is lower than poverty predicts &mdash; evidence of effective interventions or unique local economic drivers.</li>
        </ul>

        <h3>5. The Policy Simulator Model</h3>
        <p>
          Rather than applying fixed weights, the simulator fits a second regression of exclusion on
          three intervention-relevant indicators &mdash; mobile money penetration, formal banking
          access and the share of adults with primary education or less &mdash; and reads the fitted
          coefficients as the marginal effect of each intervention:
        </p>
        <div className="formula-box" style={{ borderLeftColor: 'var(--teal)' }}>
          &Delta;Exclusion = c<sub>mobile</sub> &times; PhoneBoost<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ c<sub>banked</sub> &times; AgentBoost<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ c<sub>education</sub> &times; (&minus;LiteracyBoost)
        </div>

        {interventionModel && (
          <ul>
            <li><strong>Method:</strong> {interventionModel.method === 'multiple_ols' ? 'multiple OLS regression' : 'per-driver univariate OLS — the joint fit was rejected because collinear access indicators produced an economically implausible sign'}</li>
            <li>
              <strong>Coefficients:</strong>{' '}
              {interventionModel.coefficients
                ? interventionModel.coefficients.map((c, i) => `${interventionModel.predictors[i]} = ${format(c, 4)}`).join('  ·  ')
                : '—'}
            </li>
            <li><strong>R&sup2;</strong> = {format(interventionModel.r_squared, 3)} &nbsp;&middot;&nbsp; <strong>Observations</strong> = {interventionModel.n}</li>
          </ul>
        )}

        <h3>6. Limitations &amp; Next Steps</h3>
        <ul>
          <li>The bundled indicators are illustrative, not official statistics &mdash; load the real EICV7 and FinScope microdata to produce policy-grade figures.</li>
          <li>District-level FinScope estimates carry sampling uncertainty; confidence intervals should accompany any published ranking.</li>
          <li>Next iterations will add spatial covariates (road distance, mobile network coverage) and a satellite-derived settlement layer to better explain residual exclusion.</li>
        </ul>

        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-glass)' }}>
          <h3>Tech Stack (Hackathon Prototype)</h3>
          <ul>
            <li><strong>Frontend:</strong> React.js, Chart.js (Mismatch Matrix), Leaflet (Interactive Map).</li>
            <li><strong>Backend:</strong> PHP (custom REST API; OLS regression implemented from scratch).</li>
            <li><strong>Database:</strong> PostgreSQL (normalised tables for districts, demographics, drivers and policies).</li>
            <li><strong>Design:</strong> Custom CSS (dark glassmorphism) for a GovTech aesthetic.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Methodology;
