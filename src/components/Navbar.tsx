import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <header className="navbar">
      {/* Brand Container matching app shortcut layout */}
      <div className="brand-container" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div 
          className="brand-logo" 
          style={{ 
            width: '70px', 
            height: '70px', 
            borderRadius: '14px',
            background: '#ffffff',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            flexShrink: 0
          }}
        >
          <img
            src="/printo-logo.png"
            alt="Printo Logo"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="brand-title" style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.15 }}>
            Printo Store Management
          </span>
        </div>
      </div>
    </header>
  );
};
