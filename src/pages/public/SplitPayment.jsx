import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getSplitStatus,
  submitUtr as submitUtrApi,
  markPayCash as markPayCashApi,
} from '../../services/api';
import {
  formatPrice,
  formatDate,
  formatTime,
  formatCountdown,
  getSplitStatusIcon,
  getSplitStatusLabel,
  generateUpiIntent,
} from '../../utils/helpers';
import toast, { Toaster } from 'react-hot-toast';

const SplitPayment = () => {
  const { bookingRef } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment form state
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showPayForm, setShowPayForm] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const timerRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getSplitStatus(bookingRef);
      setData(res.data);
      setTimeRemaining(res.data.booking?.timeRemainingMs || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking not found');
    } finally {
      setLoading(false);
    }
  }, [bookingRef]);

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1000) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeRemaining]);

  const handlePayUpi = (entry) => {
    if (!data?.booking?.upiVpa) {
      toast.error('UPI not configured for this turf');
      return;
    }
    const intentUrl = generateUpiIntent(
      data.booking.upiVpa,
      data.booking.upiDisplayName,
      entry.shareAmount,
      bookingRef
    );
    window.location.href = intentUrl;
    // After UPI app interaction, show UTR form
    setTimeout(() => {
      setSelectedEntry(entry);
      setShowPayForm(true);
    }, 1000);
  };

  const handleSubmitUtr = async () => {
    if (!utrNumber.trim()) {
      toast.error('Please enter your UTR number');
      return;
    }
    if (!/^\d{12}$/.test(utrNumber.trim())) {
      toast.error('UTR must be exactly 12 digits');
      return;
    }
    setSubmitting(true);
    try {
      await submitUtrApi(bookingRef, {
        ledgerId: selectedEntry._id,
        playerName: playerName.trim(),
        utrNumber: utrNumber.trim(),
      });
      toast.success('UTR submitted successfully!');
      setShowPayForm(false);
      setSelectedEntry(null);
      setUtrNumber('');
      setPlayerName('');
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit UTR');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayCash = async (entry) => {
    const name = prompt('Enter your name:');
    if (!name) return;
    setSubmitting(true);
    try {
      await markPayCashApi(bookingRef, {
        ledgerId: entry._id,
        playerName: name.trim(),
      });
      toast.success('Marked as cash at venue!');
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary, #0F172A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-primary, #F1F5F9)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>🏏</div>
          <p>Loading split details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary, #0F172A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-primary, #F1F5F9)', padding: '32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
          <h2 style={{ marginBottom: '8px' }}>Oops!</h2>
          <p style={{ color: 'var(--color-text-secondary, #94A3B8)' }}>{error}</p>
        </div>
      </div>
    );
  }

  const { booking, ledger } = data;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
      color: '#F1F5F9',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1E293B',
            color: '#F1F5F9',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
        }}
      />

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px 80px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '24px' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏏</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>
            Split Payment
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Booking: <strong>{booking.bookingRef}</strong>
          </p>
        </motion.div>

        {/* Countdown Timer */}
        {booking.status === 'pending_split' && timeRemaining > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#FBBF24' }}>⏰ Slot locked for</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FBBF24', fontVariantNumeric: 'tabular-nums' }}>
              {formatCountdown(timeRemaining)}
            </span>
          </motion.div>
        )}

        {/* Booking Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
            🏟️ {booking.turfName}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: '#CBD5E1' }}>
            <div>📅 {formatDate(booking.date)}</div>
            <div>🕐 {formatTime(booking.startTime)} — {formatTime(booking.endTime)}</div>
            {booking.sport && <div>🎯 {booking.sport}</div>}
            <div>👤 Booked by: {booking.hostName}</div>
          </div>
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Total</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatPrice(booking.totalAmount)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Players</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{booking.playerCount}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Per Person</div>
              <div style={{
                fontWeight: 800,
                fontSize: '1.2rem',
                background: 'linear-gradient(135deg, #10B981, #34D399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {formatPrice(booking.splitAmount)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Split Status Board */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
            👥 Payment Status
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ledger.map((entry, i) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: entry.status === 'unpaid'
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(16, 185, 129, 0.06)',
                  borderRadius: '10px',
                  border: `1px solid ${entry.status === 'unpaid' ? 'rgba(255,255,255,0.06)' : 'rgba(16, 185, 129, 0.15)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.1rem' }}>{entry.isHost ? '👑' : '👤'}</span>
                  <div>
                    <div style={{ fontWeight: entry.isHost ? 700 : 500, fontSize: '0.9rem' }}>
                      {entry.playerName || entry.playerLabel}
                    </div>
                    <div style={{ color: '#64748B', fontSize: '0.75rem' }}>
                      {formatPrice(entry.shareAmount)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    color: entry.status === 'unpaid' ? '#94A3B8' : '#10B981',
                    fontWeight: 500,
                  }}>
                    {getSplitStatusLabel(entry.status)}
                  </span>
                  <span style={{ fontSize: '1.1rem' }}>{getSplitStatusIcon(entry.status)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons for Unpaid Entries */}
        {ledger.filter((e) => e.status === 'unpaid' && !e.isHost).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
              💰 Pay Your Share
            </h3>

            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '16px' }}>
              Select your name from the list above, then choose how to pay:
            </p>

            {/* Select which player you are */}
            <select
              value={selectedEntry?._id || ''}
              onChange={(e) => {
                const entry = ledger.find((l) => l._id === e.target.value);
                setSelectedEntry(entry || null);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#F1F5F9',
                fontSize: '0.9rem',
                marginBottom: '12px',
                appearance: 'auto',
              }}
            >
              <option value="" style={{ background: '#1E293B' }}>Select your slot...</option>
              {ledger
                .filter((e) => e.status === 'unpaid' && !e.isHost)
                .map((entry) => (
                  <option key={entry._id} value={entry._id} style={{ background: '#1E293B' }}>
                    {entry.playerLabel} — {formatPrice(entry.shareAmount)}
                  </option>
                ))}
            </select>

            {selectedEntry && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Pay via UPI */}
                {data.booking.upiVpa && (
                  <button
                    onClick={() => handlePayUpi(selectedEntry)}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    📱 Pay {formatPrice(selectedEntry.shareAmount)} via UPI
                  </button>
                )}

                {/* Pay Cash at Turf */}
                <button
                  onClick={() => handlePayCash(selectedEntry)}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#CBD5E1',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  💵 Pay Cash at Venue
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* UTR Submission Form */}
        <AnimatePresence>
          {showPayForm && selectedEntry && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
                🔢 Enter Payment Details
              </h3>

              <p style={{ color: '#94A3B8', fontSize: '0.8rem', marginBottom: '16px' }}>
                After completing the UPI payment, enter your name and the 12-digit UTR/Reference number from the payment confirmation.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#F1F5F9',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
                <input
                  type="text"
                  placeholder="12-digit UTR number"
                  value={utrNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                    setUtrNumber(val);
                  }}
                  maxLength={12}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#F1F5F9',
                    fontSize: '1.1rem',
                    letterSpacing: '2px',
                    fontVariantNumeric: 'tabular-nums',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    height: '4px',
                    flex: 1,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(utrNumber.length / 12) * 100}%`,
                      background: utrNumber.length === 12
                        ? 'linear-gradient(135deg, #10B981, #34D399)'
                        : 'linear-gradient(135deg, #3B82F6, #60A5FA)',
                      transition: 'width 0.2s ease',
                    }} />
                  </div>
                  <span style={{ color: '#64748B', fontSize: '0.75rem', flexShrink: 0 }}>
                    {utrNumber.length}/12
                  </span>
                </div>
                <button
                  onClick={handleSubmitUtr}
                  disabled={submitting || utrNumber.length !== 12}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: utrNumber.length === 12
                      ? 'linear-gradient(135deg, #10B981, #059669)'
                      : 'rgba(255,255,255,0.1)',
                    color: utrNumber.length === 12 ? 'white' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: utrNumber.length === 12 ? 'pointer' : 'not-allowed',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit UTR'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Summary Footer */}
        {booking.status !== 'pending_split' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              padding: '16px',
              background: booking.status === 'confirmed' || booking.status === 'fully_settled'
                ? 'rgba(16, 185, 129, 0.08)'
                : 'rgba(251, 191, 36, 0.08)',
              border: `1px solid ${booking.status === 'confirmed' || booking.status === 'fully_settled' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)'}`,
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {booking.status === 'confirmed' && '✅ Booking Confirmed'}
              {booking.status === 'fully_settled' && '✅ Fully Settled'}
              {booking.status === 'cancelled' && '❌ Booking Cancelled'}
              {booking.status === 'completed' && '🏁 Booking Completed'}
            </p>
            {booking.cashOutstanding > 0 && (
              <p style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '4px' }}>
                💵 {formatPrice(booking.cashOutstanding)} to be collected at venue
              </p>
            )}
          </motion.div>
        )}

        {/* Powered By Footer */}
        <div style={{ textAlign: 'center', marginTop: '32px', color: '#475569', fontSize: '0.75rem' }}>
          Powered by <strong style={{ color: '#10B981' }}>PitchPe</strong>
        </div>
      </div>
    </div>
  );
};

export default SplitPayment;
