import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Province display metadata (matches the `province` names returned by the API)
const PROVINCE_META = {
  'Kigali City':       { short: 'Kigali',  color: '#10b981' },
  'Southern Province': { short: 'South',   color: '#f97316' },
  'Western Province':  { short: 'West',    color: '#ef4444' },
  'Northern Province': { short: 'North',   color: '#f59e0b' },
  'Eastern Province':  { short: 'East',    color: '#3b82f6' }
};

const METRIC_CONFIG = {
  fully_excluded_rate: {
    label: 'Financial Exclusion Rate (%)',
    shortLabel: 'Exclusion',
    unit: '%',
    description: 'Percentage of adults completely excluded from both formal and informal financial services',
    getColor: (val) => {
      if (val >= 20) return '#ef4444'; // Red (Severe)
      if (val >= 15) return '#f97316'; // Orange (High)
      if (val >= 10) return '#f59e0b'; // Amber (Moderate)
      return '#10b981';               // Emerald (Low / Well-Served)
    },
    thresholds: [
      { label: '< 10% (Low Exclusion)', color: '#10b981' },
      { label: '10% - 15% (Moderate)', color: '#f59e0b' },
      { label: '15% - 20% (High)', color: '#f97316' },
      { label: '≥ 20% (Severe Exclusion)', color: '#ef4444' }
    ]
  },
  exclusion_risk_score: {
    label: 'Exclusion Risk Score (0-100)',
    shortLabel: 'Risk Score',
    unit: '/100',
    description: 'Multi-dimensional index combining poverty, distance, literacy, and infrastructure',
    getColor: (val) => {
      if (val >= 65) return '#ef4444';
      if (val >= 50) return '#f97316';
      if (val >= 35) return '#f59e0b';
      return '#10b981';
    },
    thresholds: [
      { label: '< 35 (Low Risk)', color: '#10b981' },
      { label: '35 - 50 (Moderate)', color: '#f59e0b' },
      { label: '50 - 65 (High Risk)', color: '#f97316' },
      { label: '≥ 65 (Critical Risk)', color: '#ef4444' }
    ]
  },
  informal_only_rate: {
    label: 'Informal Finance Only (%)',
    shortLabel: 'Ikimina Only',
    unit: '%',
    description: 'Relies solely on informal savings groups (tontines / Ikimina) with no formal bank or mobile wallet',
    getColor: (val) => {
      if (val >= 24) return '#ef4444';
      if (val >= 18) return '#f97316';
      if (val >= 12) return '#f59e0b';
      return '#10b981';
    },
    thresholds: [
      { label: '< 12% (Low)', color: '#10b981' },
      { label: '12% - 18% (Moderate)', color: '#f59e0b' },
      { label: '18% - 24% (High)', color: '#f97316' },
      { label: '≥ 24% (Critical)', color: '#ef4444' }
    ]
  },
  poverty_rate: {
    label: 'Poverty Rate (%)',
    shortLabel: 'Poverty',
    unit: '%',
    description: 'EICV7 official poverty head-count rate per district',
    getColor: (val) => {
      if (val >= 42) return '#ef4444';
      if (val >= 32) return '#f97316';
      if (val >= 22) return '#f59e0b';
      return '#10b981';
    },
    thresholds: [
      { label: '< 22% (Low Poverty)', color: '#10b981' },
      { label: '22% - 32% (Moderate)', color: '#f59e0b' },
      { label: '32% - 42% (High)', color: '#f97316' },
      { label: '≥ 42% (Extreme Poverty)', color: '#ef4444' }
    ]
  },
  mismatch_gap: {
    label: 'Financial Mismatch Gap',
    shortLabel: 'Mismatch Gap',
    unit: '',
    description: 'Disparity between poverty rate and formal/informal financial service presence',
    getColor: (val) => {
      if (val > 12) return '#ef4444'; // Severely Underserved
      if (val > 4)  return '#f97316'; // Moderately Underserved
      if (val >= -4) return '#3b82f6'; // Balanced
      return '#10b981';               // Well Served
    },
    thresholds: [
      { label: '< -4 (Well-Served)', color: '#10b981' },
      { label: '-4 to +4 (Balanced)', color: '#3b82f6' },
      { label: '+4 to +12 (Moderate Gap)', color: '#f97316' },
      { label: '> +12 (Severe Gap)', color: '#ef4444' }
    ]
  }
};

