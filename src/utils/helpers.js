import { format, parseISO, eachDayOfInterval, isValid } from 'date-fns';
import { SPORTS } from './constants';

export const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

export const formatDate = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(d)) return '';
    return format(d, 'dd MMM yyyy');
  } catch {
    return '';
  }
};

export const formatTime = (time) => {
  if (!time) return '';
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch {
    return time;
  }
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return 'badge-success';
    case 'completed':
      return 'badge-info';
    case 'cancelled':
      return 'badge-danger';
    case 'pending':
    case 'pending_split':
      return 'badge-warning';
    case 'approved':
    case 'fully_settled':
      return 'badge-success';
    case 'rejected':
      return 'badge-danger';
    case 'active':
      return 'badge-success';
    case 'inactive':
      return 'badge-danger';
    default:
      return 'badge-primary';
  }
};

export const getSportIcon = (sport) => {
  const found = SPORTS.find(s => s.value === sport?.toLowerCase());
  return found ? found.icon : '🎯';
};

export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
};

export const generateDateRange = (start, end) => {
  try {
    const startDate = typeof start === 'string' ? parseISO(start) : new Date(start);
    const endDate = typeof end === 'string' ? parseISO(end) : new Date(end);
    if (!isValid(startDate) || !isValid(endDate)) return [];
    return eachDayOfInterval({ start: startDate, end: endDate });
  } catch {
    return [];
  }
};

/**
 * Generate a UPI Intent URI for direct VPA payment.
 * @param {string} vpa - Turf owner's UPI VPA
 * @param {string} name - Display name for the payee
 * @param {number} amount - Amount in INR
 * @param {string} bookingRef - Booking reference for transaction note
 * @returns {string} UPI Intent URI
 */
export const generateUpiIntent = (vpa, name, amount, bookingRef) => {
  const params = new URLSearchParams({
    pa: vpa,
    pn: name || 'PitchPe',
    am: String(amount),
    cu: 'INR',
    tn: `Share ${bookingRef}`,
  });
  return `upi://pay?${params.toString()}`;
};

/**
 * Generate shareable text for WhatsApp with split payment link.
 */
export const generateWhatsAppShareText = (booking, splitUrl) => {
  const lines = [
    `🏏 *Turf Booking — ${booking.turfName || 'Turf'}*`,
    `📅 ${formatDate(booking.date)} • ${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`,
    `💰 Total: ₹${booking.totalAmount} • Per person: ₹${booking.splitAmount}`,
    `👥 ${booking.playerCount} players`,
    '',
    booking.paymentMode === 'upi_split'
      ? `Pay your share here 👇`
      : `Booking confirmed! Details 👇`,
    splitUrl,
    '',
    `Ref: ${booking.bookingRef}`,
  ];
  return lines.join('\n');
};

/**
 * Get emoji/icon for a split ledger status.
 */
export const getSplitStatusIcon = (status) => {
  switch (status) {
    case 'settled': return '✅';
    case 'verified_by_host': return '✅';
    case 'utr_submitted': return '🔄';
    case 'pay_at_turf': return '💵';
    case 'unpaid': return '⏳';
    default: return '⏳';
  }
};

/**
 * Get human-readable label for a split ledger status.
 */
export const getSplitStatusLabel = (status) => {
  switch (status) {
    case 'settled': return 'Settled';
    case 'verified_by_host': return 'Paid';
    case 'utr_submitted': return 'UTR Submitted';
    case 'pay_at_turf': return 'Cash at Venue';
    case 'unpaid': return 'Unpaid';
    default: return 'Unpaid';
  }
};

/**
 * Format milliseconds into mm:ss countdown string.
 */
export const formatCountdown = (ms) => {
  if (ms <= 0) return '0:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

