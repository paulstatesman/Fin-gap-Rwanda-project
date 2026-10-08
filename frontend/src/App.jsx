import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KPIBanner from './components/KPIBanner';
import DistrictTable from './components/DistrictTable';
import DistrictInspector from './components/DistrictInspector';
import MismatchChart from './components/MismatchChart';
import Simulator from './components/Simulator';
import PolicyBrief from './components/PolicyBrief';
import Methodology from './components/Methodology';
import RwandaMap from './components/RwandaMap';
import { fetchDistricts, fetchNationalSummary } from './services/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('heatmap');
  const [districts, setDistricts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Using Promise.all to fetch data in parallel
        const [districtsData, summaryData] = await Promise.all([
          fetchDistricts(),
          fetchNationalSummary()
        ]);
        setDistricts(districtsData.data);
        setSummary(summaryData.data);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data from the backend. Ensure the PHP server is running.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDistrictSelect = (districtId) => {
    setSelectedDistrict(districtId);
    // If we're on a tab that doesn't show the inspector, switch to matrix or heatmap
    if (activeTab !== 'heatmap' && activeTab !== 'matrix' && activeTab !== 'simulator') {
      setActiveTab('heatmap');
    }
  };

  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="page-container">
        {error && <div className="error-box"><i className="fa-solid fa-triangle-exclamation"></i> {error}</div>}
        
        {loading ? (
          <div className="skeleton" style={{ height: '200px', width: '100%', marginBottom: '24px' }}></div>
        ) : (
          summary && <KPIBanner summary={summary} />
        )}

        <div className="tab-content">
          {activeTab === 'heatmap' && (
            <div className="dashboard-grid">
              <div className="glass card">
                <div className="card-header">
                  <h2><i className="fa-solid fa-map-location-dot"></i> Geographical Exclusion Heatmap</h2>
                </div>
                <RwandaMap districts={districts} onSelectDistrict={handleDistrictSelect} selectedId={selectedDistrict} />
              </div>
              <div className="glass card">
                <DistrictInspector districtId={selectedDistrict} />
              </div>
            </div>
          )}

          {activeTab === 'matrix' && (
            <div className="dashboard-grid">
              <div className="glass card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="card-header">
                  <h2><i className="fa-solid fa-chart-scatter"></i> Mismatch Matrix Analysis</h2>
                </div>
                <MismatchChart districts={districts} onSelectDistrict={handleDistrictSelect} />
                <div className="mt-4">
                  <DistrictTable districts={districts} onSelectDistrict={handleDistrictSelect} selectedId={selectedDistrict} />
                </div>
              </div>
              <div className="glass card">
                <DistrictInspector districtId={selectedDistrict} />
              </div>
            </div>
          )}

          {activeTab === 'simulator' && (
            <Simulator districts={districts} selectedId={selectedDistrict} onSelectDistrict={handleDistrictSelect} />
          )}

          {activeTab === 'policy' && (
            <PolicyBrief />
          )}

          {activeTab === 'methodology' && (
            <Methodology />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>FIN-GAP RWANDA &copy; 2026. Built for NISR Big Data Hackathon (Track 2).</p>
      </footer>
    </div>
  );
};

export default App;