const districtCoordinates = {
  'Nyarugenge': [-1.95, 30.05], 'Gasabo': [-1.90, 30.15], 'Kicukiro': [-2.00, 30.12],
  'Gisagara': [-2.60, 29.85], 'Nyamagabe': [-2.45, 29.50], 'Nyaruguru': [-2.70, 29.55],
  'Huye': [-2.60, 29.70], 'Nyanza': [-2.35, 29.75], 'Ruhango': [-2.20, 29.75],
  'Muhanga': [-2.05, 29.70], 'Kamonyi': [-2.00, 29.90],
  'Rutsiro': [-1.90, 29.30], 'Nyamasheke': [-2.35, 29.15], 'Ngororero': [-1.85, 29.55],
  'Karongi': [-2.15, 29.35], 'Nyabihu': [-1.65, 29.50], 'Rubavu': [-1.65, 29.30],
  'Rusizi': [-2.55, 28.95],
  'Burera': [-1.45, 29.85], 'Gicumbi': [-1.60, 30.05], 'Musanze': [-1.50, 29.60],
  'Gakenke': [-1.70, 29.75], 'Rulindo': [-1.75, 29.95],
  'Bugesera': [-2.20, 30.15], 'Nyagatare': [-1.30, 30.30], 'Gatsibo': [-1.60, 30.45],
  'Kayonza': [-1.90, 30.65], 'Kirehe': [-2.25, 30.65], 'Ngoma': [-2.15, 30.45],
  'Rwamagana': [-1.95, 30.40]
};

const SVG_COORDS = {
  // Kigali City (Central)
  'Nyarugenge': { x: 440, y: 310, r: 26 },
  'Gasabo':     { x: 480, y: 275, r: 28 },
  'Kicukiro':   { x: 475, y: 345, r: 26 },
  // Northern Province (North)
  'Burera':     { x: 375, y: 110, r: 29 },
  'Musanze':    { x: 295, y: 135, r: 28 },
  'Gicumbi':    { x: 450, y: 170, r: 30 },
  'Gakenke':    { x: 345, y: 215, r: 27 },
  'Rulindo':    { x: 415, y: 235, r: 27 },
  // Western Province (West along Lake Kivu)
  'Rubavu':     { x: 195, y: 185, r: 26 },
  'Nyabihu':    { x: 260, y: 200, r: 27 },
  'Rutsiro':    { x: 185, y: 295, r: 30 },
  'Ngororero':  { x: 265, y: 280, r: 28 },
  'Karongi':    { x: 195, y: 385, r: 30 },
  'Nyamasheke': { x: 145, y: 470, r: 31 },
  'Rusizi':     { x: 100, y: 545, r: 32 },
  // Southern Province (South-Central)
  'Muhanga':    { x: 335, y: 335, r: 28 },
  'Kamonyi':    { x: 395, y: 325, r: 27 },
  'Ruhango':    { x: 345, y: 405, r: 27 },
  'Nyanza':     { x: 345, y: 470, r: 29 },
  'Huye':       { x: 325, y: 540, r: 28 },
  'Gisagara':   { x: 385, y: 560, r: 29 },
  'Nyamagabe':  { x: 265, y: 495, r: 31 },
  'Nyaruguru':  { x: 280, y: 585, r: 30 },
  // Eastern Province (East)
  'Nyagatare':  { x: 555, y: 85,  r: 34 },
  'Gatsibo':    { x: 590, y: 180, r: 33 },
  'Kayonza':    { x: 655, y: 275, r: 34 },
  'Rwamagana':  { x: 550, y: 305, r: 28 },
  'Bugesera':   { x: 470, y: 420, r: 33 },
  'Ngoma':      { x: 580, y: 410, r: 29 },
  'Kirehe':     { x: 660, y: 450, r: 34 }
};

