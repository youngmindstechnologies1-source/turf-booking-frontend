import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelBooking } from '../../services/api';
import { formatPrice, formatDate, formatTime, getStatusColor, getSportIcon } from '../../utils/helpers';
import ReviewForm from './ReviewForm';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineLocationMarker, HiOutlineX } from 'react-icons/hi';

const BookingCard = ({ booking, onUpdate }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const turf = booking.turf || {};
  const isUpcoming = booking.status === 'confirmed' && new Date(booking.date) >= new Date(new Date().toDateString());
  const canReview = booking.status === 'completed' && !booking.hasReviewed;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelBooking(booking._id);
      toast.success('Booking cancelled successfully');
      setShowCancelModal(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const imageUrl = turf.photos && turf.photos.length > 0
    ? (turf.photos[0].startsWith('http') ? turf.photos[0] : `/uploads/${turf.photos[0]}`)
    : null;

  return (
    <>
      <div className="booking-card card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Turf Image */}
          <div style={{ flexShrink: 0 }}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={turf.name}
                style={{
                  width: '120px',
                  height: '90px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)'
                }}
              />
            ) : (
              <div style={{
                width: '120px',
                height: '90px',
                background: 'var(--gradient-primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                ⚽
              </div>
            )}
          </div>

          {/* Booking Details */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
                  <Link to={`/turfs/${turf.slug || turf._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {turf.name || 'Turf'}
                  </Link>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  <HiOutlineLocationMarker size={14} />
                  <span style={{ textTransform: 'capitalize' }}>{turf.city || ''}</span>
                </div>
              </div>
              <span className={`badge ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                <HiOutlineCalendar size={16} />
                {formatDate(booking.date)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                <HiOutlineClock size={16} />
                {booking.slots?.map(s => formatTime(s.startTime)).join(', ') || 'N/A'}
              </div>
              {booking.sport && (
                <span style={{
                  background: 'var(--color-bg-tertiary)',
                  padding: '2px 10px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {getSportIcon(booking.sport)} {booking.sport}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  fontSize: '1.25rem'
                }}>
                  {formatPrice(booking.totalAmount || booking.amount)}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                  Ref: {booking.bookingRef || booking._id?.slice(-8).toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {isUpcoming && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setShowCancelModal(true)}
                  >
                    Cancel
                  </button>
                )}
                {canReview && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowReviewModal(true)}
                  >
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 700 }}>Cancel Booking</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
              >
                <HiOutlineX size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                Are you sure you want to cancel this booking?
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                <strong>{turf.name}</strong> on {formatDate(booking.date)}
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Booking
              </button>
              <button
                className="btn btn-danger"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewForm
          bookingId={booking._id}
          turfId={turf._id}
          turfName={turf.name}
          onClose={() => setShowReviewModal(false)}
          onSubmit={() => {
            setShowReviewModal(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}
    </>
  );
};

export default BookingCard;
