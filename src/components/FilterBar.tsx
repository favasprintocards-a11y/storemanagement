import React from 'react';
import { Search, X, Plus, Download, RotateCcw, History, Layers } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
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