const ExclusionHeatmap = ({ districts = [], onSelectDistrict, selectedId, activeFilter = null, summary = null }) => {
  const [viewMode, setViewMode] = useState('svg'); // 'svg' | 'matrix' | 'grid' | 'leaflet'
  const [metric, setMetric] = useState('fully_excluded_rate');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [sortField, setSortField] = useState('fully_excluded_rate');
  const [sortOrder, setSortOrder] = useState('desc');

  const currentConfig = METRIC_CONFIG[metric];

  // Dim non-matching districts when a KPI card filter is active
  const isHighlighted = (d) => {
    if (!activeFilter || !summary) return true;
    switch (activeFilter) {
      case 'underserved': return d.mismatch_status === 'Severely Underserved';
      case 'excluded': return d.fully_excluded_rate > Number(summary.avg_fully_excluded_rate);
      case 'mobile': return d.mobile_money_rate < Number(summary.avg_mobile_money_rate);
      case 'mismatch': return d.id === summary.worst_district?.id;
      default: return true;
    }
  };

  // Provincial averages derived live from the districts payload
  const provincesSummary = useMemo(() => {
    const groups = {};
    districts.forEach(d => {
      const name = d.province;
      if (!name) return;
      if (!groups[name]) groups[name] = { total: 0, count: 0 };
      groups[name].total += parseFloat(d.fully_excluded_rate) || 0;
      groups[name].count += 1;
    });

    return Object.keys(PROVINCE_META)
      .filter(name => groups[name])
      .map(name => ({
        name,
        short: PROVINCE_META[name].short,
        color: PROVINCE_META[name].color,
        avg_exclusion: (groups[name].total / groups[name].count).toFixed(1)
      }));
  }, [districts]);

  // Filtered districts
  const filteredDistricts = useMemo(() => {
    let list = districts.map(d => ({
      ...d,
      poverty_rate: parseFloat(d.poverty_rate) || 0,
      fully_excluded_rate: parseFloat(d.fully_excluded_rate) || 0,
      exclusion_risk_score: parseFloat(d.exclusion_risk_score) || 0,
      informal_only_rate: parseFloat(d.informal_only_rate) || 0,
      mobile_money_rate: parseFloat(d.mobile_money_rate) || 0,
      banked_rate: parseFloat(d.banked_rate) || 0,
      mismatch_gap: parseFloat(d.mismatch_gap) || 0,
    }));

    if (selectedProvince !== 'All') {
      list = list.filter(d => d.province === selectedProvince);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(d =>
        d.district.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.province.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let va = a[sortField];
      let vb = b[sortField];
      if (typeof va === 'string') {
        return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortOrder === 'asc' ? va - vb : vb - va;
    });

    return list;
  }, [districts, selectedProvince, searchTerm, sortField, sortOrder]);

  // Overall sorted ranking by exclusion rate
  const exclusionRankMap = useMemo(() => {
    const sorted = [...districts].sort((a, b) => parseFloat(b.fully_excluded_rate) - parseFloat(a.fully_excluded_rate));
    const map = {};
    sorted.forEach((d, idx) => {
      map[d.id] = idx + 1;
    });
    return map;
  }, [districts]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="exclusion-heatmap-container">
      {/* Top Banner: Regional Summary Strip */}
      <div className="provincial-strip">
        <div className="strip-title">
          <i className="fa-solid fa-layer-group text-teal"></i>
          <span>Provincial Exclusion Rates:</span>
        </div>
        <div className="strip-items">
          {provincesSummary.map(p => (
            <button
              key={p.name}
              type="button"
              className={`strip-pill ${selectedProvince === p.name ? 'active' : ''}`}
              onClick={() => setSelectedProvince(selectedProvince === p.name ? 'All' : p.name)}
              title={`Click to filter by ${p.name}`}
            >
              <span className="strip-dot" style={{ background: p.color }}></span>
              <span className="strip-name">{p.short}</span>
              <span className="strip-val" style={{ color: p.color }}>{p.avg_exclusion}%</span>
            </button>
          ))}
          {selectedProvince !== 'All' && (
            <button
              type="button"
              className="strip-clear"
              onClick={() => setSelectedProvince('All')}
              title="Show All Provinces"
            >
              <i className="fa-solid fa-xmark"></i> Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="heatmap-toolbar">
        {/* Metric Selector */}
        <div className="toolbar-group">
          <label className="toolbar-label">
            <i className="fa-solid fa-fire text-red"></i> Heatmap Metric:
          </label>
          <div className="metric-toggle-group">
            {Object.keys(METRIC_CONFIG).map(key => (
              <button
                key={key}
                type="button"
                className={`metric-btn ${metric === key ? 'active' : ''}`}
                onClick={() => setMetric(key)}
              >
                {METRIC_CONFIG[key].shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* View Switcher */}
        <div className="toolbar-group">
          <label className="toolbar-label">
            <i className="fa-solid fa-eye text-cyan"></i> View Mode:
          </label>
          <div className="view-mode-tabs">
            <button
              type="button"
              className={`view-btn ${viewMode === 'svg' ? 'active' : ''}`}
              onClick={() => setViewMode('svg')}
              title="Interactive Vector Map (Requires 0 APIs / Works 100% Offline)"
            >
              <i className="fa-solid fa-map"></i> <span>Vector Map (Zero API)</span>
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'matrix' ? 'active' : ''}`}
              onClick={() => setViewMode('matrix')}
              title="Visual Density Heat Matrix & Ranked Table"
            >
              <i className="fa-solid fa-table-cells"></i> <span>Heat Matrix Grid</span>
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'leaflet' ? 'active' : ''}`}
              onClick={() => setViewMode('leaflet')}
              title="OpenStreetMap Dark Tile Map"
            >
              <i className="fa-solid fa-satellite"></i> <span>Satellite Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-toolbar: Search & Province Filter */}
      <div className="heatmap-subbar">
        <div className="subbar-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search district by name (e.g., Rutsiro, Gisagara, Gasabo)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm('')} className="search-clear-btn">
              <i className="fa-solid fa-times"></i>
            </button>
          )}
        </div>

        <div className="subbar-legend">
          <span className="legend-label">Intensity:</span>
          {currentConfig.thresholds.map((t, idx) => (
            <div key={idx} className="legend-chip">
              <span className="legend-color-dot" style={{ background: t.color }}></span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN VIEW CONTAINER */}
      <div className="heatmap-viewport">
        {/* VIEW 1: SVG Vector Heatmap (Zero API Required) */}
        {viewMode === 'svg' && (
          <div className="svg-map-wrapper">
            <div className="svg-map-header">
              <div className="svg-hint">
                <i className="fa-solid fa-circle-info text-teal"></i>
                <span>Showing <strong>{currentConfig.label}</strong> across all 30 districts of Rwanda. Click any district to inspect.</span>
              </div>
              <div className="svg-badge-offline">
                <i className="fa-solid fa-bolt text-emerald"></i>
                <span>Standalone Vector Mode • Zero API Required</span>
              </div>
            </div>

            <div className="svg-canvas-container">
              <svg viewBox="0 0 780 660" className="rwanda-svg-map">
                <defs>
                  {/* Subtle gradients */}
                  <linearGradient id="lakeKivuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.10" />
                  </linearGradient>
                  <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Lake Kivu Artistic Water Body (West border) */}
                <path
                  d="M 60,190 C 80,240 100,290 85,340 C 70,390 95,430 80,480 C 65,520 40,560 60,590 C 40,590 20,530 25,460 C 30,390 35,320 25,250 C 20,200 40,180 60,190 Z"
                  fill="url(#lakeKivuGrad)"
                  stroke="rgba(14, 165, 233, 0.3)"
                  strokeWidth="1.5"
                />
                <text x="45" y="380" fill="rgba(56, 189, 248, 0.5)" fontSize="11" fontStyle="italic" transform="rotate(-90 45,380)">
                  Lake Kivu
                </text>

                {/* Provincial Enclosing Soft Backdrops */}
                <path
                  d="M 230,110 Q 370,80 490,140 Q 430,260 300,250 Z"
                  fill="rgba(245, 158, 11, 0.04)"
                  stroke="rgba(245, 158, 11, 0.15)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text x="360" y="95" fill="rgba(245, 158, 11, 0.5)" fontSize="11" fontWeight="600" textAnchor="middle">
                  NORTHERN PROVINCE
                </text>

                <path
                  d="M 80,180 Q 280,180 290,380 Q 250,560 70,570 Z"
                  fill="rgba(239, 68, 68, 0.04)"
                  stroke="rgba(239, 68, 68, 0.15)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text x="140" y="240" fill="rgba(239, 68, 68, 0.5)" fontSize="11" fontWeight="600" textAnchor="middle">
                  WESTERN
                </text>

                <path
                  d="M 250,330 Q 420,310 410,580 Q 250,620 230,480 Z"
                  fill="rgba(249, 115, 22, 0.04)"
                  stroke="rgba(249, 115, 22, 0.15)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text x="340" y="625" fill="rgba(249, 115, 22, 0.5)" fontSize="11" fontWeight="600" textAnchor="middle">
                  SOUTHERN PROVINCE
                </text>

                <path
                  d="M 450,70 Q 720,80 720,480 Q 470,470 450,260 Z"
                  fill="rgba(59, 130, 246, 0.04)"
                  stroke="rgba(59, 130, 246, 0.15)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text x="630" y="75" fill="rgba(59, 130, 246, 0.5)" fontSize="11" fontWeight="600" textAnchor="middle">
                  EASTERN PROVINCE
                </text>

                <circle cx="465" cy="310" r="55" fill="rgba(16, 185, 129, 0.06)" stroke="rgba(16, 185, 129, 0.3)" strokeDasharray="3 3" />
                <text x="465" y="250" fill="rgba(16, 185, 129, 0.7)" fontSize="10" fontWeight="700" textAnchor="middle">
                  KIGALI CITY
                </text>

                {/* Render District Nodes / Choropleth Tiles */}
                {filteredDistricts.map(d => {
                  const svgCoord = SVG_COORDS[d.district];
                  if (!svgCoord) return null;

                  const metricValue = d[metric];
                  const heatColor = currentConfig.getColor(metricValue);
                  const isSelected = selectedId === d.id;
                  const isHovered = hoveredDistrict?.id === d.id;
                  const rank = exclusionRankMap[d.id];
                  const highlighted = isHighlighted(d);

                  return (
                    <g
                      key={d.id}
                      className="svg-district-node"
                      transform={`translate(${svgCoord.x}, ${svgCoord.y})`}
                      onClick={() => onSelectDistrict(d.id)}
                      onMouseEnter={() => setHoveredDistrict(d)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Selected Pulse Ring */}
                      {isSelected && (
                        <circle
                          r={svgCoord.r + 10}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          opacity="0.9"
                          className="pulse-ring"
                        />
                      )}

                      {/* District Base Circle / Tile */}
                      <circle
                        r={svgCoord.r}
                        fill={heatColor}
                        fillOpacity={!highlighted ? 0.12 : isSelected ? 0.95 : isHovered ? 0.85 : 0.70}
                        stroke={isSelected ? '#ffffff' : isHovered ? '#f8fafc' : 'rgba(255,255,255,0.25)'}
                        strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                        opacity={highlighted ? 1 : 0.35}
                        filter={isSelected || isHovered ? 'url(#glowEffect)' : undefined}
                        style={{
                          transition: 'all 0.2s ease',
                          transform: isHovered ? 'scale(1.12)' : 'scale(1)',
                          transformOrigin: '0 0'
                        }}
                      />

                      {/* District Code / Label */}
                      <text
                        y="-4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={svgCoord.r > 28 ? '11' : '10'}
                        fontWeight="700"
                        letterSpacing="-0.01em"
                        style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                      >
                        {d.district}
                      </text>

                      {/* Metric Value Badge */}
                      <text
                        y="12"
                        textAnchor="middle"
                        fill="#fef08a"
                        fontSize={svgCoord.r > 28 ? '10' : '9'}
                        fontWeight="800"
                        style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                      >
                        {metricValue}{currentConfig.unit}
                      </text>

                      {/* Rank indicator for severe districts */}
                      {rank && rank <= 5 && (
                        <circle cx={svgCoord.r - 4} cy={-svgCoord.r + 4} r="7" fill="#dc2626" stroke="#fff" strokeWidth="1" />
                      )}
                      {rank && rank <= 5 && (
                        <text
                          x={svgCoord.r - 4}
                          y={-svgCoord.r + 7}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="8"
                          fontWeight="800"
                        >
                          #{rank}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Floating Quick Stats Tooltip */}
              {hoveredDistrict && (
                <div
                  className="svg-tooltip-card glass"
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                >
                  <div className="tooltip-header">
                    <div>
                      <span className="tooltip-code">{hoveredDistrict.code}</span>
                      <h4>{hoveredDistrict.district}</h4>
                      <span className="tooltip-province">{hoveredDistrict.province}</span>
                    </div>
                    <span
                      className="tooltip-badge"
                      style={{
                        background: currentConfig.getColor(hoveredDistrict[metric]),
                        color: '#fff'
                      }}
                    >
                      {currentConfig.shortLabel}: {hoveredDistrict[metric]}{currentConfig.unit}
                    </span>
                  </div>

                  <div className="tooltip-metrics">
                    <div className="tooltip-metric-row">
                      <span>Exclusion Rank:</span>
                      <strong className="text-red">#{exclusionRankMap[hoveredDistrict.id]} of 30</strong>
                    </div>
                    <div className="tooltip-metric-row">
                      <span>Fully Excluded:</span>
                      <strong>{hoveredDistrict.fully_excluded_rate}%</strong>
                    </div>
                    <div className="tooltip-metric-row">
                      <span>Mobile Money:</span>
                      <strong>{hoveredDistrict.mobile_money_rate}%</strong>
                    </div>
                    <div className="tooltip-metric-row">
                      <span>Informal (Ikimina):</span>
                      <strong>{hoveredDistrict.informal_only_rate}%</strong>
                    </div>
                    <div className="tooltip-metric-row">
                      <span>Poverty Rate:</span>
                      <strong>{hoveredDistrict.poverty_rate}%</strong>
                    </div>
                    <div className="tooltip-metric-row">
                      <span>Mismatch Gap:</span>
                      <strong className={hoveredDistrict.mismatch_gap > 10 ? 'text-red' : 'text-emerald'}>
                        {hoveredDistrict.mismatch_gap > 0 ? '+' : ''}{hoveredDistrict.mismatch_gap}
                      </strong>
                    </div>
                  </div>
                  <div className="tooltip-footer">Click to inspect full demographic & policy profile</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Heat Matrix & Ranked Table (Zero API Required) */}
        {viewMode === 'matrix' && (
          <div className="matrix-view-container">
            <div className="matrix-view-header">
              <div className="matrix-stats-summary">
                <span>Showing <strong>{filteredDistricts.length}</strong> Districts</span>
                <span className="text-dim">• Sorted by <strong>{METRIC_CONFIG[sortField]?.label || sortField}</strong> ({sortOrder.toUpperCase()})</span>
              </div>
              <div className="matrix-legend-row">
                <span className="legend-chip"><span className="legend-color-dot" style={{ background: '#ef4444' }}></span> Severe (≥20%)</span>
                <span className="legend-chip"><span className="legend-color-dot" style={{ background: '#f97316' }}></span> High (15-20%)</span>
                <span className="legend-chip"><span className="legend-color-dot" style={{ background: '#f59e0b' }}></span> Moderate (10-15%)</span>
                <span className="legend-chip"><span className="legend-color-dot" style={{ background: '#10b981' }}></span> Low (&lt;10%)</span>
              </div>
            </div>

            {/* Visual Heat Cards Grid */}
            <div className="heat-cards-grid">
              {filteredDistricts.map(d => {
                const isSelected = selectedId === d.id;
                const heatColor = currentConfig.getColor(d[metric]);
                const rank = exclusionRankMap[d.id];
                const highlighted = isHighlighted(d);

                return (
                  <div
                    key={d.id}
                    className={`glass heat-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectDistrict(d.id)}
                    style={{ borderLeft: `5px solid ${heatColor}`, opacity: highlighted ? 1 : 0.3 }}
                  >
                    <div className="heat-card-top">
                      <div>
                        <span className="heat-card-rank">#{rank}</span>
                        <h4 className="heat-card-name">{d.district}</h4>
                        <span className="heat-card-province">{d.province}</span>
                      </div>
                      <div className="heat-card-metric" style={{ background: `${heatColor}22`, color: heatColor }}>
                        <span className="metric-val">{d[metric]}{currentConfig.unit}</span>
                        <span className="metric-sub">{currentConfig.shortLabel}</span>
                      </div>
                    </div>

                    {/* Financial Inclusion Stack Bar */}
                    <div className="mini-stack-bar" title="Inclusion Mix: Mobile Money (Teal), Formal Bank (Emerald), Informal (Gold), Excluded (Red)">
                      <div className="stack-seg" style={{ width: `${d.mobile_money_rate * 0.4}%`, background: 'var(--teal)' }}></div>
                      <div className="stack-seg" style={{ width: `${d.banked_rate * 0.4}%`, background: 'var(--emerald)' }}></div>
                      <div className="stack-seg" style={{ width: `${d.informal_only_rate}%`, background: 'var(--gold)' }}></div>
                      <div className="stack-seg" style={{ width: `${d.fully_excluded_rate}%`, background: 'var(--red)' }}></div>
                    </div>

                    <div className="heat-card-stats-row">
                      <div>
                        <span className="lbl">Excluded:</span>
                        <span className="val text-red">{d.fully_excluded_rate}%</span>
                      </div>
                      <div>
                        <span className="lbl">Poverty:</span>
                        <span className="val">{d.poverty_rate}%</span>
                      </div>
                      <div>
                        <span className="lbl">Gap:</span>
                        <span className={`val ${d.mismatch_gap > 10 ? 'text-red' : d.mismatch_gap < 0 ? 'text-emerald' : 'text-gold'}`}>
                          {d.mismatch_gap > 0 ? '+' : ''}{d.mismatch_gap}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Density Heat Matrix Table */}
            <div className="glass table-matrix-card mt-4">
              <div className="table-matrix-header">
                <h3><i className="fa-solid fa-list-ol text-teal"></i> Comparative District Exclusion Matrix</h3>
                <span className="text-dim">Click column headers to sort</span>
              </div>
              <div className="table-scroll-container">
                <table className="heat-matrix-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('fully_excluded_rate')} className="sortable">
                        Rank {sortField === 'fully_excluded_rate' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('district')} className="sortable">
                        District {sortField === 'district' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('province')} className="sortable">
                        Province {sortField === 'province' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('fully_excluded_rate')} className="sortable">
                        Exclusion Rate {sortField === 'fully_excluded_rate' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('exclusion_risk_score')} className="sortable">
                        Risk Score {sortField === 'exclusion_risk_score' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('informal_only_rate')} className="sortable">
                        Informal (Ikimina) {sortField === 'informal_only_rate' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('mobile_money_rate')} className="sortable">
                        Mobile Money {sortField === 'mobile_money_rate' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('banked_rate')} className="sortable">
                        Banked {sortField === 'banked_rate' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('poverty_rate')} className="sortable">
                        Poverty {sortField === 'poverty_rate' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('mismatch_gap')} className="sortable">
                        Mismatch Gap {sortField === 'mismatch_gap' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDistricts.map(d => {
                      const isSelected = selectedId === d.id;
                      const exclColor = METRIC_CONFIG.fully_excluded_rate.getColor(d.fully_excluded_rate);
                      const riskColor = METRIC_CONFIG.exclusion_risk_score.getColor(d.exclusion_risk_score);
                      const rank = exclusionRankMap[d.id];
                      const highlighted = isHighlighted(d);

                      return (
                        <tr
                          key={d.id}
                          className={`matrix-row ${isSelected ? 'row-selected' : ''}`}
                          onClick={() => onSelectDistrict(d.id)}
                          style={{ opacity: highlighted ? 1 : 0.35 }}
                        >
                          <td>
                            <span className="rank-badge">#{rank}</span>
                          </td>
                          <td className="district-cell">
                            <strong>{d.district}</strong>
                            <span className="text-dim text-xs"> ({d.code})</span>
                          </td>
                          <td className="text-dim">{d.province}</td>
                          <td>
                            <span className="matrix-heat-cell" style={{ background: `${exclColor}25`, color: exclColor }}>
                              <strong>{d.fully_excluded_rate}%</strong>
                            </span>
                          </td>
                          <td>
                            <span className="matrix-heat-cell" style={{ background: `${riskColor}25`, color: riskColor }}>
                              {d.exclusion_risk_score}/100
                            </span>
                          </td>
                          <td>{d.informal_only_rate}%</td>
                          <td>{d.mobile_money_rate}%</td>
                          <td>{d.banked_rate}%</td>
                          <td>{d.poverty_rate}%</td>
                          <td>
                            <span className={`pill ${d.mismatch_gap > 10 ? 'pill-severe' : d.mismatch_gap < 0 ? 'pill-served' : 'pill-moderate'}`}>
                              {d.mismatch_gap > 0 ? '+' : ''}{d.mismatch_gap}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Leaflet Tile Map (Tile-based) */}
        {viewMode === 'leaflet' && (
          <div className="leaflet-map-wrapper chart-wrapper">
            <MapContainer
              center={[-1.9403, 29.8739]}
              zoom={8.5}
              style={{ height: '100%', width: '100%', borderRadius: '14px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredDistricts.map(d => {
                const coords = districtCoordinates[d.district];
                if (!coords) return null;

                const isSelected = selectedId === d.id;
                const heatColor = currentConfig.getColor(d[metric]);
                const highlighted = isHighlighted(d);

                return (
                  <CircleMarker
                    key={d.id}
                    center={coords}
                    pathOptions={{
                      color: isSelected ? '#ffffff' : heatColor,
                      fillColor: heatColor,
                      fillOpacity: highlighted ? (isSelected ? 0.95 : 0.75) : 0.15,
                      weight: isSelected ? 3 : 1,
                      opacity: highlighted ? 1 : 0.15
                    }}
                    radius={isSelected ? 14 : highlighted ? 9 : 5}
                    eventHandlers={{
                      click: () => onSelectDistrict(d.id),
                    }}
                  >
                    <Popup>
                      <div style={{ color: '#111827', minWidth: '170px', padding: '4px' }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '6px' }}>
                          {d.district} ({d.code})
                        </div>
                        <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                          <strong>{currentConfig.shortLabel}:</strong> <span style={{ color: heatColor, fontWeight: '700' }}>{d[metric]}{currentConfig.unit}</span>
                        </div>
                        <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                          <strong>Exclusion Rate:</strong> {d.fully_excluded_rate}%
                        </div>
                        <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                          <strong>Mobile Money:</strong> {d.mobile_money_rate}%
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          <strong>Poverty Rate:</strong> {d.poverty_rate}%
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExclusionHeatmap;
