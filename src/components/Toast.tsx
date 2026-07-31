import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types/inventory';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const getToastIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />;
      case 'error': return <AlertCircle size={18} style={{ color: 'var(--danger)' }} />;
      case 'warning': return <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />;
      case 'info': return <Info size={18} style={{ color: 'var(--primary)' }} />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {getToastIcon(toast.type)}
          <div className="toast-content">
            <span className="toast-title">{toast.title}</span>
            {toast.description && <span className="toast-desc">{toast.description}</span>}
          </div>
          <button 
            onClick={() => onDismiss(toast.id)} 
            style={{ color: 'var(--text-muted)', padding: '2px', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
