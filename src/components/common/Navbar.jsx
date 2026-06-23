import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUserCircle,
  HiOutlineLogout,
  HiOutlineHeart,
  HiOutlineTicket,
  HiOutlineChevronDown,
  HiOutlineBell,
  HiOutlineSun,
  HiOutlineMoon
} from 'react-icons/hi';
import Logo from './Logo';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifs = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleNotifClick = async (notif) => {
    setNotifOpen(false);
    if (!notif.isRead) {
      try {
        await markNotificationRead(notif._id);
        setNotifications(prev =>
          prev.map(n => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark read:', err);
      }
    }
    navigate(notif.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <Logo className="navbar-brand-icon" size={28} />
          PitchPe
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links navbar-desktop">
          <NavLink
            to="/"
            className={({ isActive }) => `navbar-link ${isActive ? 'active navbar-link-active-indicator' : ''}`}
            end
          >
            Browse Turfs
          </NavLink>

          {!isAuthenticated && (
            <>
              <NavLink to="/login" className={({ isActive }) => `navbar-link ${isActive ? 'active navbar-link-active-indicator' : ''}`}>
                Login
              </NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'player' && (
            <>
              <NavLink to="/my-bookings" className={({ isActive }) => `navbar-link ${isActive ? 'active navbar-link-active-indicator' : ''}`}>
                My Bookings
              </NavLink>
              <NavLink to="/matches" className={({ isActive }) => `navbar-link ${isActive ? 'active navbar-link-active-indicator' : ''}`}>
                Open Matches
              </NavLink>
              <NavLink to="/favourites" className={({ isActive }) => `navbar-link ${isActive ? 'active navbar-link-active-indicator' : ''}`}>
                Favourites
              </NavLink>
            </>
          )}

          {isAuthenticated && user?.role === 'owner' && (
            <NavLink to="/owner" className={({ isActive }) => `navbar-link ${isActive ? 'active navbar-link-active-indicator' : ''}`}>
              Owner Dashboard
            </NavLink>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `navbar-link ${isActive ? 'active navbar-link-active-indicator' : ''}`}>
              Admin Panel
            </NavLink>
          )}

          {/* Theme Toggle - Desktop */}
          <button
            id="theme-toggle-desktop"
            onClick={toggleTheme}
            className="navbar-theme-toggle"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <HiOutlineSun size={19} /> : <HiOutlineMoon size={19} />}
          </button>

          {isAuthenticated && (
            <>
              {/* Notification Bell */}
              <div className="navbar-notifications" style={{ position: 'relative', marginRight: '16px' }}>
                <button
                  className="navbar-notif-btn"
                  onClick={() => setNotifOpen(!notifOpen)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '6px', position: 'relative', display: 'flex', alignItems: 'center' }}
                >
                  <HiOutlineBell size={22} />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '2px', right: '2px', background: 'var(--color-danger, #EF4444)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      className="navbar-dropdown navbar-notif-dropdown"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{ position: 'absolute', right: 0, top: '40px', width: '320px', maxHeight: '400px', overflowY: 'auto', zIndex: 100, padding: '12px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', padding: '16px 0' }}>No notifications</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => handleNotifClick(notif)}
                              style={{ display: 'flex', gap: '10px', padding: '8px', borderRadius: 'var(--radius-sm)', background: notif.isRead ? 'none' : 'rgba(59, 130, 246, 0.05)', cursor: 'pointer', transition: 'background 0.2s', borderBottom: '1px solid rgba(0,0,0,0.03)' }}
                            >
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem', flexShrink: 0 }}>
                                {notif.sender?.name?.charAt(0) || 'P'}
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.3 }}>{notif.message}</p>
                                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              {!notif.isRead && (
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', alignSelf: 'center' }} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="navbar-profile">
                <button
                  className="navbar-profile-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                <div className="avatar avatar-sm navbar-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span>{user?.name?.split(' ')[0] || 'User'}</span>
                <HiOutlineChevronDown
                  size={14}
                  className={`navbar-chevron ${dropdownOpen ? 'navbar-chevron-open' : ''}`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="navbar-dropdown"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="navbar-dropdown-item"
                    >
                      <HiOutlineUserCircle size={18} />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="navbar-dropdown-item navbar-dropdown-logout"
                    >
                      <HiOutlineLogout size={18} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button & Bell */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Theme Toggle - Mobile */}
          <button
            id="theme-toggle-mobile"
            onClick={toggleTheme}
            className="navbar-theme-toggle"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <HiOutlineSun size={19} /> : <HiOutlineMoon size={19} />}
          </button>

          {isAuthenticated && (
            <div className="navbar-mobile-notifications" style={{ position: 'relative' }}>
              <button
                className="navbar-notif-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '6px', position: 'relative', display: 'flex', alignItems: 'center' }}
              >
                <HiOutlineBell size={22} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '2px', right: '2px', background: 'var(--color-danger, #EF4444)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          )}
          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="navbar-mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <NavLink to="/" className="navbar-mobile-link" onClick={closeMobile} end>
                Browse Turfs
              </NavLink>

              {!isAuthenticated && (
                <>
                  <NavLink to="/login" className="navbar-mobile-link" onClick={closeMobile}>
                    Login
                  </NavLink>
                  <NavLink to="/register" className="navbar-mobile-link" onClick={closeMobile}>
                    Register
                  </NavLink>
                </>
              )}

              {isAuthenticated && user?.role === 'player' && (
                <>
                  <NavLink to="/my-bookings" className="navbar-mobile-link" onClick={closeMobile}>
                    <HiOutlineTicket size={18} /> My Bookings
                  </NavLink>
                  <NavLink to="/matches" className="navbar-mobile-link" onClick={closeMobile}>
                    <HiOutlineUserCircle size={18} /> Open Matches
                  </NavLink>
                  <NavLink to="/favourites" className="navbar-mobile-link" onClick={closeMobile}>
                    <HiOutlineHeart size={18} /> Favourites
                  </NavLink>
                </>
              )}

              {isAuthenticated && user?.role === 'owner' && (
                <NavLink to="/owner" className="navbar-mobile-link" onClick={closeMobile}>
                  Owner Dashboard
                </NavLink>
              )}

              {isAuthenticated && user?.role === 'admin' && (
                <NavLink to="/admin" className="navbar-mobile-link" onClick={closeMobile}>
                  Admin Panel
                </NavLink>
              )}

              {isAuthenticated && (
                <>
                  <NavLink to="/profile" className="navbar-mobile-link" onClick={closeMobile}>
                    <HiOutlineUserCircle size={18} /> Profile
                  </NavLink>
                  <button
                    className="navbar-mobile-link navbar-mobile-logout"
                    onClick={() => { handleLogout(); closeMobile(); }}
                  >
                    <HiOutlineLogout size={18} /> Logout
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
