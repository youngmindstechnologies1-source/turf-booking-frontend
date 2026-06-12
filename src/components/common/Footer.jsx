import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaXTwitter, FaInstagram, FaFacebookF, FaYoutube } from 'react-icons/fa6';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';
import Logo from './Logo';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        {/* Newsletter Section */}
        <div className="footer-newsletter">
          <div className="footer-newsletter-content">
            <h3 className="footer-newsletter-title">Stay in the Game</h3>
            <p className="footer-newsletter-text">
              Get exclusive deals, new turf listings, and sports updates delivered to your inbox.
            </p>
          </div>
          <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
            <div className="footer-newsletter-input-wrapper">
              <HiOutlineMail size={20} className="footer-newsletter-icon" />
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="footer-newsletter-input"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary footer-newsletter-btn">
              {subscribed ? '✓ Subscribed!' : 'Subscribe'}
            </button>
          </form>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <h3 className="footer-brand-title">
              <Logo size={24} style={{ marginRight: '8px' }} />
              PitchPe
            </h3>
            <p className="footer-brand-description">
              India's premier platform for discovering sports turfs and splitting booking payments. Play your game, your way.
            </p>
            <div className="footer-social-links">
              <a href="#" className="footer-social footer-social-icon twitter" aria-label="Twitter">
                <FaXTwitter size={18} />
              </a>
              <a href="#" className="footer-social footer-social-icon instagram" aria-label="Instagram">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="footer-social footer-social-icon facebook" aria-label="Facebook">
                <FaFacebookF size={18} />
              </a>
              <a href="#" className="footer-social footer-social-icon youtube" aria-label="YouTube">
                <FaYoutube size={18} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h3>Quick Links</h3>
            <Link to="/">Home</Link>
            <Link to="/">Browse Turfs</Link>
            <Link to="/my-bookings">My Bookings</Link>
            <Link to="/favourites">Favourites</Link>
            <Link to="/profile">My Profile</Link>
          </div>

          <div className="footer-col">
            <h3>For Owners</h3>
            <Link to="/register">List Your Turf</Link>
            <Link to="/owner">Owner Dashboard</Link>
            <Link to="/owner/turfs/create">Create Listing</Link>
            <a href="#">Help Center</a>
            <a href="#">Partner Program</a>
          </div>

          <div className="footer-col">
            <h3>Contact Us</h3>
            <a href="mailto:support@pitchpe.in" className="footer-contact-item">
              <HiOutlineMail size={16} /> support@pitchpe.in
            </a>
            <a href="tel:+911234567890" className="footer-contact-item">
              <HiOutlinePhone size={16} /> +91 12345 67890
            </a>
            <a href="#" className="footer-contact-item">
              <HiOutlineLocationMarker size={16} /> Mumbai, Maharashtra, India
            </a>
            <a href="#" className="footer-contact-item">
              <HiOutlineClock size={16} /> Mon - Sat, 9AM - 8PM
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 PitchPe. All rights reserved. Made with ❤️ for sports lovers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
