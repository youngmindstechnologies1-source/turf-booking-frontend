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
      return 'badge-warning';
    case 'approved':
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
