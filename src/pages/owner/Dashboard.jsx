import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineOfficeBuilding, HiOutlineTicket, HiOutlineCurrencyRupee, HiOutlinePlusCircle } from 'react-icons/hi';
import { getMyTurfs, getTurfBookings } from '../../services/api';
import { formatPrice, formatDate, formatTime } from '../../utils/helpers';
import Loader from '../../components/common/Loader';

const Dashboard = () => {
  const [turfs, setTurfs] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalTurfs: 0, totalBookings: 0, revenue: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const turfRes = await getMyTurfs();
        const turfData = turfRes.data.turfs || turfRes.data.data || [];
        setTurfs(turfData);

        // Fetch bookings for each turf to build stats
        let allBookings = [];
        for (const turf of turfData.slice(0, 5)) {
          try {
            const bookRes = await getTurfBookings(turf._id);
            const bookData = bookRes.data.bookings || bookRes.data.data || [];
            allBookings = allBookings.concat(bookData.map((b) => ({ ...b, turfName: turf.name })));
          } catch {
            // skip
          }
        }

        const confirmed = allBookings.filter((b) => b.status === 'confirmed' || b.status === 'completed');
        const revenue = confirmed.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        setStats({
          totalTurfs: turfData.length,
          totalBookings: allBookings.length,
          revenue,
        });

        setRecentBookings(
          allBookings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
        );
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  const statCards = [
    {
      icon: <HiOutlineOfficeBuilding size={24} />,
      label: 'Active Turfs',
      value: stats.totalTurfs,
      color: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#10B981',
    },
    {
      icon: <HiOutlineTicket size={24} />,
      label: 'Total Bookings',
      value: stats.totalBookings,
      color: 'rgba(59, 130, 246, 0.15)',
      iconColor: '#3B82F6',
    },
    {
      icon: <HiOutlineCurrencyRupee size={24} />,
      label: 'Total Revenue',
      value: formatPrice(stats.revenue),
      color: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#F59E0B',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Owner Dashboard</h1>
        <p className="page-subtitle">Overview of your turfs and bookings</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="stat-card-icon" style={{ background: s.color, color: s.iconColor }}>
              {s.icon}
            </div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <Link to="/owner/turfs/create" className="btn btn-primary">
          <HiOutlinePlusCircle size={18} /> Create New Turf
        </Link>
        <Link to="/owner/turfs" className="btn btn-secondary">
          Manage My Turfs
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '16px' }}>Recent Bookings</h3>
        {recentBookings.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', padding: '20px 0' }}>No bookings yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Turf</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {b.bookingRef || b._id?.slice(-8).toUpperCase()}
                    </td>
                    <td>{b.turfName || b.turf?.name || '—'}</td>
                    <td>{formatDate(b.date)}</td>
                    <td>{b.slots?.map((s) => formatTime(s.startTime)).join(', ') || '—'}</td>
                    <td className="gradient-text" style={{ fontWeight: 700 }}>
                      {formatPrice(b.totalAmount)}
                    </td>
                    <td>
                      <span className={`badge badge-${b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'info'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
