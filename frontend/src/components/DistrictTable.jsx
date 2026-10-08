import React, { useState } from 'react';

const DistrictTable = ({ districts, selectedId, onSelectDistrict }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredDistricts = districts.filter(d => {
    const matchesSearch = d.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.mismatch_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusPill = (status) => {
    switch(status) {
      case 'Severely Underserved': return <span className="pill pill-severe">{status}</span>;
      case 'Moderately Underserved': return <span className="pill pill-moderate">{status}</span>;
      case 'Balanced': return <span className="pill pill-balanced">{status}</span>;
      case 'Well-Served': return <span className="pill pill-served">{status}</span>;
      default: return <span className="pill">{status}</span>;
    }
  };

  return (
    <div className="table-container">
      <div className="controls-bar">
        <div className="search-wrap">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input 
            type="text" 
            placeholder="Search district..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Severely Underserved">Severely Underserved</option>
            <option value="Moderately Underserved">Moderately Underserved</option>
            <option value="Balanced">Balanced</option>
            <option value="Well-Served">Well-Served</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="district-table">
          <thead>
            <tr>
              <th>District</th>
              <th>Poverty Rate</th>
              <th>Mobile Money</th>
              <th>Banked</th>
              <th>Fully Excluded</th>
              <th>Mismatch Gap</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredDistricts.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign: 'center', padding: '30px'}}>No districts found matching filters.</td></tr>
            ) : (
              filteredDistricts.map(d => (
                <tr 
                  key={d.id} 
                  className={selectedId === d.id ? 'selected' : ''}
                  onClick={() => onSelectDistrict(d.id)}
                >
                  <td><strong>{d.district}</strong> <span className="text-dim">({d.province})</span></td>
                  <td>{d.poverty_rate}%</td>
                  <td>{d.mobile_money_rate}%</td>
                  <td>{d.banked_rate}%</td>
                  <td><span className={d.fully_excluded_rate > 20 ? 'text-red' : ''}>{d.fully_excluded_rate}%</span></td>
                  <td>
                    <strong className={d.mismatch_gap > 10 ? 'text-red' : d.mismatch_gap < 0 ? 'text-emerald' : 'text-gold'}>
                      {d.mismatch_gap > 0 ? '+' : ''}{d.mismatch_gap}
                    </strong>
                  </td>
                  <td>{getStatusPill(d.mismatch_status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DistrictTable;
