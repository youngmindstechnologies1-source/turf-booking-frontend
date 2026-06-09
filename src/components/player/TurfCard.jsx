import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { HiHeart, HiOutlineHeart, HiOutlineLocationMarker } from 'react-icons/hi';
import StarRating from '../common/StarRating';
import { formatPrice, getSportIcon } from '../../utils/helpers';

const TurfCard = ({ turf }) => {
  const { user, isAuthenticated, toggleFavourite } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);

  const isFavourite = isAuthenticated && user?.favouriteTurfs?.includes(turf._id);

  const handleFavourite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    try {
      await toggleFavourite(turf._id);
    } catch (err) {
      console.error('Failed to toggle favourite:', err);
    }
  };

  const imageUrl = turf.photos && turf.photos.length > 0
    ? (turf.photos[0].startsWith('http') ? turf.photos[0] : `/uploads/${turf.photos[0]}`)
    : null;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/turfs/${turf.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="turf-card card">
          <div className="turf-card-image-wrapper">
            {/* Shimmer skeleton while image loads */}
            {!imageLoaded && (
              <div className="skeleton skeleton-image" />
            )}
            <img
              src={imageUrl || '/images/turf-placeholder.png'}
              alt={turf.name}
              className="turf-card-image"
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              style={!imageLoaded ? { position: 'absolute', opacity: 0 } : {}}
            />

            <div className="turf-card-overlay"></div>

            {isAuthenticated && user?.role === 'player' && (
              <button
                onClick={handleFavourite}
                className="turf-card-fav-btn"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'var(--transition)',
                  zIndex: 2
                }}
              >
                {isFavourite ? (
                  <HiHeart size={20} color="#EF4444" />
                ) : (
                  <HiOutlineHeart size={20} color="white" />
                )}
              </button>
            )}

            {turf.status === 'pending' && (
              <span className="badge badge-warning" style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
                Pending
              </span>
            )}
          </div>

          <div className="turf-card-body">
            <h3 className="turf-card-title">{turf.name}</h3>

            <div className="turf-card-location" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              <HiOutlineLocationMarker size={16} color="var(--color-text-secondary)" />
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                {turf.city}
              </span>
            </div>

            <div className="turf-card-sports" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
              {turf.sports?.slice(0, 4).map((sport) => (
                <span
                  key={sport}
                  style={{
                    background: 'var(--color-bg-tertiary)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {getSportIcon(sport)} {sport}
                </span>
              ))}
              {turf.sports?.length > 4 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '4px' }}>
                  +{turf.sports.length - 4} more
                </span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <div className="turf-card-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StarRating rating={turf.averageRating || 0} size={14} />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  ({turf.totalReviews || 0})
                </span>
              </div>

              <div className="turf-card-price-pill">
                <span className="price-amount">{formatPrice(turf.pricePerHour)}</span>
                <span className="price-unit">/hr</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default TurfCard;
