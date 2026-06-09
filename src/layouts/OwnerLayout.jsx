import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlinePlusCircle,
  HiOutlineChartBar,
  HiOutlineArrowLeft,
  HiOutlineLogout
} from 'react-icons/hi';

const SidebarBrandLogo = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="4" width="28" height="24" rx="3" stroke="white" strokeWidth="2.2" fill="none" />
    <line x1="16" y1="4" x2="16" y2="28" stroke="white" strokeWidth="2" />
    <circle cx="16" cy="16" r="5" stroke="white" strokeWidth="2" fill="none" />
    <path d="M2 10 H30" stroke="white" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.5" />
    <path d="M2 22 H30" stroke="white" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.5" />
  </svg>
);

const OwnerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/owner', icon: <HiOutlineHome size={20} />, label: 'Dashboard', end: true },
    { to: '/owner/turfs', icon: <HiOutlineOfficeBuilding size={20} />, label: 'My Turfs', end: false },
    { to: '/owner/turfs/create', icon: <HiOutlinePlusCircle size={20} />, label: 'Create Turf', end: false },
    { to: '/owner/analytics', icon: <HiOutlineChartBar size={20} />, label: 'Analytics', end: false }
  ];

  return (
    <div className="sidebar-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">
            <SidebarBrandLogo />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">TurfBook</span>
            <span className="sidebar-brand-subtitle">Owner Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '16px 0', borderTop: '1px solid var(--color-border)' }}>
          <NavLink to="/" className="sidebar-link">
            <HiOutlineArrowLeft size={20} />
            Back to Home
          </NavLink>
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'var(--transition)'
            }}
          >
            <HiOutlineLogout size={20} />
            Logout
          </button>
        </div>
      </aside>

      <div className="sidebar-content">
        <Outlet />
      </div>
    </div>
  );
};

export default OwnerLayout;
