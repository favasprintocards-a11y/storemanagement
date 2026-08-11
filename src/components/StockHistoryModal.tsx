import React, { useState, useEffect } from 'react';
import { 
  X, 
  History, 
  PlusCircle, 
  MinusCircle, 
  Plus, 
  Trash2, 
  Search, 
  Calendar, 
  FileText,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Tag,
  Package
} from 'lucide-react';
import { StockHistoryLog } from '../types/inventory';
import { isWithinDateRange, getDateRangeLabel, DateRangePreset } from '../utils/dateUtils';

interface StockHistoryModalProps {
  isOpen: boolean;
  historyLogs: StockHistoryLog[];
  categories?: string[];
  selectedProductFilter?: string | null;
  onClose: () => void;
  onClearHistory: () => void;
  onDeleteLog?: (id: string) => void;
}

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  isOpen,
  historyLogs,
  categories = [],
  selectedProductFilter,
  onClose,
  onClearHistory,
  onDeleteLog
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [movementFilter, setMovementFilter] = useState<'all' | 'in' | 'out'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dateRange, setDateRange] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });
  const [activeProductFilter, setActiveProductFilter] = useState<string | null>(selectedProductFilter || null);

  useEffect(() => {
    setActiveProductFilter(selectedProductFilter || null);
  }, [selectedProductFilter]);

  if (!isOpen) return null;

  const isStockIn = (type: string, changeQty: number) => type === 'add' || type === 'create' || changeQty > 0;
  const isStockOut = (type: string, changeQty: number) => type === 'minus' || type === 'delete' || changeQty < 0;

  // Filter logs logic
  const filteredLogs = historyLogs.filter((log) => {
    // Single product filter
    if (activeProductFilter && log.productName !== activeProductFilter && log.productId !== activeProductFilter) {
      return false;
    }
    // Movement filter (Stock In vs Stock Out)
    if (movementFilter === 'in' && !isStockIn(log.type, log.changeQty)) return false;
    if (movementFilter === 'out' && !isStockOut(log.type, log.changeQty)) return false;

    // Event type filter
    if (filterType === 'in' && !isStockIn(log.type, log.changeQty)) return false;
    if (filterType === 'out' && !isStockOut(log.type, log.changeQty)) return false;
    if (filterType !== 'all' && filterType !== 'in' && filterType !== 'out' && log.type !== filterType) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && log.category !== selectedCategory) return false;

    // Date range filter (supports preset, custom dates, or specific month)
    if (!isWithinDateRange(log.timestamp, dateRange, startDate, endDate, selectedMonth)) {
      return false;
    }

    // Search query filter
    const q = searchTerm.toLowerCase().trim();
    if (q) {
      const matchesName = log.productName.toLowerCase().includes(q);
      const matchesCat = log.category.toLowerCase().includes(q);
      const matchesNote = log.note?.toLowerCase().includes(q) || false;
      const matchesId = log.productId?.toLowerCase().includes(q) || false;
      if (!matchesName && !matchesCat && !matchesNote && !matchesId) return false;
    }

    return true;
  });

  // Calculate statistics based on current date range & active filters
  const stockInLogs = filteredLogs.filter(l => isStockIn(l.type, l.changeQty));
  const stockOutLogs = filteredLogs.filter(l => isStockOut(l.type, l.changeQty));

  const totalStockInQty = stockInLogs.reduce((acc, l) => acc + Math.abs(l.changeQty || 0), 0);
  const totalStockOutQty = stockOutLogs.reduce((acc, l) => acc + Math.abs(l.changeQty || 0), 0);

  const hasActiveFilters = 
    searchTerm !== '' || 
    movementFilter !== 'all' || 
    filterType !== 'all' || 
    selectedCategory !== 'All' || 
    dateRange !== 'all' || 
    startDate !== '' ||
    endDate !== '' ||
    activeProductFilter !== null;

  const handleResetFilters = () => {
    setSearchTerm('');
    setMovementFilter('all');
    setFilterType('all');
    setSelectedCategory('All');
    setDateRange('all');
    setStartDate('');
    setEndDate('');
    const d = new Date();
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    setActiveProductFilter(null);
  };

  const formatTimestamp = (ts: string) => {
    if (!ts) return 'N/A';
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return ts;
      return date.toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return ts;
    }
  };

  const getTypeBadge = (type: StockHistoryLog['type'], changeQty: number) => {
    if (type === 'create') {
      return (
        <span className="status-badge in-stock" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
          <Plus size={12} /> Product Created
        </span>
      );
    }
    if (type === 'add' || changeQty > 0) {
      return (
        <span className="status-badge in-stock" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
          <ArrowUpRight size={12} /> Stock In
        </span>
      );
    }
    if (type === 'minus' || changeQty < 0) {
      return (
        <span className="status-badge low-stock" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
          <ArrowDownLeft size={12} /> Stock Out
        </span>
      );
    }
    if (type === 'delete') {
      return (
        <span className="status-badge out-of-stock" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
          <Trash2 size={12} /> Deleted
        </span>
      );
    }
    return (
      <span className="status-badge" style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'var(--bg-app)' }}>
        Updated
      </span>
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '920px', width: '94%', maxHeight: '92vh' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <History size={22} />
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.2rem', lineHeight: 1.2 }}>Stock Movement & History Log</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Track all incoming stock, outgoing usage, adjustments, and product events
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '1rem', padding: '1.25rem' }}>
          {/* Quick Stock Movement KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {/* Total Logs */}
            <div 
              onClick={() => setMovementFilter('all')}
              style={{
                background: movementFilter === 'all' ? 'var(--primary-light)' : 'var(--bg-app)',
                border: `1px solid ${movementFilter === 'all' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Total Movement
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {historyLogs.length} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>entries</span>
                </div>
              </div>
              <History size={20} style={{ color: 'var(--primary)', opacity: 0.8 }} />
            </div>

            {/* Stock In Summary */}
            <div 
              onClick={() => {
                setMovementFilter('in');
                setFilterType('all');
              }}
              style={{
                background: movementFilter === 'in' ? 'var(--success-bg)' : 'var(--bg-app)',
                border: `1px solid ${movementFilter === 'in' ? 'var(--success)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowUpRight size={12} /> Stock In
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
                  +{totalStockInQty} <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.8 }}>({stockInLogs.length} logs)</span>
                </div>
              </div>
              <PlusCircle size={22} style={{ color: 'var(--success)', opacity: 0.8 }} />
            </div>

            {/* Stock Out Summary */}
            <div 
              onClick={() => {
                setMovementFilter('out');
                setFilterType('all');
              }}
              style={{
                background: movementFilter === 'out' ? 'var(--danger-bg)' : 'var(--bg-app)',
                border: `1px solid ${movementFilter === 'out' ? 'var(--danger)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--danger)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowDownLeft size={12} /> Stock Out
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)' }}>
                  -{totalStockOutQty} <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.8 }}>({stockOutLogs.length} logs)</span>
                </div>
              </div>
              <MinusCircle size={22} style={{ color: 'var(--danger)', opacity: 0.8 }} />
            </div>
          </div>

          {/* Quick Movement Tab Pills Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
              <Filter size={14} /> Filter:
            </span>
            
            <button
              className={`category-pill ${movementFilter === 'all' ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
              onClick={() => {
                setMovementFilter('all');
                if (filterType === 'in' || filterType === 'out') setFilterType('all');
              }}
            >
              All Movements ({historyLogs.length})
            </button>

            <button
              className={`category-pill ${movementFilter === 'in' ? 'active' : ''}`}
              style={{ 
                padding: '0.35rem 0.85rem', 
                fontSize: '0.8rem',
                backgroundColor: movementFilter === 'in' ? 'var(--success)' : undefined,
                borderColor: movementFilter === 'in' ? 'var(--success)' : undefined,
                color: movementFilter === 'in' ? '#fff' : 'var(--success)'
              }}
              onClick={() => {
                setMovementFilter('in');
                if (filterType === 'out') setFilterType('all');
              }}
            >
              🟢 Stock In ({stockInLogs.length})
            </button>

            <button
              className={`category-pill ${movementFilter === 'out' ? 'active' : ''}`}
              style={{ 
                padding: '0.35rem 0.85rem', 
                fontSize: '0.8rem',
                backgroundColor: movementFilter === 'out' ? 'var(--danger)' : undefined,
                borderColor: movementFilter === 'out' ? 'var(--danger)' : undefined,
                color: movementFilter === 'out' ? '#fff' : 'var(--danger)'
              }}
              onClick={() => {
                setMovementFilter('out');
                if (filterType === 'in') setFilterType('all');
              }}
            >
              🔴 Stock Out ({stockOutLogs.length})
            </button>
          </div>

          {/* Filter Controls Box */}
          <div 
            style={{ 
              background: 'var(--bg-app)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.85rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem' 
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Search Box Input */}
              <div className="search-box" style={{ flex: '1 1 200px', minWidth: '180px' }}>
                <Search className="search-icon" size={15} />
                <input
                  type="text"
                  className="search-input"
                  style={{ padding: '0.42rem 0.75rem 0.42rem 2.2rem', fontSize: '0.83rem' }}
                  placeholder="Search product, note, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Event Type Select Dropdown */}
              <select
                className="filter-select"
                style={{ padding: '0.42rem 1.8rem 0.42rem 0.75rem', fontSize: '0.82rem', flex: '1 1 140px' }}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Event Types</option>
                <option value="in">Stock In (All)</option>
                <option value="out">Stock Out (All)</option>
                <option value="add">Stock Added</option>
                <option value="minus">Stock Reduced</option>
                <option value="create">Product Created</option>
                <option value="delete">Product Deleted</option>
              </select>

              {/* Category Filter Select */}
              <select
                className="filter-select"
                style={{ padding: '0.42rem 1.8rem 0.42rem 0.75rem', fontSize: '0.82rem', flex: '1 1 140px' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Date Range Filter Select */}
              <select
                className="filter-select"
                style={{ padding: '0.42rem 1.8rem 0.42rem 0.75rem', fontSize: '0.82rem', flex: '1 1 140px' }}
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="all">📅 All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="this_month">This Month</option>
                <option value="specific_month">Select Month (YYYY-MM)...</option>
                <option value="custom">Custom Date Range...</option>
              </select>
            </div>

            {/* Specific Month Input Picker Bar */}
            {dateRange === 'specific_month' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Select Month:</label>
                  <input
                    type="month"
                    className="date-picker-input"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Custom Start & End Date Input Bar */}
            {dateRange === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>From:</label>
                  <input
                    type="date"
                    className="date-picker-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>To:</label>
                  <input
                    type="date"
                    className="date-picker-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            )}

            {/* Active Filters Bar & Reset Action */}
            {hasActiveFilters && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '4px', borderTop: '1px dashed var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active filters:</span>
                  
                  {activeProductFilter && (
                    <span className="category-pill" style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                      Product: {activeProductFilter}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => setActiveProductFilter(null)} />
                    </span>
                  )}

                  {movementFilter !== 'all' && (
                    <span className="category-pill" style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Movement: {movementFilter === 'in' ? 'Stock In' : 'Stock Out'}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => setMovementFilter('all')} />
                    </span>
                  )}

                  {filterType !== 'all' && (
                    <span className="category-pill" style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Type: {filterType}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFilterType('all')} />
                    </span>
                  )}

                  {selectedCategory !== 'All' && (
                    <span className="category-pill" style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Category: {selectedCategory}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('All')} />
                    </span>
                  )}

                  {dateRange !== 'all' && (
                    <span className="category-pill" style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Date: {getDateRangeLabel(dateRange, startDate, endDate, selectedMonth)}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => {
                        setDateRange('all');
                        setStartDate('');
                        setEndDate('');
                      }} />
                    </span>
                  )}

                  {searchTerm && (
                    <span className="category-pill" style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Search: "{searchTerm}"
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')} />
                    </span>
                  )}
                </div>

                <button 
                  onClick={handleResetFilters}
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  <RotateCcw size={12} /> Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* History Data Table */}
          <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            {filteredLogs.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <History size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No matching stock history records found</div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  Try resetting your search query or selecting a different filter option.
                </div>
                {hasActiveFilters && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ marginTop: '1rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '4px' }}
                    onClick={handleResetFilters}
                  >
                    <RotateCcw size={13} /> Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <table className="data-table" style={{ fontSize: '0.83rem' }}>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Movement</th>
                    <th>Quantity Shift</th>
                    <th>Note / Reason</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const isMinus = isStockOut(log.type, log.changeQty);
                    const formattedQtyChange = isMinus ? -Math.abs(log.changeQty) : `+${Math.abs(log.changeQty)}`;
                    const changeColor = isMinus ? 'var(--danger)' : 'var(--success)';
                    return (
                      <tr key={log.id}>
                        {/* Timestamp */}
                        <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} style={{ opacity: 0.7 }} />
                            <span>{formatTimestamp(log.timestamp)}</span>
                          </div>
                        </td>

                        {/* Product Name */}
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {log.productName}
                        </td>

                        {/* Category */}
                        <td>
                          <span className="category-tag" style={{ fontSize: '0.7rem' }}>
                            {log.category}
                          </span>
                        </td>

                        {/* Movement Badge */}
                        <td>
                          {getTypeBadge(log.type, log.changeQty)}
                        </td>

                        {/* Quantity Shift */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {log.previousQty} ➔
                            </span>
                            <strong style={{ color: isMinus ? 'var(--warning)' : 'var(--text-primary)' }}>
                              {log.newQty} {log.unit}
                            </strong>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: changeColor }}>
                              ({formattedQtyChange})
                            </span>
                          </div>
                        </td>

                        {/* Note / Reason */}
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          {log.note ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FileText size={12} />
                              {log.note}
                            </span>
                          ) : (
                            <span style={{ opacity: 0.4 }}>—</span>
                          )}
                        </td>

                        {/* Delete Action */}
                        <td style={{ textAlign: 'center' }}>
                          {onDeleteLog && (
                            <button
                              className="action-btn delete"
                              onClick={() => onDeleteLog(log.id)}
                              title="Delete this history log entry"
                              style={{ padding: '3px 5px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredLogs.length}</strong> of <strong>{historyLogs.length}</strong> records
            </span>
            {historyLogs.length > 0 && (
              <button
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: 'var(--danger)', gap: '4px' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all history records?')) {
                    onClearHistory();
                  }
                }}
              >
                <Trash2 size={13} />
                <span>Clear All Logs</span>
              </button>
            )}
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

