import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CalendarCheck, 
  FileSpreadsheet, 
  CreditCard, 
  Megaphone,
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['admin', 'teacher', 'student'] },
    { name: 'Students', path: '/students', icon: <Users size={20} />, roles: ['admin', 'teacher'] },
    { name: 'Teachers', path: '/teachers', icon: <GraduationCap size={20} />, roles: ['admin', 'teacher'] },
    { name: 'Courses', path: '/courses', icon: <BookOpen size={20} />, roles: ['admin', 'teacher', 'student'] },
    { name: 'Attendance', path: '/attendance', icon: <CalendarCheck size={20} />, roles: ['admin', 'teacher'] },
    { name: 'Grades', path: '/grades', icon: <FileSpreadsheet size={20} />, roles: ['admin', 'teacher', 'student'] },
    { name: 'Fees', path: '/fees', icon: <CreditCard size={20} />, roles: ['admin', 'student'] },
    { name: 'Announcements', path: '/announcements', icon: <Megaphone size={20} />, roles: ['admin', 'teacher', 'student'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">S</div>
        <div className="brand-name">EduSphere</div>
      </div>

      <nav className="sidebar-menu">
        {filteredItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="user-badge">
            <div className="user-avatar">
              {getInitials(user.full_name)}
            </div>
            <div className="user-info">
              <span className="user-name">{user.full_name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
        )}
        <button className="btn btn-danger" onClick={handleLogout} style={{ width: '100%' }}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
