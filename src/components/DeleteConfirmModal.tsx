import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
            <AlertTriangle size={22} />
            <h3 className="modal-title">Delete Product</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '0.75rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Are you sure you want to permanently delete <strong>"{item.name}"</strong>?
          </p>
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            background: 'var(--danger-bg)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--danger-border)'
          }}>
            <strong>Category:</strong> {item.category} &nbsp;|&nbsp; <strong>Stock:</strong> {item.quantity} {item.unit}s
            <br />
            This action will remove the product from inventory metrics and cannot be undone.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
};
