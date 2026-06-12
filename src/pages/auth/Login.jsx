import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineCheckCircle } from 'react-icons/hi';

const AuthParticles = () => (
  <div className="auth-particles">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="auth-particle" />
    ))}
  </div>
);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${user.name}!`);

      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'owner') {
        navigate('/owner');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
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

          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue booking turfs</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineMail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)'
                  }}
                />
                <input
                  id="email"
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
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)'
                  }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '8px', padding: '14px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '24px',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem'
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
              Register
            </Link>
          </p>
        </motion.div>
      </div>

      <div className='auth-right' style={{ backgroundImage: 'url(/images/auth-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div className='auth-right-overlay'></div>
        <AuthParticles />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '40px', maxWidth: '500px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: 'white', fontFamily: "'Outfit', sans-serif" }}>Book Your Game</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: '1.8' }}>Find the best sports turfs near you. Compare prices, read reviews, and book instantly.</p>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '40px' }}>
            {[{num: '500+', label: 'Turfs'}, {num: '10K+', label: 'Players'}, {num: '50K+', label: 'Bookings'}].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', fontFamily: "'Outfit', sans-serif" }}>{stat.num}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial Card */}
          <div className="auth-testimonial">
            <p className="auth-testimonial-quote">
              "PitchPe made finding a turf and splitting payments so easy! We play every weekend now and never have to worry about cash or collections."
            </p>
            <div className="auth-testimonial-author">
              <div className="auth-testimonial-avatar">R</div>
              <div>
                <div className="auth-testimonial-name">Rahul Sharma</div>
                <div className="auth-testimonial-role">Regular Player</div>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="auth-trust-badge">
            <HiOutlineCheckCircle size={16} />
            Trusted by 10,000+ players
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
