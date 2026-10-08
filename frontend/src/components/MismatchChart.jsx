import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const MismatchChart = ({ districts, onSelectDistrict }) => {
  const data = {
    datasets: [
      {
        label: 'Districts',
        data: districts.map(d => ({
          x: d.poverty_rate,
          y: d.fully_excluded_rate,
          district: d.district,
          id: d.id,
          gap: d.mismatch_gap
        })),
        backgroundColor: districts.map(d => {
          if (d.mismatch_gap > 15) return 'rgba(239, 68, 68, 0.8)';
          if (d.mismatch_gap > 5)  return 'rgba(245, 158, 11, 0.8)';
          if (d.mismatch_gap > -5) return 'rgba(59, 130, 246, 0.8)';
          return 'rgba(16, 185, 129, 0.8)';
        }),
        pointRadius: 7,
        pointHoverRadius: 10,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const districtId = data.datasets[0].data[index].id;
        if (districtId && onSelectDistrict) {
          onSelectDistrict(districtId);
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const pt = context.raw;
            return `${pt.district} | Poverty: ${pt.x}% | Excluded: ${pt.y}% | Gap: ${pt.gap}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Poverty Rate (%)', color: '#94a3b8' },
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        title: { display: true, text: 'Financial Exclusion Rate (%)', color: '#94a3b8' },
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div style={{ height: '350px', width: '100%', padding: '10px' }}>
      <Scatter data={data} options={options} />
    </div>
  );
};

export default MismatchChart;
