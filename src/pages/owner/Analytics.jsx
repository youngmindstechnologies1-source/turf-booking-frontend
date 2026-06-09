import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getMyTurfs, getTurfBookings } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { format, subDays } from 'date-fns';
import Loader from '../../components/common/Loader';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [bookingsByDate, setBookingsByDate] = useState([]);
  const [bookingsBySport, setBookingsBySport] = useState([]);
  const [revenueByDay, setRevenueByDay] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const turfRes = await getMyTurfs();
        const turfs = turfRes.data.turfs || turfRes.data.data || [];

        let allBookings = [];
        for (const turf of turfs) {
          try {
            const bookRes = await getTurfBookings(turf._id);
            const data = bookRes.data.bookings || bookRes.data.data || [];
            allBookings = allBookings.concat(data);
          } catch {
            // skip
          }
        }

        const confirmed = allBookings.filter((b) => b.status !== 'cancelled');
        setTotalBookings(confirmed.length);
        setTotalRevenue(confirmed.reduce((sum, b) => sum + (b.totalAmount || 0), 0));

        // Bookings over last 14 days
        const last14 = Array.from({ length: 14 }, (_, i) => {
          const date = subDays(new Date(), 13 - i);
          const dateStr = format(date, 'yyyy-MM-dd');
          const count = confirmed.filter(
            (b) => format(new Date(b.createdAt || b.date), 'yyyy-MM-dd') === dateStr
          ).length;
          return { date: format(date, 'dd MMM'), bookings: count };
        });
        setBookingsByDate(last14);

        // Bookings by sport
        const sportMap = {};
        confirmed.forEach((b) => {
          const sport = b.sport || 'unknown';
          sportMap[sport] = (sportMap[sport] || 0) + 1;
        });
        setBookingsBySport(
          Object.entries(sportMap).map(([name, value]) => ({ name, value }))
        );

        // Revenue by day of week
        const dayMap = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
        confirmed.forEach((b) => {
          const day = format(new Date(b.date || b.createdAt), 'EEE');
          if (dayMap[day] !== undefined) {
            dayMap[day] += b.totalAmount || 0;
          }
        });
        setRevenueByDay(
          Object.entries(dayMap).map(([day, revenue]) => ({ day, revenue }))
        );
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <Loader text="Loading analytics..." />;

  const chartTooltipStyle = {
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    color: 'var(--color-text-primary)',
    fontSize: '0.85rem',
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Insights on your turf performance</p>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="stat-card-value">{totalBookings}</div>
          <div className="stat-card-label">Total Bookings</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-card-value">{formatPrice(totalRevenue)}</div>
          <div className="stat-card-label">Total Revenue</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-card-value">{totalBookings > 0 ? formatPrice(Math.round(totalRevenue / totalBookings)) : '₹0'}</div>
          <div className="stat-card-label">Avg. Booking Value</div>
        </motion.div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Bookings Over Time */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3>Bookings Over Time (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={bookingsByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="bookings" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bookings by Sport */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3>Bookings by Sport</h3>
          {bookingsBySport.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', padding: '40px 0', textAlign: 'center' }}>No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={bookingsBySport} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {bookingsBySport.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Revenue by Day of Week */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ gridColumn: '1 / -1' }}>
          <h3>Revenue by Day of Week</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [formatPrice(value), 'Revenue']} />
              <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
