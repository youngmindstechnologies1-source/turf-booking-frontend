import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HiOutlineHome,
  HiOutlineClipboardCheck,
  HiOutlineUsers,
  HiOutlineTicket,
  HiOutlineArrowLeft,
  HiOutlineLogout
} from 'react-icons/hi';
import Logo from '../components/common/Logo';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', icon: <HiOutlineHome size={20} />, label: 'Dashboard', end: true },
    { to: '/admin/pending-turfs', icon: <HiOutlineClipboardCheck size={20} />, label: 'Pending Turfs', end: false },
    { to: '/admin/users', icon: <HiOutlineUsers size={20} />, label: 'Manage Users', end: false },
    { to: '/admin/bookings', icon: <HiOutlineTicket size={20} />, label: 'All Bookings', end: false }
  ];

  return (
    <div className="sidebar-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Logo size={22} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">PitchPe</span>
            <span className="sidebar-brand-subtitle">Admin Panel</span>
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

export default AdminLayout;
