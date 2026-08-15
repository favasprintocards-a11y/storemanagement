import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { InventoryItem, StockStatus } from '../types/inventory';

interface ProductFormModalProps {
  isOpen: boolean;
  categories: string[];
  onClose: () => void;
  onSave: (item: Partial<InventoryItem>) => void;
  editItem?: InventoryItem | null;
  defaultCategory?: string;
}

const emptyForm = (defaultCategory: string, categories: string[]): Partial<InventoryItem> => ({
  name: '',
  category: defaultCategory !== 'All' ? defaultCategory : categories[0] || '',
  quantity: undefined,
  minThreshold: undefined,
  unit: '',
  description: ''
});

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  categories,
  onClose,
  onSave,
  editItem,
  defaultCategory = ''
}) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>(
    emptyForm(defaultCategory, categories)
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editItem) {
      setFormData(editItem);
    } else {
      setFormData(emptyForm(defaultCategory, categories));
    }
    setErrors({});
  }, [editItem, isOpen, defaultCategory, categories]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErr: Record<string, string> = {};
    if (!formData.name?.trim()) newErr.name = 'Product name is required';
    if (formData.quantity === undefined || formData.quantity < 0) {
      newErr.quantity = 'Stock quantity is required';
    }
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let status: StockStatus = 'In Stock';
    const qty = Number(formData.quantity) || 0;
    const thresh = Number(formData.minThreshold) || 5;

    if (qty === 0) status = 'Out of Stock';
    else if (qty <= thresh) status = 'Low Stock';

    onSave({
      ...formData,
      quantity: qty,
      minThreshold: thresh,
      unit: formData.unit?.trim() || 'unit',
      status,
      lastUpdated: new Date().toISOString().split('T')[0]
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {editItem ? 'Edit Product Details' : 'Add New Product'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Product Name */}
              <div className="form-group full-width">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Glossy Photo Paper A4"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.name}</span>}
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category *</label>
                {categories.length > 0 ? (
                  <select
                    className="form-select"
                    value={formData.category || categories[0] || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter category name"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                )}
              </div>

              {/* Unit Type (Manual Text Entry) */}
              <div className="form-group">
                <label className="form-label">Unit Type</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. piece, pack, sqft, box, roll"
                  value={formData.unit || ''}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>

              {/* Stock Quantity */}
              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input
                  type="number"
                  min={0}
                  className="form-input"
                  placeholder="Enter quantity"
                  value={formData.quantity === undefined ? '' : formData.quantity}
                  onChange={(e) => setFormData({
                    ...formData,
                    quantity: e.target.value === '' ? undefined : Number(e.target.value)
                  })}
                />
                {errors.quantity && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.quantity}</span>}
              </div>

              {/* Low Stock Warning Threshold */}
              <div className="form-group">
                <label className="form-label">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  min={1}
                  className="form-input"
                  placeholder="e.g. 10"
                  value={formData.minThreshold === undefined ? '' : formData.minThreshold}
                  onChange={(e) => setFormData({
                    ...formData,
                    minThreshold: e.target.value === '' ? undefined : Number(e.target.value)
                  })}
                />
              </div>

              {/* Product Description */}
              <div className="form-group full-width">
                <label className="form-label">Description / Storage Notes</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Additional notes about color specs, shelf location..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={18} />
              <span>{editItem ? 'Update Product' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
