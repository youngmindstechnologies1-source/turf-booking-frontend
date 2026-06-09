import { useState, useEffect, useCallback } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { getSlots } from '../../services/api';
import { formatTime, formatPrice } from '../../utils/helpers';
import Loader from '../common/Loader';

const SlotPicker = ({ turfId, sport, onSlotsSelected }) => {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const next7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
    setDates(next7Days);
    setSelectedDate(next7Days[0]);
  }, []);

  const fetchSlots = useCallback(async () => {
    if (!turfId || !selectedDate) return;
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await getSlots(turfId, dateStr);
      const slotData = res.data.slots || res.data.data || res.data || [];
      setSlots(Array.isArray(slotData) ? slotData : []);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [turfId, selectedDate]);

  useEffect(() => {
    fetchSlots();
    setSelectedSlots([]);
  }, [fetchSlots]);

  const handleSlotClick = (slot) => {
    if (slot.status !== 'available') return;

    setSelectedSlots((prev) => {
      const isSelected = prev.some((s) => s._id === slot._id);
      const newSelection = isSelected
        ? prev.filter((s) => s._id !== slot._id)
        : [...prev, slot];

      if (onSlotsSelected) {
        onSlotsSelected(newSelection);
      }
      return newSelection;
    });
  };

  const isSlotSelected = (slot) => selectedSlots.some((s) => s._id === slot._id);

  const totalPrice = selectedSlots.reduce((sum, s) => sum + (s.price || 0), 0);

  return (
    <div>
      {/* Date Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '4px 0',
        marginBottom: '20px'
      }}>
        {dates.map((date) => (
          <button
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
            style={{
              minWidth: '70px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: isSameDay(date, selectedDate)
                ? '2px solid var(--color-primary)'
                : '1px solid var(--color-border)',
              background: isSameDay(date, selectedDate)
                ? 'rgba(16, 185, 129, 0.15)'
                : 'var(--color-bg-tertiary)',
              color: isSameDay(date, selectedDate)
                ? 'var(--color-primary)'
                : 'var(--color-text-secondary)',
              cursor: 'pointer',
              textAlign: 'center',
              fontFamily: 'inherit',
              transition: 'var(--transition)',
              flexShrink: 0
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase' }}>
              {format(date, 'EEE')}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '2px' }}>
              {format(date, 'd')}
            </div>
            <div style={{ fontSize: '0.7rem' }}>
              {format(date, 'MMM')}
            </div>
          </button>
        ))}
      </div>

      {/* Slots Grid */}
      {loading ? (
        <Loader text="Loading slots..." />
      ) : slots.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 20px' }}>
          <div className="empty-state-icon">📅</div>
          <h3>No Slots Available</h3>
          <p>No slots found for this date. Try another date.</p>
        </div>
      ) : (
        <div className="slot-grid">
          {slots.map((slot) => {
            const status = slot.status || 'available';
            const selected = isSlotSelected(slot);
            let className = 'slot-item';
            if (selected) className += ' selected';
            else if (status === 'booked') className += ' booked';
            else if (status === 'blocked') className += ' blocked';
            else className += ' available';

            return (
              <div
                key={slot._id}
                className={className}
                onClick={() => handleSlotClick(slot)}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {formatTime(slot.startTime)}
                </div>
                <div style={{ fontSize: '0.7rem', marginTop: '4px', opacity: 0.8 }}>
                  {formatTime(slot.endTime)}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '4px' }}>
                  {formatPrice(slot.price)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selection Summary */}
      {selectedSlots.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} selected
          </span>
          <span style={{
            fontWeight: 800,
            fontSize: '1.1rem',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Total: {formatPrice(totalPrice)}
          </span>
        </div>
      )}
    </div>
  );
};

export default SlotPicker;
