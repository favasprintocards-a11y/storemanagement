import React from 'react';
import { Search, X, Plus, Download, RotateCcw, History, Layers, Calendar } from 'lucide-react';
import { DateRangeFilter } from '../types/inventory';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedDateRange: DateRangeFilter;
  onDateRangeChange: (range: DateRangeFilter) => void;
  startDate?: string;
  onStartDateChange: (date: string) => void;
  endDate?: string;
  onEndDateChange: (date: string) => void;
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
  categories: string[];
  historyLogsCount: number;
  onAddProductClick: () => void;
  onOpenCategoryManager: () => void;
  onOpenHistoryModal: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedDateRange,
  onDateRangeChange,
  startDate = '',
  onStartDateChange,
  endDate = '',
  onEndDateChange,
  selectedMonth = '',
  onMonthChange,
  categories,
  historyLogsCount,
  onAddProductClick,
  onOpenCategoryManager,
  onOpenHistoryModal,
  onExportCSV,
  onResetData
}) => {
  return (
    <div className="control-panel">
      {/* Search & Filter Select Group */}
      <div className="search-filter-group">
        {/* Search Box */}
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by product name or ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Filter Select */}
        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="All">All Categories ({categories.length})</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Stock Status Filter Select */}
        <select
          className="filter-select"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock Alert</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        {/* Datewise Filter Select */}
        <select
          className="filter-select date-filter-select"
          value={selectedDateRange}
          onChange={(e) => onDateRangeChange(e.target.value as DateRangeFilter)}
          title="Filter by Date Range"
        >
          <option value="all">📅 All Dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="this_month">This Month</option>
          <option value="specific_month">Select Month (YYYY-MM)...</option>
          <option value="custom">Custom Date Range...</option>
        </select>

        {/* Specific Month Input Picker */}
        {selectedDateRange === 'specific_month' && (
          <div className="custom-date-inputs">
            <div className="date-input-wrapper">
              <label className="date-input-label">Month:</label>
              <input
                type="month"
                className="date-picker-input"
                value={selectedMonth}
                onChange={(e) => onMonthChange && onMonthChange(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Custom Start & End Date Inputs */}
        {selectedDateRange === 'custom' && (
          <div className="custom-date-inputs">
            <div className="date-input-wrapper">
              <label className="date-input-label">From:</label>
              <input
                type="date"
                className="date-picker-input"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </div>
            <div className="date-input-wrapper">
              <label className="date-input-label">To:</label>
              <input
                type="date"
                className="date-picker-input"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
            {(startDate || endDate) && (
              <button
                className="btn btn-secondary btn-icon-only"
                style={{ padding: '0.35rem', height: '34px', width: '34px' }}
                onClick={() => {
                  onStartDateChange('');
                  onEndDateChange('');
                }}
                title="Clear date inputs"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Button Group */}
      <div className="action-btn-group">
        <button
          className="btn btn-secondary"
          onClick={onOpenCategoryManager}
          title="Manage Categories"
        >
          <Layers size={16} />
          <span>Manage Categories</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenHistoryModal}
          title="View Stock Movement History Log"
        >
          <History size={16} />
          <span>History ({historyLogsCount})</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onExportCSV}
          title="Export dataset to CSV file"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onResetData}
          title="Reset or Clear All Products"
        >
          <RotateCcw size={16} />
        </button>

        <button
          className="btn btn-primary shadow-sm"
          onClick={onAddProductClick}
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>
    </div>
  );
};

FilterBar.displayName = 'FilterBar';
