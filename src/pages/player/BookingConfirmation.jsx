import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineCheckCircle,
  HiOutlineShare,
  HiOutlineClipboardCopy,
  HiOutlineCalendar,
  HiOutlineClock,
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { getBooking, getSplitDetails, hostConfirmPayment } from '../../services/api';
import {
  formatPrice,
  formatDate,
  formatTime,
  getSplitStatusIcon,
  getSplitStatusLabel,
  generateUpiIntent,
  generateWhatsAppShareText,
} from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import HostMatchModal from '../../components/player/HostMatchModal';

const BookingConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hostConfirmed, setHostConfirmed] = useState(false);
  const [isHosted, setIsHosted] = useState(false);
  const [matchId, setMatchId] = useState(null);
  const [hostModalOpen, setHostModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [bookingRes, splitRes] = await Promise.all([
        getBooking(id),
        getSplitDetails(id),
      ]);
      setBooking(bookingRes.data.booking);
      setIsHosted(bookingRes.data.isHosted || false);
      setMatchId(bookingRes.data.matchId || null);
      setLedger(splitRes.data.ledger || []);
    } catch (err) {
      console.error('Failed to fetch booking:', err);
      toast.error('Booking not found');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Loader text="Loading booking details..." />;
  if (!booking) return null;

  const turf = booking.turf || {};
  const splitUrl = `${window.location.origin}/pay/split/${booking.bookingRef}`;

  const handleWhatsAppShare = () => {
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
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handleShare = async () => {
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
      try {
        await navigator.share({ title: `Turf Booking — ${booking.bookingRef}`, text: shareText });
      } catch {
        // User cancelled share
      }
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(splitUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleHostConfirm = async () => {
    const hostEntry = ledger.find((e) => e.isHost);
    if (!hostEntry) return;

    try {
      await hostConfirmPayment(booking.bookingRef, { ledgerId: hostEntry._id });
      setHostConfirmed(true);
      toast.success('Payment confirmed!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm');
    }
  };

  const hostEntry = ledger.find((e) => e.isHost);
  const upiIntentUrl = booking.paymentMode === 'upi_split' && turf.upiVpa
    ? generateUpiIntent(turf.upiVpa, turf.upiDisplayName || turf.name, booking.splitAmount, booking.bookingRef)
    : '';

  return (
    <div className="container" style={{ padding: '32px 24px 80px', maxWidth: '600px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          >
            <HiOutlineCheckCircle size={72} color="var(--color-primary)" />
          </motion.div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '12px', marginBottom: '4px' }}>
            {booking.paymentMode === 'upi_split' ? 'Split Created!' : 'Booking Confirmed!'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {booking.paymentMode === 'upi_split'
              ? 'Pay your share and share the link with your group'
              : `Your booking at ${turf.name} is confirmed`}
          </p>
        </div>

        {/* Booking Info Card */}
        <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
          <div style={{
            background: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>Booking Reference</p>
            <p className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '2px' }}>
              {booking.bookingRef}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🏟️</span>
              <span style={{ fontWeight: 600 }}>{turf.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              <HiOutlineCalendar size={16} />
              <span>{formatDate(booking.date)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              <HiOutlineClock size={16} />
              <span>{formatTime(booking.startTime)} — {formatTime(booking.endTime)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                {booking.playerCount} players • {formatPrice(booking.splitAmount)}/person
              </span>
              <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                {formatPrice(booking.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* UPI Payment for Host */}
        {booking.paymentMode === 'upi_split' && upiIntentUrl && hostEntry && hostEntry.status === 'unpaid' && !hostConfirmed && (
          <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
              📱 Pay Your Share
            </h3>
            <a
              href={upiIntentUrl}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
                marginBottom: '12px',
              }}
            >
              Pay {formatPrice(booking.splitAmount)} via UPI
            </a>
            <button
              className="btn btn-secondary"
              onClick={handleHostConfirm}
              style={{ width: '100%' }}
            >
              ✅ I've completed my payment
            </button>
          </div>
        )}

        {hostConfirmed && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--color-primary)',
          }}>
            ✅ Your payment has been confirmed
          </div>
        )}

        {/* Split Status Table */}
        {ledger.length > 0 && (
          <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
              👥 Split Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ledger.map((entry) => (
                <div
                  key={entry._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{entry.isHost ? '👑' : '👤'}</span>
                    <span style={{ fontWeight: entry.isHost ? 600 : 400 }}>
                      {entry.playerName || entry.playerLabel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                      {formatPrice(entry.shareAmount)}
                    </span>
                    <span title={getSplitStatusLabel(entry.status)}>
                      {getSplitStatusIcon(entry.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Matchmaking Card */}
        {booking.status !== 'cancelled' && (
          <div className="card" style={{ padding: '20px', marginBottom: '16px', border: '1px solid rgba(59, 130, 246, 0.2)', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🤝</span> PitchPe Matchmaking
            </h3>
            {isHosted ? (
              <>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                  This slot is listed as an Open Match on the community feed.
                </p>
                <Link to={`/matches/${matchId}`} className="btn btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  Go to Match Page
                </Link>
              </>
            ) : (
              <>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                  Short on players? List this booking on our public feed so solo players can join and split the cost!
                </p>
                <button className="btn btn-primary" onClick={() => setHostModalOpen(true)} style={{ width: '100%' }}>
                  Host an Open Match
                </button>
              </>
            )}
          </div>
        )}

        {/* Share Actions */}
        <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
            📤 Share with Your Group
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* WhatsApp dedicated button */}
            <button
              id="whatsapp-share-btn"
              className="btn btn-whatsapp"
              onClick={handleWhatsAppShare}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <FaWhatsapp size={20} />
              WhatsApp
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleShare}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <HiOutlineShare size={18} />
              Share
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCopyLink}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <HiOutlineClipboardCopy size={18} />
              Copy Link
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
            Browse Turfs
          </Link>
          <Link to="/my-bookings" className="btn btn-primary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
            My Bookings
          </Link>
        </div>
      </motion.div>

      <HostMatchModal
        isOpen={hostModalOpen}
        onClose={() => setHostModalOpen(false)}
        booking={booking}
        onHostSuccess={fetchData}
      />
    </div>
  );
};

export default BookingConfirmation;
