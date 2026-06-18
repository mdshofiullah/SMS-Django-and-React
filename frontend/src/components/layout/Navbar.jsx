import React from 'react';
import useAuthStore from '../../store/authStore';
import { Calendar } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user } = useAuthStore();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="topbar animate-fade-in">
      <div>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="topbar-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
          <Calendar size={16} />
          <span>{today}</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
