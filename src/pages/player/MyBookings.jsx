import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getMyBookings } from '../../services/api';
import BookingCard from '../../components/player/BookingCard';
import Loader from '../../components/common/Loader';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyBookings();
      const data = res.data.bookings || res.data.data || res.data || [];
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const now = new Date();
  const today = new Date(now.toDateString());

  const upcoming = bookings.filter(
    (b) => ['confirmed', 'pending_split'].includes(b.status) && new Date(b.date) >= today
  );
  const completed = bookings.filter(
    (b) => ['completed', 'fully_settled'].includes(b.status) || (['confirmed'].includes(b.status) && new Date(b.date) < today)
  );
  const cancelled = bookings.filter((b) => b.status === 'cancelled');

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { id: 'completed', label: 'Completed', count: completed.length },
    { id: 'cancelled', label: 'Cancelled', count: cancelled.length },
  ];

  const currentBookings =
    activeTab === 'upcoming'
      ? upcoming
      : activeTab === 'completed'
      ? completed
      : cancelled;

  return (
    <div className="container" style={{ padding: '32px 24px 64px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Track all your turf bookings in one place</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <Loader text="Loading your bookings..." />
        ) : currentBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {activeTab === 'upcoming' ? '📅' : activeTab === 'completed' ? '✅' : '❌'}
            </div>
            <h3>No {activeTab} bookings</h3>
            <p>
              {activeTab === 'upcoming'
                ? "You don't have any upcoming bookings. Browse turfs to make a booking!"
                : activeTab === 'completed'
                ? "You haven't completed any bookings yet."
                : "You haven't cancelled any bookings."}
            </p>
          </div>
        ) : (
          <div>
            {currentBookings.map((booking, i) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <BookingCard booking={booking} onUpdate={fetchBookings} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MyBookings;
