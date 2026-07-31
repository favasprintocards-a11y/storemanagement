import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Layers } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface StockAdjustModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  mode: 'add' | 'minus';
  onClose: () => void;
  onConfirmAdjust: (id: string, delta: number, note?: string) => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  item,
  mode,
  onClose,
  onConfirmAdjust
}) => {
  const [count, setCount] = useState<number | ''>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setCount('');
    setNote('');
    setError('');
  }, [isOpen, item, mode]);

  if (!isOpen || !item) return null;

  const isAdd = mode === 'add';
  const numCount = typeof count === 'number' ? count : 0;
  const delta = isAdd ? numCount : -numCount;
  const newTotal = Math.max(0, item.quantity + delta);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!count || count <= 0) {
      setError('Please enter a valid count greater than 0');
      return;
    }
    if (!isAdd && count > item.quantity) {
      setError(`Cannot minus ${count} ${item.unit}. Available stock is ${item.quantity} ${item.unit}.`);
      return;
    }

    onConfirmAdjust(item.id, delta, note.trim());
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isAdd ? 'var(--primary)' : 'var(--warning)' }}>
            {isAdd ? <Plus size={22} /> : <Minus size={22} />}
            <h3 className="modal-title">
              {isAdd ? 'Add Stock Quantity' : 'Minus Stock Quantity'}
            </h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ gap: '1rem' }}>
            {/* Product & Current Stock Summary */}
            <div 
              style={{
                padding: '0.85rem 1rem',
                background: 'var(--bg-app)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Category: {item.category}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Current Stock
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                  {item.quantity} {item.unit}
                </div>
              </div>
            </div>

            {/* Enter Count Field */}
            <div className="form-group">
              <label className="form-label">
                Enter {isAdd ? 'Quantity to Add' : 'Quantity to Remove'} *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  min={1}
                  className="form-input"
                  style={{ fontSize: '1.25rem', fontWeight: 700, padding: '0.65rem 1rem' }}
                  placeholder="e.g. 50"
                  value={count}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCount(val === '' ? '' : parseInt(val) || 0);
                    if (error) setError('');
                  }}
                  autoFocus
                />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {item.unit}
                </span>
              </div>
              {error && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{error}</span>}
            </div>

            {/* Stock Level Preview Box */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: isAdd ? 'var(--success-bg)' : 'var(--warning-bg)',
                border: `1px solid ${isAdd ? 'var(--success-border)' : 'var(--warning-border)'}`,
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isAdd ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
                <Layers size={16} />
                New Total Stock Preview:
              </span>
              <strong style={{ fontSize: '1rem', color: isAdd ? 'var(--success)' : 'var(--warning)' }}>
                {newTotal} {item.unit}
              </strong>
            </div>

            {/* Optional Stock Adjustment Reason / Note */}
            <div className="form-group">
              <label className="form-label">Adjustment Reason / Note (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder={isAdd ? "e.g. Vendor Delivery #402" : "e.g. Used for Order #812"}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn ${isAdd ? 'btn-primary' : 'btn-danger'}`}
            >
              <Check size={18} />
              <span>
                Confirm {isAdd ? `+ Add ${count} ${item.unit}` : `- Minus ${count} ${item.unit}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
