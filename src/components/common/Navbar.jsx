import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUserCircle,
  HiOutlineLogout,
  HiOutlineHeart,
  HiOutlineTicket,
  HiOutlineChevronDown
} from 'react-icons/hi';
import Logo from './Logo';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
          TurfBook
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

          {isAuthenticated && (
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
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
        </button>

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
