import React from 'react';
import { AlertTriangle, AlertOctagon } from 'lucide-react';
import { DashboardStats } from '../types/inventory';

interface DashboardMetricsProps {
  stats: DashboardStats;
  activeStatusFilter: string;
  onFilterByStatus: (status: string) => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = () => {
  return null;
};
