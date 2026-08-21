import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { StockHistoryLog } from '../types/inventory';

interface StockHistoryModalProps {
  isOpen: boolean;
  historyLogs: StockHistoryLog[];
  categories?: string[];
  selectedProductFilter?: string | null;
  onClose: () => void;
  onClearHistory: () => void;
  onDeleteLog?: (id: string) => void;
}

export interface MonthlySummary {
  yearMonthKey: string; // "2026-08"
  monthLabel: string;   // "August 2026"
  year: number;
  month: number;
  stockInQty: number;
  stockInCount: number;
  stockOutQty: number;
  stockOutCount: number;
  netShift: number;
  totalLogsCount: number;
  logs: StockHistoryLog[];
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
  // Selected month state: null = Month & Year table view | "YYYY-MM" = Detailed month history view
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [movementFilter, setMovementFilter] = useState<'all' | 'in' | 'out'>('all');
  const [activeProductFilter, setActiveProductFilter] = useState<string | null>(selectedProductFilter || null);

  useEffect(() => {
    if (isOpen) {
      setActiveProductFilter(selectedProductFilter || null);
      setSelectedMonthKey(null);
      setSearchTerm('');
      setMovementFilter('all');
    }
  }, [selectedProductFilter, isOpen]);

  // Helper check for Stock In vs Stock Out
  const isStockIn = (type: string, changeQty: number) => type === 'add' || type === 'create' || changeQty > 0;
  const isStockOut = (type: string, changeQty: number) => type === 'minus' || type === 'delete' || changeQty < 0;

  // Filter logs by clicked product filter if active
  const relevantLogs = useMemo(() => {
    if (!activeProductFilter) return historyLogs;
    const filterLower = activeProductFilter.trim().toLowerCase();
    return historyLogs.filter((log) => {
      if (!log) return false;
      const matchId = log.productId && log.productId.toLowerCase() === filterLower;
      const matchName = log.productName && log.productName.trim().toLowerCase() === filterLower;
      return matchId || matchName;
    });
  }, [historyLogs, activeProductFilter]);

  // Derived clicked product display name
  const filteredProductName = useMemo(() => {
    if (!activeProductFilter) return null;
    const found = historyLogs.find(
      (l) => (l.productId && l.productId.toLowerCase() === activeProductFilter.toLowerCase()) ||
             (l.productName && l.productName.toLowerCase() === activeProductFilter.toLowerCase())
    );
    return found ? found.productName : activeProductFilter;
  }, [historyLogs, activeProductFilter]);

