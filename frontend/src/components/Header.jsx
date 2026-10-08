import React from 'react';

const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <div className="brand-logo">
            <i className="fa-solid fa-chart-pie"></i>
          </div>
          <div>
            <h1 className="brand-title">FIN-GAP RWANDA</h1>
            <div className="brand-sub">District & Sector Financial Exclusion Mismatch Tool</div>
          </div>
        </div>
        
        <div className="header-badges">
          <span className="badge badge-track"><i className="fa-solid fa-trophy"></i> NISR Track 2</span>
          <span className="badge badge-data"><i className="fa-solid fa-database"></i> EICV7 + FinScope 2024</span>
          <span className="badge badge-live pulse"><i className="fa-solid fa-circle-dot"></i> Live Data Mode</span>
        </div>
      </div>

      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'heatmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('heatmap')}
        >
          <i className="fa-solid fa-map-location-dot"></i> Exclusion Heatmap
        </button>
        <button 
          className={`nav-tab ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          <i className="fa-solid fa-chart-scatter"></i> Mismatch Matrix
        </button>
        <button 
          className={`nav-tab ${activeTab === 'simulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulator')}
        >
          <i className="fa-solid fa-sliders"></i> Policy Simulator
        </button>
        <button 
          className={`nav-tab ${activeTab === 'policy' ? 'active' : ''}`}
          onClick={() => setActiveTab('policy')}
        >
          <i className="fa-solid fa-file-contract"></i> Policy Brief
        </button>
        <button 
          className={`nav-tab ${activeTab === 'methodology' ? 'active' : ''}`}
          onClick={() => setActiveTab('methodology')}
        >
          <i className="fa-solid fa-microscope"></i> Methodology
        </button>
      </div>
    </header>
  );
};

export default Header;
