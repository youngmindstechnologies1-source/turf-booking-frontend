import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { generateSlots, getSlots, updateSlotPrice, blockSlots, unblockSlots } from '../../services/api';
import { formatTime, formatPrice } from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SlotManager = () => {
  const { id: turfId } = useParams();
  const [turf, setTurf] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Generate form
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));

  // Block form
  const [blockStart, setBlockStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [blockEnd, setBlockEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [blockReason, setBlockReason] = useState('');
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        const res = await api.get(`/turfs/${turfId}`);
        setTurf(res.data.turf || res.data.data || res.data);
      } catch {
        toast.error('Failed to load turf');
      }
    };
    fetchTurf();
  }, [turfId]);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSlots(turfId, selectedDate);
      const data = res.data.slots || res.data.data || res.data || [];
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [turfId, selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select a date range');
      return;
    }

    setGenerating(true);
    try {
      await generateSlots({ turfId, startDate, endDate });
      toast.success('Slots generated successfully!');
      fetchSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate slots');
    } finally {
      setGenerating(false);
    }
  };

  const handleBlock = async () => {
    setBlocking(true);
    try {
      await blockSlots({ turfId, startDate: blockStart, endDate: blockEnd, reason: blockReason });
      toast.success('Slots blocked');
      fetchSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to block slots');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockSlots({ turfId, startDate: blockStart, endDate: blockEnd });
      toast.success('Slots unblocked');
      fetchSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unblock slots');
    }
  };

  const handlePriceUpdate = async (slotId, newPrice) => {
    try {
      await updateSlotPrice(slotId, Number(newPrice));
      toast.success('Price updated');
      fetchSlots();
    } catch (err) {
      toast.error('Failed to update price');
    }
  };

  // Generate date tabs for next 14 days
  const dateTabs = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i);
    return { date: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE dd'), full: format(d, 'dd MMM yyyy') };
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Slot Manager</h1>
        <p className="page-subtitle">{turf?.name || 'Loading...'}</p>
      </div>

      {/* Generate Slots */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '16px' }}>Generate Slots</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </motion.div>

      {/* Block/Unblock */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '16px' }}>Block / Unblock Slots</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>From</label>
            <input type="date" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>To</label>
            <input type="date" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Reason</label>
            <input type="text" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Maintenance, etc." />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button className="btn btn-danger btn-sm" onClick={handleBlock} disabled={blocking}>
            {blocking ? 'Blocking...' : 'Block Slots'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleUnblock}>
            Unblock Slots
          </button>
        </div>
      </motion.div>

      {/* Date Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '20px' }}>
        {dateTabs.map((d) => (
          <button
            key={d.date}
            className={`filter-chip ${selectedDate === d.date ? 'active' : ''}`}
            onClick={() => setSelectedDate(d.date)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Slots Grid */}
      {loading ? (
        <Loader text="Loading slots..." />
      ) : slots.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No Slots for This Date</h3>
          <p>Generate slots using the form above to make your turf bookable.</p>
        </div>
      ) : (
        <div className="slot-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          {slots.map((slot) => {
            const status = slot.status || 'available';
            return (
              <div
                key={slot._id}
                className={`slot-item ${status}`}
                style={{ padding: '14px', position: 'relative' }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {formatTime(slot.startTime)} — {formatTime(slot.endTime)}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '6px' }} className="gradient-text">
                  {formatPrice(slot.price)}
                </div>
                <div style={{ marginTop: '4px' }}>
                  <span className={`badge badge-${status === 'available' ? 'success' : status === 'booked' ? 'info' : 'danger'}`}>
                    {status}
                  </span>
                </div>
                {status === 'available' && (
                  <div style={{ marginTop: '8px' }}>
                    <input
                      type="number"
                      placeholder="New price"
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        background: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-family)',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          handlePriceUpdate(slot._id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SlotManager;
