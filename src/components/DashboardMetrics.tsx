import React from 'react';
import { Package, AlertTriangle, AlertOctagon } from 'lucide-react';
import { DashboardStats } from '../types/inventory';

interface DashboardMetricsProps {
  stats: DashboardStats;
  activeStatusFilter: string;
  onFilterByStatus: (status: string) => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  stats,
  activeStatusFilter,
  onFilterByStatus
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="dashboard-grid">
      {/* 1. Total Items in Stock */}
      <div 
        className={`kpi-card ${activeStatusFilter === 'All' ? 'active' : ''}`}
        onClick={() => onFilterByStatus('All')}
      >
        <div className="kpi-content">
          <span className="kpi-label">Total Unique Products</span>
          <span className="kpi-value">{stats.totalItems}</span>
        </div>
        <div className="kpi-icon-wrapper kpi-icon-primary">
          <Package size={24} />
        </div>
      </div>

      {/* 2. Low Stock Alerts (Clickable Filter) */}
      <div 
        className={`kpi-card ${activeStatusFilter === 'Low Stock' ? 'active' : ''}`}
        onClick={() => onFilterByStatus(activeStatusFilter === 'Low Stock' ? 'All' : 'Low Stock')}
        title="Click to show low stock products"
        style={{ cursor: 'pointer' }}
      >
        <div className="kpi-content">
          <span className="kpi-label">Low Stock Alerts</span>
          <span className="kpi-value" style={{ color: stats.lowStockCount > 0 ? 'var(--warning)' : 'inherit' }}>
            {stats.lowStockCount}
          </span>
        </div>
        <div className="kpi-icon-wrapper kpi-icon-warning">
          <AlertTriangle size={24} />
        </div>
      </div>

      {/* 3. Out of Stock Items (Clickable Filter) */}
      <div 
        className={`kpi-card ${activeStatusFilter === 'Out of Stock' ? 'active' : ''}`}
        onClick={() => onFilterByStatus(activeStatusFilter === 'Out of Stock' ? 'All' : 'Out of Stock')}
        title="Click to show out-of-stock products"
        style={{ cursor: 'pointer' }}
      >
        <div className="kpi-content">
          <span className="kpi-label">Out of Stock</span>
          <span className="kpi-value" style={{ color: stats.outOfStockCount > 0 ? 'var(--danger)' : 'inherit' }}>
            {stats.outOfStockCount}
          </span>
        </div>
        <div className="kpi-icon-wrapper kpi-icon-danger">
          <AlertOctagon size={24} />
        </div>
      </div>
    </div>
  );
};
