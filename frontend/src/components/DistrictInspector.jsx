import React, { useState, useEffect } from 'react';
import { fetchDistrict } from '../services/api';

const DistrictInspector = ({ districtId }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!districtId) return;
    
    const loadDetails = async () => {
      setLoading(true);
      try {
        const data = await fetchDistrict(districtId);
        setDetails(data);
      } catch (err) {
        console.error("Failed to fetch district details", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDetails();
  }, [districtId]);

  if (!districtId) {
    return (
      <div className="inspector-placeholder">
        <i className="fa-solid fa-hand-pointer"></i>
        <h3>Select a District</h3>
        <p>Click on a district on the map or in the table to view its full exclusion profile, demographic breakdown, and targeted policy recommendations.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="inspector-placeholder"><div className="pulse"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div></div>;
  }

  if (!details) return null;

  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <div className="district-title-row">
          <h3>{details.district}</h3>
          <span className={`pill ${details.mismatch_gap > 10 ? 'pill-severe' : details.mismatch_gap < 0 ? 'pill-served' : 'pill-moderate'}`}>
            Gap: {details.mismatch_gap > 0 ? '+' : ''}{details.mismatch_gap}
          </span>
        </div>
        <div className="text-dim"><i className="fa-solid fa-map-pin"></i> {details.province}</div>
      </div>

      <div className="section-label"><i className="fa-solid fa-chart-simple"></i> Core Metrics</div>
      <div className="metrics-grid-2">
        <div className="metric-box">
          <span>Poverty Rate</span>
          <h4>{details.poverty_rate}%</h4>
        </div>
        <div className="metric-box">
          <span>Risk Score</span>
          <h4 className="text-red">{details.exclusion_risk_score}/100</h4>
        </div>
      </div>

      <div className="section-label"><i className="fa-solid fa-wallet"></i> Financial Access Breakdown</div>
      <div className="bar-row">
        <div className="bar-header"><span>Mobile Money</span> <span>{details.mobile_money_rate}%</span></div>
        <div className="bar-track"><div className="bar-fill fill-teal" style={{width: `${details.mobile_money_rate}%`}}></div></div>
      </div>
      <div className="bar-row">
        <div className="bar-header"><span>Formal Banking</span> <span>{details.banked_rate}%</span></div>
        <div className="bar-track"><div className="bar-fill fill-emerald" style={{width: `${details.banked_rate}%`}}></div></div>
      </div>
      <div className="bar-row">
        <div className="bar-header"><span>Informal Only (Ikimina)</span> <span>{details.informal_only_rate}%</span></div>
        <div className="bar-track"><div className="bar-fill fill-gold" style={{width: `${details.informal_only_rate}%`}}></div></div>
      </div>
      <div className="bar-row">
        <div className="bar-header"><span>Fully Excluded</span> <span className="text-red">{details.fully_excluded_rate}%</span></div>
        <div className="bar-track"><div className="bar-fill fill-red" style={{width: `${details.fully_excluded_rate}%`}}></div></div>
      </div>

      {details.exclusion_drivers && details.exclusion_drivers.length > 0 && (
        <>
          <div className="section-label mt-4"><i className="fa-solid fa-road-barrier"></i> Primary Exclusion Drivers</div>
          <div className="driver-tags">
            {details.exclusion_drivers.map((driver, i) => (
              <span key={i} className="driver-tag">{driver}</span>
            ))}
          </div>
        </>
      )}

      {details.policy_recommendations && details.policy_recommendations.length > 0 && (
        <>
          <div className="section-label"><i className="fa-solid fa-lightbulb"></i> Policy Recommendations</div>
          <ul className="policy-list">
            {details.policy_recommendations.map((policy, i) => (
              <li key={i} className="policy-item">
                <span className="policy-target">{policy.target_body}</span>
                {policy.recommendation}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default DistrictInspector;