  // Calculate monthly summaries grouped by Month and Year based on relevantLogs
  const monthlySummaries: MonthlySummary[] = useMemo(() => {
    const map = new Map<string, MonthlySummary>();

    for (const log of relevantLogs) {
      if (!log.timestamp) continue;
      const date = new Date(log.timestamp);
      if (isNaN(date.getTime())) continue;

      const y = date.getFullYear();
      const m = date.getMonth();
      const yearMonthKey = `${y}-${String(m + 1).padStart(2, '0')}`;

      if (!map.has(yearMonthKey)) {
        const monthLabel = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        map.set(yearMonthKey, {
          yearMonthKey,
          monthLabel,
          year: y,
          month: m,
          stockInQty: 0,
          stockInCount: 0,
          stockOutQty: 0,
          stockOutCount: 0,
          netShift: 0,
          totalLogsCount: 0,
          logs: []
        });
      }

      const summary = map.get(yearMonthKey)!;
      summary.logs.push(log);
      summary.totalLogsCount += 1;

      const change = Number(log.changeQty || 0);
      const isIn = isStockIn(log.type, change);
      const isOut = isStockOut(log.type, change);

      if (isIn) {
        summary.stockInQty += Math.abs(change);
        summary.stockInCount += 1;
      } else if (isOut) {
        summary.stockOutQty += Math.abs(change);
        summary.stockOutCount += 1;
      }
      summary.netShift = summary.stockInQty - summary.stockOutQty;
    }

    return Array.from(map.values()).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [relevantLogs]);

  // Selected Month Summary object
  const activeMonthSummary = useMemo(() => {
    if (!selectedMonthKey) return null;
    return monthlySummaries.find(s => s.yearMonthKey === selectedMonthKey) || null;
  }, [selectedMonthKey, monthlySummaries]);

  // Logs for active selected month (filtered by search and movement type)
  const monthFilteredLogs = useMemo(() => {
    if (!activeMonthSummary) return [];
    return activeMonthSummary.logs.filter((log) => {
      if (movementFilter === 'in' && !isStockIn(log.type, log.changeQty)) return false;
      if (movementFilter === 'out' && !isStockOut(log.type, log.changeQty)) return false;

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
  }, [activeMonthSummary, movementFilter, searchTerm]);

  if (!isOpen) return null;

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
      <div className="modal-container" style={{ maxWidth: '940px', width: '94%', maxHeight: '92vh' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <History size={22} />
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.2rem', lineHeight: 1.2 }}>
                {filteredProductName
                  ? `Stock History - ${filteredProductName}`
                  : selectedMonthKey && activeMonthSummary
                  ? `Stock Movement - ${activeMonthSummary.monthLabel}`
                  : 'Stock History by Month & Year'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {filteredProductName
                  ? `Stock movement history specifically for product "${filteredProductName}"`
                  : selectedMonthKey && activeMonthSummary
                  ? `Complete incoming and outgoing transactions for ${activeMonthSummary.monthLabel}`
                  : 'Select a month and year to view full stock in and stock out history'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {filteredProductName && (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  background: 'var(--primary-light)', 
                  padding: '4px 10px', 
                  borderRadius: '999px', 
                  border: '1px solid var(--primary)', 
                  fontSize: '0.78rem', 
                  color: 'var(--primary)', 
                  fontWeight: 600 
                }}
              >
                <span>Product: <strong>{filteredProductName}</strong></span>
                <button 
                  onClick={() => setActiveProductFilter(null)}
                  title="Show history for all products"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', padding: '2px' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <button className="close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ gap: '1rem', padding: '1.25rem' }}>
          {/* VIEW 1: MONTH & YEAR TABLE OVERVIEW */}
          {!selectedMonthKey && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Monthly History Records ({monthlySummaries.length} months)
                </span>
                {relevantLogs.length > 0 && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Total Logs: <strong>{relevantLogs.length}</strong>
                  </span>
                )}
              </div>

              {monthlySummaries.length === 0 ? (
                <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)' }}>
                  <History size={36} style={{ opacity: 0.4, marginBottom: '10px' }} />
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>No stock movement logs recorded yet</div>
                  <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                    Incoming and outgoing stock changes will automatically appear grouped by Month and Year here.
                  </div>
                </div>
              ) : (
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <table className="data-table" style={{ fontSize: '0.875rem' }}>
                    <thead>
                      <tr>
                        <th>Month & Year</th>
                        <th>Total Stock In 🟢</th>
                        <th>Total Stock Out 🔴</th>
                        <th>Net Shift</th>
                        <th>Transactions</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlySummaries.map((summary) => {
                        const netColor = summary.netShift >= 0 ? 'var(--success)' : 'var(--danger)';
                        const formattedNet = summary.netShift >= 0 ? `+${summary.netShift}` : `${summary.netShift}`;

                        return (
                          <tr
                            key={summary.yearMonthKey}
                            onClick={() => {
                              setSelectedMonthKey(summary.yearMonthKey);
                              setSearchTerm('');
                              setMovementFilter('all');
                            }}
                            style={{ cursor: 'pointer', transition: 'background-color var(--transition-fast)' }}
                          >
                            {/* Month & Year */}
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--primary)' }}>
                                <Calendar size={16} />
                                <span>{summary.monthLabel}</span>
                              </div>
                            </td>

                            {/* Total Stock In */}
                            <td>
                              <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                                +{summary.stockInQty} <span style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 500 }}>({summary.stockInCount} logs)</span>
                              </span>
                            </td>

                            {/* Total Stock Out */}
                            <td>
                              <span style={{ fontWeight: 700, color: 'var(--danger)' }}>
                                -{summary.stockOutQty} <span style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 500 }}>({summary.stockOutCount} logs)</span>
                              </span>
                            </td>

                            {/* Net Shift */}
                            <td>
                              <span style={{ fontWeight: 700, color: netColor }}>
                                {formattedNet}
                              </span>
                            </td>

                            {/* Transactions count */}
                            <td>
                              <span className="category-tag" style={{ fontSize: '0.75rem' }}>
                                {summary.totalLogsCount} logs
                              </span>
                            </td>

                            {/* Action Button */}
                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '4px', color: 'var(--primary)' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMonthKey(summary.yearMonthKey);
                                  setSearchTerm('');
                                  setMovementFilter('all');
                                }}
                              >
                                <span>View History</span>
                                <ChevronRight size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: DETAILED HISTORY TABLE FOR SELECTED MONTH */}
          {selectedMonthKey && activeMonthSummary && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Back to Month Table Navigation Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.38rem 0.85rem', fontSize: '0.8rem', gap: '5px' }}
                  onClick={() => setSelectedMonthKey(null)}
                >
                  <ArrowLeft size={15} />
                  <span>Back to Month & Year Table</span>
                </button>

                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} />
                  <span>Full Stock In & Out - {activeMonthSummary.monthLabel}</span>
                </div>
              </div>

              {/* KPI Summary Cards for Selected Month */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {/* Total Logs */}
                <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Month Transactions
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {activeMonthSummary.totalLogsCount} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>entries</span>
                    </div>
                  </div>
                  <History size={20} style={{ color: 'var(--primary)' }} />
                </div>

                {/* Stock In Summary */}
                <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight size={12} /> Total Stock In
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
                      +{activeMonthSummary.stockInQty} <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.8 }}>({activeMonthSummary.stockInCount} logs)</span>
                    </div>
                  </div>
                  <PlusCircle size={22} style={{ color: 'var(--success)' }} />
                </div>

                {/* Stock Out Summary */}
                <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--danger)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowDownLeft size={12} /> Total Stock Out
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)' }}>
                      -{activeMonthSummary.stockOutQty} <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.8 }}>({activeMonthSummary.stockOutCount} logs)</span>
                    </div>
                  </div>
                  <MinusCircle size={22} style={{ color: 'var(--danger)' }} />
                </div>
              </div>

              {/* Movement Filter Pills & Search within Month */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', background: 'var(--bg-app)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    className={`category-pill ${movementFilter === 'all' ? 'active' : ''}`}
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                    onClick={() => setMovementFilter('all')}
                  >
                    All ({activeMonthSummary.logs.length})
                  </button>
                  <button
                    className={`category-pill ${movementFilter === 'in' ? 'active' : ''}`}
                    style={{ 
                      padding: '0.3rem 0.75rem', 
                      fontSize: '0.78rem',
                      backgroundColor: movementFilter === 'in' ? 'var(--success)' : undefined,
                      color: movementFilter === 'in' ? '#fff' : 'var(--success)'
                    }}
                    onClick={() => setMovementFilter('in')}
                  >
                    🟢 Stock In ({activeMonthSummary.stockInCount})
                  </button>
                  <button
                    className={`category-pill ${movementFilter === 'out' ? 'active' : ''}`}
                    style={{ 
                      padding: '0.3rem 0.75rem', 
                      fontSize: '0.78rem',
                      backgroundColor: movementFilter === 'out' ? 'var(--danger)' : undefined,
                      color: movementFilter === 'out' ? '#fff' : 'var(--danger)'
                    }}
                    onClick={() => setMovementFilter('out')}
                  >
                    🔴 Stock Out ({activeMonthSummary.stockOutCount})
                  </button>
                </div>

                <div className="search-box" style={{ width: '220px' }}>
                  <Search className="search-icon" size={14} />
                  <input
                    type="text"
                    className="search-input"
                    style={{ padding: '0.35rem 0.65rem 0.35rem 2.1rem', fontSize: '0.8rem' }}
                    placeholder="Search product or note..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Detailed Month Stock History Data Table */}
              <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                {monthFilteredLogs.length === 0 ? (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <History size={30} style={{ opacity: 0.4, marginBottom: '8px' }} />
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No records found for this view</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                      Try resetting your search query or switching movement tabs.
                    </div>
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
                      {monthFilteredLogs.map((log) => {
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
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {selectedMonthKey && activeMonthSummary
                ? `Showing ${monthFilteredLogs.length} of ${activeMonthSummary.logs.length} logs for ${activeMonthSummary.monthLabel}`
                : `Total ${historyLogs.length} logs across ${monthlySummaries.length} months`}
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
