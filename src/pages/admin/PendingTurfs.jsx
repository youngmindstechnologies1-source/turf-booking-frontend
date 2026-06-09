import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCheck, HiOutlineX, HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineLocationMarker } from 'react-icons/hi';
import { getPendingTurfs, approveTurf, rejectTurf } from '../../services/api';
import { formatPrice, getSportIcon } from '../../utils/helpers';
import { AMENITIES } from '../../utils/constants';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const PendingTurfs = () => {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState({});
  const [processing, setProcessing] = useState(null);

  const fetchTurfs = async () => {
    try {
      const res = await getPendingTurfs();
      setTurfs(res.data.turfs || res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch pending turfs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurfs();
  }, []);

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await approveTurf(id);
      toast.success('Turf approved!');
      setTurfs((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    setProcessing(id);
    try {
      await rejectTurf(id, rejectNotes[id] || '');
      toast.success('Turf rejected');
      setTurfs((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  const getAmenityLabel = (value) => {
    const found = AMENITIES.find((a) => a.value === value);
    return found ? `${found.icon} ${found.label}` : value;
  };

  if (loading) return <Loader text="Loading pending turfs..." />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pending Turfs</h1>
        <p className="page-subtitle">{turfs.length} turf{turfs.length !== 1 ? 's' : ''} awaiting review</p>
      </div>

      {turfs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>All Caught Up!</h3>
          <p>No turfs are pending approval right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {turfs.map((turf, i) => {
            const isExpanded = expandedId === turf._id;
            const imageUrl = turf.photos?.length > 0
              ? (turf.photos[0].startsWith('http') ? turf.photos[0] : `/uploads/${turf.photos[0]}`)
              : null;

            return (
              <motion.div
                key={turf._id}
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {/* Summary Row */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={turf.name} style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                  ) : (
                    <div style={{ width: '120px', height: '80px', background: 'var(--gradient-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', opacity: 0.5 }}>⚽</div>
                  )}

                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px' }}>{turf.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                      <HiOutlineLocationMarker size={14} />
                      <span style={{ textTransform: 'capitalize' }}>{turf.city}</span>
                      <span>•</span>
                      <span>{formatPrice(turf.pricePerHour)}/hr</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {turf.sports?.map((s) => (
                        <span key={s} style={{ background: 'var(--color-bg-tertiary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                          {getSportIcon(s)} {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleApprove(turf._id)}
                      disabled={processing === turf._id}
                    >
                      <HiOutlineCheck size={16} /> Approve
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setExpandedId(isExpanded ? null : turf._id)}
                    >
                      {isExpanded ? <HiOutlineChevronUp size={16} /> : <HiOutlineChevronDown size={16} />}
                      Details
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden', marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}
                    >
                      {turf.description && (
                        <div style={{ marginBottom: '16px' }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>Description</p>
                          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{turf.description}</p>
                        </div>
                      )}

                      {turf.address && (
                        <div style={{ marginBottom: '16px' }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>Address</p>
                          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{turf.address}</p>
                        </div>
                      )}

                      {turf.amenities?.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px' }}>Amenities</p>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {turf.amenities.map((a) => (
                              <span key={a} style={{ background: 'var(--color-bg-tertiary)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                                {getAmenityLabel(a)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>Owner</p>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                          {turf.owner?.name || 'Unknown'} ({turf.owner?.email || '—'})
                        </p>
                      </div>

                      {/* Reject with notes */}
                      <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-danger)', marginBottom: '8px' }}>Reject with Notes</p>
                        <textarea
                          value={rejectNotes[turf._id] || ''}
                          onChange={(e) => setRejectNotes((prev) => ({ ...prev, [turf._id]: e.target.value }))}
                          placeholder="Reason for rejection (visible to owner)..."
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'var(--color-bg-tertiary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-family)',
                            fontSize: '0.85rem',
                            resize: 'vertical',
                            outline: 'none',
                          }}
                        />
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleReject(turf._id)}
                          disabled={processing === turf._id}
                          style={{ marginTop: '8px' }}
                        >
                          <HiOutlineX size={14} /> Reject
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingTurfs;
