import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Approximate coordinates for the 30 districts (Center of district)
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

const RwandaMap = ({ districts, onSelectDistrict, selectedId }) => {
  // Center of Rwanda
  const position = [-1.9403, 29.8739];

  const getColor = (gap) => {
    if (gap > 15) return '#ef4444'; // Red (Severe)
    if (gap > 5)  return '#f59e0b'; // Gold (Moderate)
    if (gap > -5) return '#3b82f6'; // Blue (Balanced)
    return '#10b981';               // Emerald (Well Served)
  };

  return (
    <div className="chart-wrapper">
      <MapContainer center={position} zoom={8.5} style={{ height: '100%', width: '100%', borderRadius: '14px' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {districts.map(d => {
          const coords = districtCoordinates[d.district];
          if (!coords) return null;
          
          const isSelected = selectedId === d.id;
          
          return (
            <CircleMarker
              key={d.id}
              center={coords}
              pathOptions={{
                color: isSelected ? '#fff' : getColor(d.mismatch_gap),
                fillColor: getColor(d.mismatch_gap),
                fillOpacity: 0.7,
                weight: isSelected ? 3 : 1
              }}
              radius={isSelected ? 12 : 8}
              eventHandlers={{
                click: () => onSelectDistrict(d.id),
              }}
            >
              <Popup>
                <div style={{ color: '#333', minWidth: '150px' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{d.district}</h4>
                  <div style={{ fontSize: '12px', marginBottom: '3px' }}><strong>Gap:</strong> {d.mismatch_gap}</div>
                  <div style={{ fontSize: '12px' }}><strong>Poverty:</strong> {d.poverty_rate}%</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default RwandaMap;
