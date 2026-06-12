import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineSearch,
  HiOutlineLightningBolt,
  HiOutlineStar,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlineCurrencyRupee,
  HiOutlineCheckCircle,
  HiOutlineOfficeBuilding
} from 'react-icons/hi';

const AuthParticles = () => (
  <div className="auth-particles">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="auth-particle" />
    ))}
  </div>
);

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'player',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });
      toast.success(`Welcome to PitchPe, ${user.name}!`);

      if (user.role === 'owner') {
        navigate('/owner');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <motion.div
          className="auth-form card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: '480px' }}
        >
          <Link to="/" style={{
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            fontSize: '1.5rem',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '24px',
            fontFamily: "'Outfit', sans-serif"
          }}>
            PitchPe
          </Link>

          <h1>Create Account</h1>
          <p className="auth-subtitle">Join thousands of sports enthusiasts</p>

          {/* Role Toggle */}
          <div className="toggle-group" style={{ marginBottom: '24px' }}>
            <button
              type="button"
              className={`toggle-option ${formData.role === 'player' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'player' })}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <HiOutlineLightningBolt size={16} />
              I'm a Player
            </button>
            <button
              type="button"
              className={`toggle-option ${formData.role === 'owner' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'owner' })}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <HiOutlineOfficeBuilding size={16} />
              List My Turf
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineUser
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
                />
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="reg-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineMail
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
                />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="phone">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <HiOutlinePhone
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
                />
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
                />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px'
                  }}
                >
                  {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
                />
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                style={{
                  width: '18px',
                  height: '18px',
                  marginTop: '2px',
                  accentColor: 'var(--color-primary)',
                  cursor: 'pointer'
                }}
              />
              <label htmlFor="agreeTerms" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}>
                I agree to the <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Terms of Service</a> and{' '}
                <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '14px' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '24px',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem'
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>

      <div className='auth-right' style={{ backgroundImage: 'url(/images/auth-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div className='auth-right-overlay'></div>
        <AuthParticles />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '40px', maxWidth: '500px' }}
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: 'white', fontFamily: "'Outfit', sans-serif" }}>
            {formData.role === 'owner' ? 'List Your Turf' : 'Join the Game'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: '1.8' }}>
            {formData.role === 'owner'
              ? 'Reach thousands of players. Manage bookings effortlessly. Grow your sports business.'
              : 'Discover premium turfs, book instantly, and never miss a game. Your next match is a click away.'}
          </p>

          <div style={{
            marginTop: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center'
          }}>
            {(formData.role === 'owner'
              ? [
                { icon: <HiOutlineChartBar size={22} />, text: 'Analytics Dashboard' },
                { icon: <HiOutlineCalendar size={22} />, text: 'Easy Slot Management' },
                { icon: <HiOutlineCurrencyRupee size={22} />, text: 'Revenue Tracking' }
              ]
              : [
                { icon: <HiOutlineSearch size={22} />, text: 'Find Turfs Near You' },
                { icon: <HiOutlineLightningBolt size={22} />, text: 'Instant Booking' },
                { icon: <HiOutlineStar size={22} />, text: 'Real Reviews' }
              ]
            ).map((item) => (
              <div key={item.text} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-md)',
                width: '100%',
                maxWidth: '280px'
              }}>
                <span style={{ color: '#10B981', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial Card */}
          <div className="auth-testimonial">
            <p className="auth-testimonial-quote">
              {formData.role === 'owner'
                ? '"Since listing on PitchPe, our bookings have increased by 40%. The dashboard makes management a breeze!"'
                : '"We found the perfect turf for our weekly matches. The booking process is seamless and the reviews are spot on!"'}
            </p>
            <div className="auth-testimonial-author">
              <div className="auth-testimonial-avatar">{formData.role === 'owner' ? 'A' : 'P'}</div>
              <div>
                <div className="auth-testimonial-name">{formData.role === 'owner' ? 'Amit Patel' : 'Priya Nair'}</div>
                <div className="auth-testimonial-role">{formData.role === 'owner' ? 'Turf Owner, Mumbai' : 'Weekly Player'}</div>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="auth-trust-badge">
            <HiOutlineCheckCircle size={16} />
            {formData.role === 'owner' ? 'Join 200+ turf owners' : 'Trusted by 10,000+ players'}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
