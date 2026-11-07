import React from 'react';

export default function MetricCard({ label, value, trend }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-trend">{trend}</div>
    </div>
  );
}
