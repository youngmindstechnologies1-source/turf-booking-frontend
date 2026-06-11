import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hostMatch } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { HiOutlineX, HiOutlineSparkles, HiOutlineUserGroup, HiOutlinePlus, HiOutlineMinus } from 'react-icons/hi';
import toast from 'react-hot-toast';

const HostMatchModal = ({ isOpen, onClose, booking, onHostSuccess }) => {
  const [title, setTitle] = useState(booking ? `${booking.turf?.name} Match` : '');
  const [description, setDescription] = useState('');
  const [skillLevel, setSkillLevel] = useState('all');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [hostTeamCount, setHostTeamCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleHost = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a match title');
      return;
    }

    if (maxPlayers < 2) {
      toast.error('Match must have at least 2 players');
      return;
    }

    if (hostTeamCount > maxPlayers) {
      toast.error('Your team size cannot exceed total players count');
      return;
    }

    setSubmitting(true);
    try {
      await hostMatch({
        bookingId: booking._id,
        title: title.trim(),
        description: description.trim(),
        skillLevel,
        maxPlayers,
        hostTeamCount,
      });

      toast.success('Match is now open to the public!');
      if (onHostSuccess) onHostSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to list match on feed');
    } finally {
      setSubmitting(false);
    }
  };

  const openSpots = maxPlayers - hostTeamCount;
  const pricePerSpot = Math.ceil(booking.totalAmount / maxPlayers);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        style={{ maxWidth: '520px', width: '90%' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineSparkles color="var(--color-primary)" /> Host an Open Match
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <HiOutlineX size={22} />
          </button>
        </div>

        <form onSubmit={handleHost}>
          {/* Title */}
          <div className="input-group">
            <label>Match Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wednesday Night Cricket"
              required
            />
          </div>

          {/* Description */}
          <div className="input-group">
            <label>Match Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the game, equipment provided, or any ground rules..."
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Grid for parameters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {/* Skill Level */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Skill Requirement</label>
              <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
                <option value="all">Open to All Skills</option>
                <option value="beginner">Beginner Friendly</option>
                <option value="intermediate">Intermediate Pace</option>
                <option value="advanced">Competitive / Advanced</option>
              </select>
            </div>

            {/* Price Info */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Total Slot Price</label>
              <input
                type="text"
                value={formatPrice(booking.totalAmount)}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>
          </div>

          {/* Steppers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Max Players */}
            <div style={{ background: 'var(--color-bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
                Total Target Players
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setMaxPlayers(Math.max(2, maxPlayers - 1))}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <HiOutlineMinus size={12} />
                </button>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, minWidth: '30px' }}>{maxPlayers}</span>
                <button
                  type="button"
                  onClick={() => setMaxPlayers(Math.min(22, maxPlayers + 1))}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <HiOutlinePlus size={12} />
                </button>
              </div>
            </div>

            {/* Host Team Count */}
            <div style={{ background: 'var(--color-bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
                Your Group Size
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setHostTeamCount(Math.max(1, hostTeamCount - 1))}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <HiOutlineMinus size={12} />
                </button>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, minWidth: '30px' }}>{hostTeamCount}</span>
                <button
                  type="button"
                  onClick={() => setHostTeamCount(Math.min(maxPlayers, hostTeamCount + 1))}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <HiOutlinePlus size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic calculation banner */}
          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Open Spots for Public:</span>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{openSpots} Spots</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Split Cost Per Player:</span>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatPrice(pricePerSpot)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ flex: 2 }}
            >
              {submitting ? 'Creating Match...' : 'List Open Match'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default HostMatchModal;
