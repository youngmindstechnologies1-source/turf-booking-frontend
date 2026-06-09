import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlinePlusCircle,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCalendar,
  HiOutlineChartBar,
} from 'react-icons/hi';
import { getMyTurfs, deleteTurf } from '../../services/api';
import { formatPrice, getStatusColor } from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const MyTurfs = () => {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchTurfs = async () => {
    try {
      const res = await getMyTurfs();
      setTurfs(res.data.turfs || res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch turfs:', err);
      toast.error('Failed to load your turfs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurfs();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;

    setDeleting(id);
    try {
      await deleteTurf(id);
      toast.success('Turf deleted successfully');
      setTurfs((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete turf');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <Loader text="Loading your turfs..." />;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">My Turfs</h1>
          <p className="page-subtitle">{turfs.length} turf{turfs.length !== 1 ? 's' : ''} listed</p>
        </div>
        <Link to="/owner/turfs/create" className="btn btn-primary">
          <HiOutlinePlusCircle size={18} /> Add New Turf
        </Link>
      </div>

      {turfs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏟️</div>
          <h3>No Turfs Yet</h3>
          <p>Create your first turf listing to start receiving bookings.</p>
          <Link to="/owner/turfs/create" className="btn btn-primary" style={{ marginTop: '20px' }}>
            <HiOutlinePlusCircle size={18} /> Create Turf
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {turfs.map((turf, i) => {
            const imageUrl =
              turf.photos?.length > 0
                ? turf.photos[0].startsWith('http')
                  ? turf.photos[0]
                  : `/uploads/${turf.photos[0]}`
                : null;

            return (
              <motion.div
                key={turf._id}
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Image */}
                  <div style={{ flexShrink: 0 }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={turf.name}
                        style={{
                          width: '140px',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-md)',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '140px',
                          height: '100px',
                          background: 'var(--gradient-primary)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2.5rem',
                          opacity: 0.5,
                        }}
                      >
                        ⚽
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px' }}>
                          {turf.name}
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                          📍 {turf.city}
                        </p>
                      </div>
                      <span className={`badge ${getStatusColor(turf.status)}`}>{turf.status}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                        {formatPrice(turf.pricePerHour)}/hr
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        {turf.sports?.join(', ')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                      <Link to={`/owner/turfs/${turf._id}/edit`} className="btn btn-secondary btn-sm">
                        <HiOutlinePencil size={14} /> Edit
                      </Link>
                      <Link to={`/owner/turfs/${turf._id}/slots`} className="btn btn-secondary btn-sm">
                        <HiOutlineCalendar size={14} /> Slots
                      </Link>
                      <Link to={`/owner/bookings/${turf._id}`} className="btn btn-secondary btn-sm">
                        <HiOutlineChartBar size={14} /> Bookings
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(turf._id, turf.name)}
                        disabled={deleting === turf._id}
                      >
                        <HiOutlineTrash size={14} />
                        {deleting === turf._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTurfs;
