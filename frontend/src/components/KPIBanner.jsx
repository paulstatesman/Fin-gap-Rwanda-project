import React from 'react';

const KPIBanner = ({ summary }) => {
  return (
    <div className="kpi-banner">
      <div className="glass kpi-card">
        <div className="kpi-icon icon-red">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div>
          <div className="kpi-label">Severely Underserved</div>
          <div className="kpi-value">{summary.severely_underserved_count}</div>
          <div className="kpi-sub text-dim">Out of 30 Districts</div>
        </div>
      </div>
      
      <div className="glass kpi-card">
        <div className="kpi-icon icon-orange">
          <i className="fa-solid fa-users-slash"></i>
        </div>
        <div>
          <div className="kpi-label">National Avg Excluded</div>
          <div className="kpi-value">{summary.avg_fully_excluded_rate}%</div>
          <div className="kpi-sub text-dim">No financial access</div>
        </div>
      </div>

      <div className="glass kpi-card">
        <div className="kpi-icon icon-teal">
          <i className="fa-solid fa-mobile-screen"></i>
        </div>
        <div>
          <div className="kpi-label">National Mobile Money</div>
          <div className="kpi-value">{summary.avg_mobile_money_rate}%</div>
          <div className="kpi-sub text-dim">Usage rate</div>
        </div>
      </div>

      <div className="glass kpi-card" style={{ border: '1px solid rgba(245,158,11,0.3)', boxShadow: '0 0 20px rgba(245,158,11,0.1)' }}>
        <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--gold)' }}>
          <i className="fa-solid fa-bullseye"></i>
        </div>
        <div>
          <div className="kpi-label text-gold">Worst Mismatch Gap</div>
          <div className="kpi-value text-gold">+{summary.worst_district?.mismatch_gap}</div>
          <div className="kpi-sub text-dim">{summary.worst_district?.name} District</div>
        </div>
      </div>
    </div>
  );
};

export default KPIBanner;
