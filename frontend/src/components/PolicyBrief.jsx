import React from 'react';

const PolicyBrief = () => {
  return (
    <div className="glass card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="card-header">
        <h2><i className="fa-solid fa-file-contract"></i> Executive Policy Brief</h2>
        <div className="card-desc">Actionable recommendations aligned with NST2 (National Strategy for Transformation).</div>
      </div>

      <div className="policy-doc">
        <p>
          Based on the findings from the <strong>FIN-GAP RWANDA Mismatch Tool</strong>, bridging the financial inclusion gap requires shifting from a blanket national approach to targeted, district-specific interventions. The data clearly shows that districts with similar poverty levels (e.g., Gisagara and Rutsiro) often face entirely different structural barriers to inclusion.
        </p>

        <h3>Strategic Alignment with NST2 Priorities</h3>
        
        <table className="nst2-table">
          <thead>
            <tr>
              <th>NST2 Pillar</th>
              <th>FIN-GAP Finding</th>
              <th>Recommended Policy Action (MINECOFIN / BNR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Economic Transformation</strong><br/><span className="text-dim">Job Creation & Agriculture</span></td>
              <td>Deep reliance on informal savings (Ikimina) in rural agricultural districts (e.g., Nyanza, Gatsibo) despite growing mobile money usage.</td>
              <td>Digitize VSLA (Village Savings and Loan Associations) and integrate agricultural cooperative payouts directly into mobile wallets.</td>
            </tr>
            <tr>
              <td><strong>Social Transformation</strong><br/><span className="text-dim">Eradicating Extreme Poverty</span></td>
              <td>Severely Underserved districts show a massive gender gap in financial access and phone ownership (e.g., Rutsiro female exclusion at 31%).</td>
              <td>Launch the <strong>"Agent Kazi"</strong> female agent network pilot and subsidize smart-feature phones for female heads of households.</td>
            </tr>
            <tr>
              <td><strong>Transformational Governance</strong><br/><span className="text-dim">Service Delivery</span></td>
              <td>Remote districts with harsh topography (Ngororero, Nyaruguru) suffer from high agent distance barriers.</td>
              <td>Mandate BNR cash-float subsidies for agents operating in extreme rural sectors to ensure liquidity. Establish shared MFI digital kiosks at Sector offices.</td>
            </tr>
          </tbody>
        </table>

        <h3>The "Mismatch" Intervention Strategy</h3>
        <p>
          Districts fall into three categories based on their Mismatch Gap, dictating the type of intervention needed:
        </p>

        <div className="policy-grid">
          <div className="policy-box" style={{ borderLeft: '4px solid var(--red)' }}>
            <h4 className="text-red">1. High Positive Gap (Severely Underserved)</h4>
            <p className="text-dim mt-2" style={{ fontSize: '12px' }}>Districts like Gisagara & Rutsiro where exclusion is much worse than poverty alone explains.</p>
            <ul className="mt-2">
              <li>Infrastructure first: Incentivize telco network expansion.</li>
              <li>Agent liquidity subsidies to ensure rural cash-in/cash-out reliability.</li>
              <li>Offline-capable (USSD) micro-savings tools.</li>
            </ul>
          </div>
          
          <div className="policy-box" style={{ borderLeft: '4px solid var(--emerald)' }}>
            <h4 className="text-emerald">2. Negative Gap (Well-Served / Over-performing)</h4>
            <p className="text-dim mt-2" style={{ fontSize: '12px' }}>Districts like Nyarugenge & Rubavu that have overcome baseline poverty constraints.</p>
            <ul className="mt-2">
              <li>Transition from access to usage: Promote micro-insurance and digital credit.</li>
              <li>Expand merchant QR code payments for informal urban traders.</li>
              <li>Promote retail investment and EjoHeza digital pension plans.</li>
            </ul>
          </div>
        </div>

        <div className="ai-note mt-4">
          <i className="fa-solid fa-robot"></i> <strong>Note on Hackathon Integration:</strong> In a production environment, this tab could dynamically generate localized policy PDF reports for District Mayors (Uturere) using a LLM backend API, drawing insights directly from the Mismatch Matrix.
        </div>
      </div>
    </div>
  );
};

export default PolicyBrief;
