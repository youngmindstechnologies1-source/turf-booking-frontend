import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { getSlots, getTurfBookings } from '../../services/api';
import { formatTime, formatPrice, formatDate } from '../../utils/helpers';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineX } from 'react-icons/hi';

const BookingCalendar = () => {
  const { turfId } = useParams();
  const [turf, setTurf] = useState(null);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [slotsData, setSlotsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        const res = await api.get(`/turfs/${turfId}`);
        setTurf(res.data.turf || res.data.data || res.data);
      } catch {
        // Turf not found
      }
    };
    fetchTurf();
  }, [turfId]);

  const fetchWeekSlots = useCallback(async () => {
    setLoading(true);
    const allSlots = {};
    try {
      for (const day of weekDays) {
        const dateStr = format(day, 'yyyy-MM-dd');
        try {
          const res = await getSlots(turfId, dateStr);
          const data = res.data.slots || res.data.data || [];
          allSlots[dateStr] = Array.isArray(data) ? data : [];
        } catch {
          allSlots[dateStr] = [];
        }
      }
      setSlotsData(allSlots);
    } finally {
      setLoading(false);
    }
  }, [turfId, weekStart]);

  useEffect(() => {
    fetchWeekSlots();
  }, [fetchWeekSlots]);

  const navigateWeek = (direction) => {
    setWeekStart((prev) => addDays(prev, direction * 7));
  };

  // Collect all unique time slots across the week
  const allTimeSlots = new Set();
  Object.values(slotsData).forEach((daySlots) => {
    daySlots.forEach((slot) => {
      allTimeSlots.add(slot.startTime);
    });
  });
  const sortedTimes = Array.from(allTimeSlots).sort();

  const getSlotForDayTime = (dateStr, time) => {
    return (slotsData[dateStr] || []).find((s) => s.startTime === time);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Booking Calendar</h1>
        <p className="page-subtitle">{turf?.name || 'Loading...'}</p>
      </div>

      {/* Week Navigation */}
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <button className="btn btn-ghost" onClick={() => navigateWeek(-1)}>
          <HiOutlineChevronLeft size={20} /> Previous Week
        </button>
        <h3 style={{ fontSize: 'var(--font-size-base)' }}>
          {format(weekDays[0], 'dd MMM')} — {format(weekDays[6], 'dd MMM yyyy')}
        </h3>
        <button className="btn btn-ghost" onClick={() => navigateWeek(1)}>
          Next Week <HiOutlineChevronRight size={20} />
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { color: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', label: 'Available' },
          { color: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', label: 'Booked' },
          { color: 'rgba(100, 116, 139, 0.15)', border: 'rgba(100, 116, 139, 0.3)', label: 'Blocked' },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: l.color, border: `1px solid ${l.border}` }} />
            {l.label}
          </div>
        ))}
      </div>

      {loading ? (
        <Loader text="Loading calendar..." />
      ) : sortedTimes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No Slots This Week</h3>
          <p>Generate slots from the Slot Manager to see them here.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div className="calendar-grid">
            {/* Header Row */}
            <div className="calendar-header">Time</div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="calendar-header">
                <div>{format(day, 'EEE')}</div>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>{format(day, 'd')}</div>
              </div>
            ))}

            {/* Time Rows */}
            {sortedTimes.map((time) => (
              <React.Fragment key={time}>
                <div className="calendar-time">{formatTime(time)}</div>
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const slot = getSlotForDayTime(dateStr, time);

                  if (!slot) {
                    return <div key={dateStr} className="calendar-cell" />;
                  }

                  return (
                    <div
                      key={dateStr}
                      className={`calendar-cell ${slot.status}`}
                      onClick={() => slot.status === 'booked' && slot.booking && setSelectedBooking(slot)}
                      style={{ cursor: slot.status === 'booked' ? 'pointer' : 'default' }}
                      title={`${formatTime(time)} — ${slot.status} — ${formatPrice(slot.price)}`}
                    >
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.9 }}>
                        {formatPrice(slot.price)}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3>Slot Details</h3>
              <button className="btn btn-ghost" onClick={() => setSelectedBooking(null)} style={{ padding: '4px' }}>
                <HiOutlineX size={20} />
              </button>
            </div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              <p><strong>Time:</strong> {formatTime(selectedBooking.startTime)} — {formatTime(selectedBooking.endTime)}</p>
              <p><strong>Status:</strong> <span className="badge badge-info">{selectedBooking.status}</span></p>
              <p><strong>Price:</strong> {formatPrice(selectedBooking.price)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Need React import for React.Fragment
import React from 'react';

export default BookingCalendar;
