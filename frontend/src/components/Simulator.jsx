import React, { useState, useEffect } from 'react';
import { runSimulation } from '../services/api';

const Simulator = ({ districts, selectedId, onSelectDistrict }) => {
  const [districtId, setDistrictId] = useState(selectedId || (districts.length > 0 ? districts[0].id : ''));
  const [phoneBoost, setPhoneBoost] = useState(0);
  const [agentBoost, setAgentBoost] = useState(0);
  const [literacyBoost, setLiteracyBoost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (selectedId) setDistrictId(selectedId);
  }, [selectedId]);

  const handleSimulate = async () => {
    if (!districtId) return;
    setLoading(true);
    try {
      const data = await runSimulation({
        district_id: parseInt(districtId, 10),
        phone_boost: phoneBoost,
        agent_boost: agentBoost,
        literacy_boost: literacyBoost
      });
      setResult(data);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictChange = (e) => {
    const newId = e.target.value;
    setDistrictId(newId);
    if (onSelectDistrict) onSelectDistrict(parseInt(newId, 10));
    setResult(null); // Clear previous results
  };

  return (
    <div className="glass card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="card-header">
        <h2><i className="fa-solid fa-sliders"></i> Policy Intervention Simulator</h2>
        <div className="card-desc">Simulate the impact of targeted interventions on financial exclusion rates and risk scores.</div>
      </div>

      <div className="sim-layout">
        <div className="sim-controls">
          <div className="sim-select">
            <label>Target District</label>
            <select value={districtId} onChange={handleDistrictChange}>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.district} (Gap: {d.mismatch_gap})</option>
              ))}
            </select>
          </div>

          <div className="slider-box">
            <div className="slider-header">
              <span>📱 Mobile Phone Penetration Boost</span>
              <span className="slider-val">+{phoneBoost}%</span>
            </div>
            <input type="range" min="0" max="50" step="5" value={phoneBoost} onChange={(e) => setPhoneBoost(parseInt(e.target.value, 10))} />
            <small>Subsidizing smartphones or distributing feature phones.</small>
          </div>

          <div className="slider-box">
            <div className="slider-header">
              <span>🏪 Agent Network Density Boost</span>
              <span className="slider-val">+{agentBoost}%</span>
            </div>
            <input type="range" min="0" max="50" step="5" value={agentBoost} onChange={(e) => setAgentBoost(parseInt(e.target.value, 10))} />
            <small>Expanding Mobile Money and banking agents in rural sectors.</small>
          </div>

          <div className="slider-box">
            <div className="slider-header">
              <span>📚 Financial Literacy Coverage Boost</span>
              <span className="slider-val">+{literacyBoost}%</span>
            </div>
            <input type="range" min="0" max="50" step="5" value={literacyBoost} onChange={(e) => setLiteracyBoost(parseInt(e.target.value, 10))} />
            <small>Community radio campaigns and Umuganda outreach.</small>
          </div>

          <button className="btn btn-primary" onClick={handleSimulate} disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-play"></i>} 
            {loading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>

        <div className="sim-results">
          {!result && !loading && (
            <div className="inspector-placeholder" style={{ border: '1px dashed var(--border-glass)', borderRadius: '14px' }}>
              <i className="fa-solid fa-chart-line"></i>
              <h3>Awaiting Simulation</h3>
              <p>Adjust the sliders and click "Run Simulation" to see the projected impact.</p>
            </div>
          )}

          {loading && (
             <div className="inspector-placeholder" style={{ border: '1px dashed var(--border-glass)', borderRadius: '14px' }}>
                <div className="pulse"><i className="fa-solid fa-circle-notch fa-spin"></i> Processing...</div>
             </div>
          )}

          {result && !loading && (
            <div>
              <div className="sim-result-card">
                <h4 className="text-teal">Projected Impact in {result.district.name}</h4>
                <div className="sim-beneficiaries text-emerald mt-2">
                  <i className="fa-solid fa-users"></i> Estimated ~{result.simulated.estimated_beneficiaries.toLocaleString()} newly banked adults
                </div>

                <div className="sim-score-row">
                  <div className="sim-score-item">
                    <span>New Exclusion Rate</span>
                    <h3>{result.simulated.fully_excluded_rate}%</h3>
                    <small className="text-emerald">↓ dropped by {result.simulated.exclusion_rate_reduction}%</small>
                  </div>
                  <div className="sim-score-item">
                    <span>New Risk Score</span>
                    <h3>{result.simulated.exclusion_risk_score}</h3>
                    <small className="text-emerald">↓ dropped by {result.simulated.risk_score_reduction}</small>
                  </div>
                </div>
              </div>

              <div className="glass card" style={{ padding: '16px' }}>
                <div className="section-label" style={{ marginTop: 0 }}><i className="fa-solid fa-code-compare"></i> Baseline vs Simulated</div>
                
                <div className="bar-row mt-3">
                  <div className="bar-header"><span>Baseline Excluded Rate</span> <span>{result.baseline.fully_excluded_rate}%</span></div>
                  <div className="bar-track"><div className="bar-fill fill-red" style={{width: `${result.baseline.fully_excluded_rate}%`}}></div></div>
                </div>
                <div className="bar-row">
                  <div className="bar-header"><span>Simulated Excluded Rate</span> <span className="text-teal">{result.simulated.fully_excluded_rate}%</span></div>
                  <div className="bar-track"><div className="bar-fill fill-teal" style={{width: `${result.simulated.fully_excluded_rate}%`}}></div></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulator;
