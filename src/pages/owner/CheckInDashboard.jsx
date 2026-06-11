import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { getTurfBookings, settleBooking, getSplitDetails } from '../../services/api';
import {
  formatPrice,
  formatTime,
  getSplitStatusIcon,
  getSplitStatusLabel,
} from '../../utils/helpers';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { HiOutlineX, HiOutlineCheckCircle, HiOutlineRefresh } from 'react-icons/hi';
import toast from 'react-hot-toast';

const CheckInDashboard = () => {
  const { turfId } = useParams();
  const [turf, setTurf] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [ledgerData, setLedgerData] = useState({});
  const [settling, setSettling] = useState('');

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        const res = await api.get(`/turfs/${turfId}`);
        setTurf(res.data.turf || res.data.data || res.data);
      } catch {
        // Turf not found
      }
    };
    fetchTurf();
  }, [turfId]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTurfBookings(turfId, { date: selectedDate });
      const data = res.data.bookings || res.data.data || [];
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [turfId, selectedDate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const fetchLedger = async (bookingId) => {
    try {
      const res = await getSplitDetails(bookingId);
      setLedgerData((prev) => ({
        ...prev,
        [bookingId]: res.data.ledger || [],
      }));
    } catch (err) {
      console.error('Failed to fetch ledger:', err);
    }
  };

  const handleExpand = (booking) => {
    if (expandedBooking === booking._id) {
      setExpandedBooking(null);
    } else {
      setExpandedBooking(booking._id);
      if (!ledgerData[booking._id]) {
        fetchLedger(booking._id);
      }
    }
  };

  const handleSettle = async (bookingId) => {
    setSettling(bookingId);
    try {
      await settleBooking(bookingId);
      toast.success('Booking settled & checked in!');
      fetchBookings();
      if (ledgerData[bookingId]) {
        fetchLedger(bookingId);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to settle');
    } finally {
      setSettling('');
    }
  };

  const activeBookings = bookings.filter(
    (b) => !['cancelled'].includes(b.status)
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📋 Check-In Dashboard</h1>
        <p className="page-subtitle">{turf?.name || 'Loading...'}</p>
      </div>

      {/* Date Picker + Refresh */}
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            fontSize: '0.9rem',
          }}
        />
        <button className="btn btn-ghost" onClick={fetchBookings}>
          <HiOutlineRefresh size={18} /> Refresh
        </button>
      </div>

      {loading ? (
        <Loader text="Loading bookings..." />
      ) : activeBookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No Bookings</h3>
          <p>No bookings found for {format(new Date(selectedDate), 'dd MMM yyyy')}.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeBookings.map((booking, i) => {
            const isExpanded = expandedBooking === booking._id;
            const ledger = ledgerData[booking._id] || [];
            const isSplit = booking.playerCount > 1;

            // Payment summary
            const onlinePaid = booking.onlineCollected || 0;
            const cashDue = booking.cashOutstanding || 0;
            const isSettled = booking.status === 'fully_settled';

            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card"
                style={{ padding: '0', overflow: 'hidden' }}
              >
                {/* Booking Header */}
                <div
                  onClick={() => handleExpand(booking)}
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {formatTime(booking.startTime)} — {formatTime(booking.endTime)}
                      </span>
                      <span className={`badge ${
                        isSettled ? 'badge-success' :
                        booking.status === 'pending_split' ? 'badge-warning' :
                        'badge-info'
                      }`} style={{ fontSize: '0.7rem' }}>
                        {isSettled ? '✅ Settled' : booking.status === 'pending_split' ? '⏳ Pending' : '📋 Confirmed'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                        👤 {booking.player?.name || 'Player'}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        Ref: {booking.bookingRef}
                      </span>
                    </div>

                    {/* Quick Payment Summary */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.8rem',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: booking.paymentMode === 'upi_split' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: booking.paymentMode === 'upi_split' ? '#3B82F6' : '#10B981',
                      }}>
                        {booking.paymentMode === 'upi_split' ? '📱 UPI Split' : '💵 Cash'}
                      </span>
                      {isSplit && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {booking.playerCount} players • {formatPrice(booking.splitAmount)}/ea
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="gradient-text" style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                      {formatPrice(booking.totalAmount)}
                    </div>
                    {isSplit && onlinePaid > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '2px' }}>
                        ✅ {formatPrice(onlinePaid)} online
                      </div>
                    )}
                    {cashDue > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#FBBF24', marginTop: '2px' }}>
                        💵 Collect {formatPrice(cashDue)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    style={{
                      borderTop: '1px solid var(--color-border)',
                      padding: '16px 20px',
                      background: 'var(--color-bg-tertiary)',
                    }}
                  >
                    {/* Reconciliation Summary */}
                    <div style={{
                      padding: '12px 16px',
                      background: 'var(--color-bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '16px',
                      fontSize: '0.85rem',
                    }}>
                      <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '0.9rem' }}>
                        💰 Payment Reconciliation
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Total Due</span>
                        <span style={{ fontWeight: 600 }}>{formatPrice(booking.totalAmount)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#10B981' }}>Paid via App (Online)</span>
                        <span style={{ fontWeight: 600, color: '#10B981' }}>{formatPrice(onlinePaid)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#FBBF24' }}>Collect at Counter</span>
                        <span style={{ fontWeight: 600, color: '#FBBF24' }}>{formatPrice(cashDue)}</span>
                      </div>
                    </div>

                    {/* Ledger Details */}
                    {isSplit && ledger.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>
                          Player Breakdown
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {ledger.map((entry) => (
                            <div
                              key={entry._id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 12px',
                                background: 'var(--color-bg-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{entry.isHost ? '👑' : '👤'}</span>
                                <span>{entry.playerName || entry.playerLabel}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                  {formatPrice(entry.shareAmount)}
                                </span>
                                {entry.utrNumber && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}
                                    title={`UTR: ${entry.utrNumber}`}>
                                    UTR: {entry.utrNumber}
                                  </span>
                                )}
                                <span>{getSplitStatusIcon(entry.status)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Settle Button */}
                    {!isSettled && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSettle(booking._id)}
                        disabled={settling === booking._id}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <HiOutlineCheckCircle size={18} />
                        {settling === booking._id ? 'Settling...' : 'Settle & Check-In'}
                      </button>
                    )}
                    {isSettled && (
                      <div style={{
                        textAlign: 'center',
                        padding: '12px',
                        background: 'rgba(16, 185, 129, 0.08)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-primary)',
                        fontWeight: 600,
                      }}>
                        ✅ Settled & Checked In
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CheckInDashboard;
