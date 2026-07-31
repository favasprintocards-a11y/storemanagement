import React, { useState } from 'react';
import { X, FolderPlus, Edit2, Trash2, Check, Plus, Folder, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface CategoryManagerModalProps {
  isOpen: boolean;
  categories: string[];
  items: InventoryItem[];
  onClose: () => void;
  onAddCategory: (categoryName: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  categories,
  items,
  onClose,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deletingCat, setDeletingCat] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setError('Category name cannot be empty');
      return;
    }
    if (categories.includes(trimmed)) {
      setError('Category already exists');
      return;
    }
    onAddCategory(trimmed);
    setNewCatName('');
    setError('');
  };

  const startEditing = (cat: string) => {
    setEditingCat(cat);
    setEditValue(cat);
    setDeletingCat(null);
  };

  const saveEditing = (oldCat: string) => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === oldCat) {
      setEditingCat(null);
      return;
    }
    if (categories.includes(trimmed)) {
      alert('A category with this name already exists.');
      return;
    }
    onRenameCategory(oldCat, trimmed);
    setEditingCat(null);
  };

  const confirmDeleteCategory = (cat: string) => {
    onDeleteCategory(cat);
    setDeletingCat(null);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <FolderPlus size={22} />
            <h3 className="modal-title">Manage Categories</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '1.25rem' }}>
          {/* Add Category Form */}
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter new category name..."
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value);
                if (error) setError('');
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
              <Plus size={16} />
              <span>Add</span>
            </button>
          </form>
          {error && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '-0.5rem' }}>{error}</span>}

          {/* Categories List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '340px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Existing Categories ({categories.length})
            </div>

            {categories.map((cat) => {
              const productCount = items.filter((i) => i.category === cat).length;
              const isEditing = editingCat === cat;
              const isDeleting = deletingCat === cat;

              return (
                <div
                  key={cat}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    padding: '0.65rem 0.85rem',
                    background: isDeleting ? 'var(--danger-bg)' : 'var(--bg-app)',
                    border: isDeleting ? '1px solid var(--danger-border)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
                      <Folder size={18} style={{ color: 'var(--primary)' }} />
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditing(cat);
                            if (e.key === 'Escape') setEditingCat(null);
                          }}
                        />
                      ) : (
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {cat}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {productCount} items
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {isEditing ? (
                        <button
                          className="action-btn"
                          onClick={() => saveEditing(cat)}
                          title="Save Category Name"
                          style={{ color: 'var(--success)' }}
                        >
                          <Check size={16} />
                        </button>
                      ) : (
                        <button
                          className="action-btn"
                          onClick={() => startEditing(cat)}
                          title="Edit Category Name"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}

                      <button
                        className="action-btn delete"
                        onClick={() => {
                          setEditingCat(null);
                          setDeletingCat(isDeleting ? null : cat);
                        }}
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* In-App Inline Delete Confirmation */}
                  {isDeleting && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.4rem',
                        borderTop: '1px solid var(--danger-border)',
                        marginTop: '0.2rem'
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={14} />
                        Delete "{cat}" {productCount > 0 ? `and its ${productCount} items?` : '?'}
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => setDeletingCat(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => confirmDeleteCategory(cat)}
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
