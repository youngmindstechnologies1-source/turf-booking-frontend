import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cancelBooking } from '../../services/api';
import { formatPrice, formatDate, formatTime, getStatusColor, getSportIcon, generateWhatsAppShareText } from '../../utils/helpers';
import ReviewForm from './ReviewForm';
import HostMatchModal from './HostMatchModal';
import toast from 'react-hot-toast';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineX,
  HiOutlineShare,
  HiOutlineEye,
} from 'react-icons/hi';

const BookingCard = ({ booking, onUpdate }) => {
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [hostModalOpen, setHostModalOpen] = useState(false);

  const turf = booking.turf || {};
  const isUpcoming = ['confirmed', 'pending_split'].includes(booking.status) && new Date(booking.date) >= new Date(new Date().toDateString());
  const canReview = booking.status === 'completed' && !booking.hasReviewed;
  const isSplit = booking.playerCount > 1;

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

  const handleShare = () => {
    const splitUrl = `${window.location.origin}/pay/split/${booking.bookingRef}`;
    const shareText = generateWhatsAppShareText(
      {
        turfName: turf.name,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalAmount: booking.totalAmount,
        splitAmount: booking.splitAmount,
        playerCount: booking.playerCount,
        paymentMode: booking.paymentMode,
        bookingRef: booking.bookingRef,
      },
      splitUrl
    );

    if (navigator.share) {
      navigator.share({ title: `Turf Booking — ${booking.bookingRef}`, text: shareText }).catch(() => {});
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
    }
  };

  const imageUrl = turf.photos && turf.photos.length > 0
    ? (turf.photos[0].startsWith('http') ? turf.photos[0] : `/uploads/${turf.photos[0]}`)
    : null;

  // Calculate split progress for display
  const getSplitProgress = () => {
    if (!isSplit) return null;
    const online = booking.onlineCollected || 0;
    const cash = booking.cashOutstanding || 0;
    const acted = online + cash;
    const paidCount = booking.splitAmount > 0 ? Math.round(acted / booking.splitAmount) : 0;
    return { paidCount, total: booking.playerCount };
  };

  const splitProgress = getSplitProgress();

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
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className={`badge ${getStatusColor(booking.status)}`}>
                  {booking.status === 'pending_split' ? 'Pending Split' : booking.status === 'fully_settled' ? 'Settled' : booking.status}
                </span>
                {booking.paymentMode && (
                  <span className={`badge ${booking.paymentMode === 'upi_split' ? 'badge-info' : 'badge-secondary'}`}
                    style={{ fontSize: '0.7rem' }}>
                    {booking.paymentMode === 'upi_split' ? '📱 UPI Split' : '💵 Cash'}
                  </span>
                )}
              </div>
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

            {/* Split Progress Bar */}
            {isSplit && splitProgress && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                    {booking.playerCount} players • {formatPrice(booking.splitAmount)}/person
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                    {splitProgress.paidCount}/{splitProgress.total} paid
                  </span>
                </div>
                <div style={{
                  height: '4px',
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(splitProgress.paidCount / splitProgress.total) * 100}%`,
                    background: 'var(--gradient-primary)',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}

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

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* Matchmaking buttons */}
                {isUpcoming && (
                  booking.isHosted ? (
                    <Link
                      to={`/matches/${booking.matchId}`}
                      className="btn btn-ghost btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                    >
                      ⚽ Match Page
                    </Link>
                  ) : (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setHostModalOpen(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      🤝 Host Match
                    </button>
                  )
                )}
                {/* View Split Status */}
                {isSplit && isUpcoming && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/booking/${booking._id}/confirmation`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <HiOutlineEye size={14} /> Split
                  </button>
                )}
                {/* Share Button */}
                {isUpcoming && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleShare}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <HiOutlineShare size={14} /> Share
                  </button>
                )}
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

      {hostModalOpen && (
        <HostMatchModal
          isOpen={hostModalOpen}
          onClose={() => setHostModalOpen(false)}
          booking={booking}
          onHostSuccess={onUpdate}
        />
      )}
    </>
  );
};

export default BookingCard;
