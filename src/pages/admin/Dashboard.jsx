import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiOutlineUsers, HiOutlineOfficeBuilding, HiOutlineTicket, HiOutlineCurrencyRupee } from 'react-icons/hi';
import { getStats } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import Loader from '../../components/common/Loader';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStats();
        setStats(res.data.stats || res.data.data || res.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setStats({
          totalUsers: 0,
          totalTurfs: 0,
          totalBookings: 0,
          totalRevenue: 0,
          recentActivity: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader text="Loading admin dashboard..." />;

  const statCards = [
    {
      icon: <HiOutlineUsers size={24} />,
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      color: 'rgba(59, 130, 246, 0.15)',
      iconColor: '#3B82F6',
    },
    {
      icon: <HiOutlineOfficeBuilding size={24} />,
      label: 'Total Turfs',
      value: stats?.totalTurfs || 0,
      color: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#10B981',
    },
    {
      icon: <HiOutlineTicket size={24} />,
      label: 'Total Bookings',
      value: stats?.totalBookings || 0,
      color: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#F59E0B',
    },
    {
      icon: <HiOutlineCurrencyRupee size={24} />,
      label: 'Platform Revenue',
      value: formatPrice(stats?.totalRevenue || 0),
      color: 'rgba(139, 92, 246, 0.15)',
      iconColor: '#8B5CF6',
    },
  ];

  // Mock chart data if not from API
  const chartData = stats?.dailyBookings || Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    bookings: Math.floor(Math.random() * 20) + 5,
  }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="stat-card-icon" style={{ background: s.color, color: s.iconColor }}>
              {s.icon}
            </div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Bookings Chart */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ marginBottom: '24px' }}
      >
        <h3>Bookings This Week</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                fontSize: '0.85rem',
              }}
            />
            <Line
              type="monotone"
              dataKey="bookings"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: '12px' }}>Pending Actions</h3>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            <p style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span>Pending Turf Approvals</span>
              <span className="badge badge-warning">{stats?.pendingTurfs || 0}</span>
            </p>
            <p style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span>Active Owners</span>
              <span className="badge badge-info">{stats?.activeOwners || 0}</span>
            </p>
            <p style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>Active Players</span>
              <span className="badge badge-success">{stats?.activePlayers || 0}</span>
            </p>
          </div>
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: '12px' }}>Platform Health</h3>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            <p style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span>Approved Turfs</span>
              <span className="badge badge-success">{stats?.approvedTurfs || stats?.totalTurfs || 0}</span>
            </p>
            <p style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span>Confirmed Bookings</span>
              <span className="badge badge-info">{stats?.confirmedBookings || 0}</span>
            </p>
            <p style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>Cancellation Rate</span>
              <span>{stats?.cancellationRate || '0%'}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
