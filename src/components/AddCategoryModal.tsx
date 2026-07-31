import React, { useState } from 'react';
import { X, FolderPlus, Check } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (categoryName: string) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory
}) => {
  const [catName, setCatName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = catName.trim();
    if (!trimmed) {
      setError('Category name is required');
      return;
    }
    onAddCategory(trimmed);
    setCatName('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <FolderPlus size={22} />
            <h3 className="modal-title">Create New Category</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group full-width">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Banners & Signage"
                value={catName}
                onChange={(e) => {
                  setCatName(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
              />
              {error && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{error}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={18} />
              <span>Add Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
