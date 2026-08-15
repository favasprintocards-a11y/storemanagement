import React, { useState } from 'react';
import { 
  Folder, 
  ChevronRight, 
  ArrowLeft, 
  Plus, 
  Minus, 
  History, 
  Edit3, 
  Trash2, 
  Package, 
  FolderPlus,
  AlertTriangle,
  X
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface CategoryDrilldownViewProps {
  categories: string[];
  items: InventoryItem[];
  searchQuery: string;
  onOpenCategoryManager: () => void;
  onDeleteCategory?: (categoryName: string) => void;
  onOpenStockAdjustModal: (item: InventoryItem, mode: 'add' | 'minus') => void;
  onViewProductHistory: (item: InventoryItem) => void;
  onEditProduct: (item: InventoryItem) => void;
  onDeleteProduct: (item: InventoryItem) => void;
  onAddProductClick: (category?: string) => void;
}

export const CategoryDrilldownView: React.FC<CategoryDrilldownViewProps> = ({
  categories,
  items,
  searchQuery,
  onOpenCategoryManager,
  onDeleteCategory,
  onOpenStockAdjustModal,
  onViewProductHistory,
  onEditProduct,
  onDeleteProduct,
  onAddProductClick
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Filter items by category & global search
  const filteredProducts = items.filter((item) => {
    const matchesCat = !selectedCategory || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || item.name.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const getStatusBadge = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return <span className="status-badge out-of-stock"><span className="status-dot"></span>Out of Stock</span>;
    }
    if (item.quantity <= item.minThreshold) {
      return <span className="status-badge low-stock"><span className="status-dot"></span>Low Stock</span>;
    }
    return <span className="status-badge in-stock"><span className="status-dot"></span>In Stock</span>;
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Navigation Breadcrumb Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setExpandedProductId(null);
            }}
            style={{
              color: selectedCategory ? 'var(--primary)' : 'var(--text-primary)',
              fontWeight: selectedCategory ? 500 : 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Folder size={18} />
            <span>Categories</span>
          </button>

          {selectedCategory && (
            <>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedCategory}
              </span>
            </>
          )}
        </div>

        {selectedCategory ? (
          <button
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', gap: '4px' }}
            onClick={() => {
              setSelectedCategory(null);
              setExpandedProductId(null);
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Categories</span>
          </button>
        ) : (
          <button
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', gap: '6px' }}
            onClick={onOpenCategoryManager}
          >
            <FolderPlus size={16} />
            <span>Add / Manage Categories</span>
          </button>
        )}
      </div>

      {/* TIER 1: CATEGORIES CARDS GRID */}
      {!selectedCategory && !isSearching && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Store Categories ({categories.length})
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.1rem' }}>
            {categories.map((cat) => {
              const catItems = items.filter((i) => (i.category || '').trim().toLowerCase() === (cat || '').trim().toLowerCase());

              return (
                <div
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setExpandedProductId(null);
                  }}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative'
                  }}
                  className="kpi-card"
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="brand-logo" style={{ width: '42px', height: '42px', flexShrink: 0 }}>
                        <Folder size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {cat}
                        </h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {catItems.length} {catItems.length === 1 ? 'product' : 'products'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add New Category Action Card */}
            <div
              onClick={onOpenCategoryManager}
              style={{
                background: 'var(--bg-app)',
                border: '2px dashed var(--primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: 'var(--primary)',
                minHeight: '110px',
                transition: 'all var(--transition-fast)'
              }}
              className="kpi-card"
            >
              <FolderPlus size={26} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>+ Add New Category</span>
            </div>
          </div>
        </div>
      )}

      {/* TIER 2: PRODUCTS LIST INSIDE CATEGORY */}
      {(selectedCategory || isSearching) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {selectedCategory ? `Products in "${selectedCategory}"` : `Search Results for "${searchQuery}"`} ({filteredProducts.length})
            </div>

            {selectedCategory && (
              <button
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', gap: '4px' }}
                onClick={() => onAddProductClick(selectedCategory)}
              >
                <Plus size={15} />
                <span>Add Product to Category</span>
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div className="kpi-icon-wrapper kpi-icon-primary" style={{ width: '60px', height: '60px' }}>
                <Package size={30} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  No Products Found
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {selectedCategory
                    ? `No products currently exist under "${selectedCategory}".`
                    : 'No products match your search query.'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredProducts.map((item) => {
                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.15rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-app)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)',
                            fontWeight: 700,
                            fontSize: '0.9rem'
                          }}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                            />
                          ) : (
                            <Package size={22} />
                          )}
                        </div>

                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.name}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                              Category: {item.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {item.quantity} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.unit}</span>
                          </div>
                          <div style={{ marginTop: '2px' }}>{getStatusBadge(item)}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: 'var(--success)' }}
                            onClick={() => onOpenStockAdjustModal(item, 'add')}
                            title="Add Stock"
                          >
                            <Plus size={15} />
                            <span>Add</span>
                          </button>

                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: 'var(--danger)' }}
                            onClick={() => onOpenStockAdjustModal(item, 'minus')}
                            title="Reduce Stock"
                          >
                            <Minus size={15} />
                            <span>Reduce</span>
                          </button>

                          <button
                            className="action-btn"
                            onClick={() => onViewProductHistory(item)}
                            title="View History Log"
                          >
                            <History size={16} />
                          </button>

                          <button
                            className="action-btn"
                            onClick={() => onEditProduct(item)}
                            title="Edit Product"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            className="action-btn delete"
                            onClick={() => onDeleteProduct(item)}
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CUSTOM CATEGORY DELETE CONFIRMATION MODAL */}
      {categoryToDelete && (
        <div className="modal-backdrop" onClick={() => setCategoryToDelete(null)}>
          <div className="modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                <AlertTriangle size={22} />
                <h3 className="modal-title">Delete Category</h3>
              </div>
              <button className="close-btn" onClick={() => setCategoryToDelete(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: '0.75rem' }}>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Are you sure you want to delete category <strong>"{categoryToDelete}"</strong>?
              </p>
              <div
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  background: 'var(--danger-bg)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--danger-border)'
                }}
              >
                This will also remove all products listed under <strong>"{categoryToDelete}"</strong>. This action cannot be undone.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCategoryToDelete(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (onDeleteCategory && categoryToDelete) {
                    onDeleteCategory(categoryToDelete);
                  }
                  setCategoryToDelete(null);
                }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
