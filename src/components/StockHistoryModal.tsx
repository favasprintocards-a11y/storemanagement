import React, { useState } from 'react';
import { X, History, PlusCircle, MinusCircle, Plus, Trash2, Search, Calendar, FileText } from 'lucide-react';
import { StockHistoryLog } from '../types/inventory';

interface StockHistoryModalProps {
  isOpen: boolean;
  historyLogs: StockHistoryLog[];
  selectedProductFilter?: string | null;
  onClose: () => void;
  onClearHistory: () => void;
  onDeleteLog?: (id: string) => void;
}

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  isOpen,
  historyLogs,
  selectedProductFilter,
  onClose,
  onClearHistory,
  onDeleteLog
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = historyLogs.filter((log) => {
    // Product filter from props
    if (selectedProductFilter && log.productName !== selectedProductFilter && log.productId !== selectedProductFilter) {
      return false;
    }
    // Search query
    const q = searchTerm.toLowerCase().trim();
    if (q) {
      const matchesName = log.productName.toLowerCase().includes(q);
      const matchesCat = log.category.toLowerCase().includes(q);
      const matchesNote = log.note?.toLowerCase().includes(q) || false;
      if (!matchesName && !matchesCat && !matchesNote) return false;
    }
    // Type filter
    if (filterType !== 'all' && log.type !== filterType) {
      return false;
    }

    return true;
  });

  const getTypeBadge = (type: StockHistoryLog['type']) => {
    switch (type) {
      case 'create':
        return (
          <span className="status-badge in-stock" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
            <Plus size={12} /> Product Created
          </span>
        );
      case 'add':
        return (
          <span className="status-badge in-stock" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
            <PlusCircle size={12} /> Stock Added
          </span>
        );
      case 'minus':
        return (
          <span className="status-badge low-stock" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
            <MinusCircle size={12} /> Stock Reduced
          </span>
        );
      case 'delete':
        return (
          <span className="status-badge out-of-stock" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
            <Trash2 size={12} /> Deleted
          </span>
        );
      case 'edit':
        return (
          <span className="status-badge" style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'var(--bg-app)' }}>
            Updated
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '840px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <History size={22} />
            <h3 className="modal-title">Stock Activity & History Log</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Toolbar & Filter Options */}
        <div className="modal-body" style={{ gap: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div className="search-box" style={{ flex: 1, minWidth: '220px' }}>
              <Search className="search-icon" size={16} />
              <input
                type="text"
                className="search-input"
                style={{ padding: '0.45rem 0.85rem 0.45rem 2.4rem', fontSize: '0.85rem' }}
                placeholder="Search history by product or note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Event Type Filter */}
            <select
              className="filter-select"
              style={{ padding: '0.45rem 2rem 0.45rem 0.85rem', fontSize: '0.82rem' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Event Types</option>
              <option value="create">Created</option>
              <option value="add">Stock Added</option>
              <option value="minus">Stock Reduced</option>
              <option value="delete">Deleted</option>
            </select>

            {/* Clear History Button */}
            {historyLogs.length > 0 && (
              <button
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--danger)', gap: '4px' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all history records?')) {
                    onClearHistory();
                  }
                }}
              >
                <Trash2 size={14} />
                <span>Clear All Logs</span>
              </button>
            )}
          </div>

          {/* History Data Table */}
          <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            {filteredLogs.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <History size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <div>No stock activity history records found.</div>
              </div>
            ) : (
              <table className="data-table" style={{ fontSize: '0.83rem' }}>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Event Type</th>
                    <th>Quantity Shift</th>
                    <th>Note / Reason</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const isMinus = log.type === 'minus' || log.changeQty < 0;
                    const formattedQtyChange = isMinus ? -Math.abs(log.changeQty) : `+${Math.abs(log.changeQty)}`;
                    const changeColor = isMinus ? 'var(--danger)' : 'var(--success)';
                    return (
                      <tr key={log.id}>
                        {/* Timestamp */}
                        <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} style={{ opacity: 0.7 }} />
                            <span>{log.timestamp}</span>
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

                        {/* Event Type Badge */}
                        <td>
                          {getTypeBadge(log.type)}
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
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: changeColor }}>
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
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Showing {filteredLogs.length} history records
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
