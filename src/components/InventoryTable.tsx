import React from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Plus, 
  Minus, 
  PackageX,
  ChevronLeft,
  ChevronRight,
  History
} from 'lucide-react';
import { InventoryItem, SortField, SortOrder } from '../types/inventory';

interface InventoryTableProps {
  items: InventoryItem[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onOpenStockAdjustModal: (item: InventoryItem, mode: 'add' | 'minus') => void;
  onViewProductHistory?: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;

  // Pagination Props
  currentPage: number;
  pageSize: number;
  totalFilteredCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  sortField,
  sortOrder,
  onSort,
  onOpenStockAdjustModal,
  onViewProductHistory,
  onEdit,
  onDelete,
  currentPage,
  pageSize,
  totalFilteredCount,
  onPageChange,
  onPageSizeChange
}) => {
  const totalPages = Math.ceil(totalFilteredCount / pageSize) || 1;

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const getStatusBadge = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return (
        <span className="status-badge out-of-stock">
          <span className="status-dot"></span>
          Out of Stock
        </span>
      );
    }
    if (item.quantity <= item.minThreshold) {
      return (
        <span className="status-badge low-stock">
          <span className="status-dot"></span>
          Low Stock
        </span>
      );
    }
    return (
      <span className="status-badge in-stock">
        <span className="status-dot"></span>
        In Stock
      </span>
    );
  };

  return (
    <div className="table-container">
      {items.length === 0 ? (
        <div className="empty-state">
          <PackageX className="empty-icon" />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>No inventory items found</h3>
          <p style={{ fontSize: '0.875rem' }}>
            Try resetting your search query, adjusting category filters, or adding a new product.
          </p>
        </div>
      ) : (
        <>
          <div className="responsive-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => onSort('name')}>
                    <div className="th-content">
                      <span>Product Name</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th>Category</th>
                  <th className="sortable" onClick={() => onSort('quantity')}>
                    <div className="th-content">
                      <span>Current Stock</span>
                      {renderSortIcon('quantity')}
                    </div>
                  </th>
                  <th>Stock Adjust Actions</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const progressPct = Math.min(100, Math.round((item.quantity / Math.max(item.minThreshold * 3, 50)) * 100));
                  
                  let progressColor = 'var(--success)';
                  if (item.quantity === 0) progressColor = 'var(--danger)';
                  else if (item.quantity <= item.minThreshold) progressColor = 'var(--warning)';

                  return (
                    <tr key={item.id}>
                      {/* Product Name */}
                      <td>
                        <div className="product-info">
                          <span className="product-title">{item.name}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="category-tag">{item.category}</span>
                      </td>

                      {/* Current Stock Quantity with Progress Bar */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '130px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {item.quantity} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>{item.unit}</span>
                          </span>
                          <div className="stock-progress-bar">
                            <div 
                              className="stock-progress-fill"
                              style={{ 
                                width: `${progressPct}%`, 
                                backgroundColor: progressColor 
                              }} 
                            />
                          </div>
                        </div>
                      </td>

                      {/* Explicit Add Stock / Minus Stock Buttons (Opens Custom Count Modal) */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', gap: '4px' }}
                            onClick={() => onOpenStockAdjustModal(item, 'minus')}
                            disabled={item.quantity <= 0}
                            title="Enter count to minus stock"
                          >
                            <Minus size={13} />
                            <span>Minus Stock</span>
                          </button>

                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', gap: '4px' }}
                            onClick={() => onOpenStockAdjustModal(item, 'add')}
                            title="Enter count to add stock"
                          >
                            <Plus size={13} />
                            <span>Add Stock</span>
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        {getStatusBadge(item)}
                      </td>

                      {/* Actions (History / Edit / Delete) */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                          {onViewProductHistory && (
                            <button
                              className="action-btn"
                              onClick={() => onViewProductHistory(item)}
                              title="View Product Stock History"
                            >
                              <History size={16} />
                            </button>
                          )}
                          <button
                            className="action-btn"
                            onClick={() => onEdit(item)}
                            title="Edit Product Details"
                          >
                            <Edit3 size={17} />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => onDelete(item)}
                            title="Delete Product"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className="table-footer">
            <div>
              Showing {Math.min((currentPage - 1) * pageSize + 1, totalFilteredCount)} to {Math.min(currentPage * pageSize, totalFilteredCount)} of {totalFilteredCount} products
            </div>

            <div className="pagination-controls">
              <label style={{ fontSize: '0.8rem', marginRight: '8px' }}>Per page:</label>
              <select
                className="filter-select"
                style={{ padding: '0.35rem 1.8rem 0.35rem 0.65rem', fontSize: '0.8rem' }}
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>

              <button
                className="page-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>

              <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 6px' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="page-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
