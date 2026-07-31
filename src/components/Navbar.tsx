import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <header className="navbar">
      {/* Brand Container matching app shortcut layout */}
      <div className="brand-container" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div 
          className="brand-logo" 
          style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px',
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5px',
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="brand-title" style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.15 }}>
            Printo Store
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em', marginTop: '2px' }}>
            Cards & Technologies
          </span>
        </div>
      </div>
    </header>
  );
};
