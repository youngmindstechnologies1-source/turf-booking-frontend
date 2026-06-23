import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { HiHeart, HiOutlineHeart, HiOutlineLocationMarker } from 'react-icons/hi';
import StarRating from '../common/StarRating';
import { formatPrice, getSportIcon } from '../../utils/helpers';

// Haversine formula: returns distance in km
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const TurfCard = ({ turf, userLocation }) => {
  const { user, isAuthenticated, toggleFavourite } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);

  const isFavourite = isAuthenticated && user?.favouriteTurfs?.includes(turf._id);

  // Calculate distance if both coords available
  let distanceText = null;
  if (userLocation && turf.location?.coordinates?.length === 2) {
    const [turfLon, turfLat] = turf.location.coordinates;
    const dist = haversineDistance(userLocation.lat, userLocation.lon, turfLat, turfLon);
    distanceText = dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
  }

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

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('/s3/') || photo.startsWith('/uploads/')) return photo;
    if (photo.startsWith('http')) {
      try {
        const url = new URL(photo);
        return `/s3${url.pathname}`;
      } catch {
        return photo;
      }
    }
    return `/uploads/${photo}`;
  };

  const imageUrl = turf.photos && turf.photos.length > 0
    ? getPhotoUrl(turf.photos[0])
    : null;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/turfs/${turf.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="turf-card card">
          <div className="turf-card-image-wrapper">
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

            {/* Distance Badge */}
            {distanceText && (
              <span className="turf-card-distance-badge">
                📍 {distanceText} away
              </span>
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
