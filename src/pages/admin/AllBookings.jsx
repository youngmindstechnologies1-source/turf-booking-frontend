import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch } from 'react-icons/hi';
import { getAllBookings, adminCancelBooking } from '../../services/api';
import { formatPrice, formatDate, formatTime, getStatusColor } from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getAllBookings(params);
      const data = res.data;
      setBookings(data.bookings || data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking? This action cannot be undone.')) return;
    setCancelling(id);
    try {
      await adminCancelBooking(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(null);
    }
  };

  const selectStyle = {
    padding: '11px 36px 11px 16px',
    background: 'var(--color-bg-tertiary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-family)',
    fontSize: 'var(--font-size-sm)',
    outline: 'none',
    appearance: 'none',
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394A3B8' viewBox='0 0 16 16'%3E%3Cpath d='M1.5 5.5l6.5 6.5 6.5-6.5'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">All Bookings</h1>
        <p className="page-subtitle">Platform-wide booking management</p>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <HiOutlineSearch
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by booking ref or turf name..."
            style={{
              width: '100%',
              padding: '11px 16px 11px 42px',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-size-sm)',
              outline: 'none',
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={selectStyle}
        >
          <option value="">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <Loader text="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Bookings Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Player</th>
                  <th>Turf</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {b.bookingRef || b._id?.slice(-8).toUpperCase()}
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 500, color: 'var(--color-text-primary)', fontSize: '0.85rem' }}>
                          {b.player?.name || '—'}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {b.player?.email || ''}
                        </p>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                      {b.turf?.name || '—'}
                    </td>
                    <td>{formatDate(b.date)}</td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {b.slots?.map((s) => formatTime(s.startTime)).join(', ') || '—'}
                    </td>
                    <td className="gradient-text" style={{ fontWeight: 700 }}>
                      {formatPrice(b.totalAmount)}
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(b.status)}`}>{b.status}</span>
                    </td>
                    <td>
                      {b.status === 'confirmed' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(b._id)}
                          disabled={cancelling === b._id}
                        >
                          {cancelling === b._id ? '...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>←</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`pagination-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
              <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>→</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllBookings;
