import axios from 'axios';

const api = axios.create({
  baseURL: 'http://13.206.218.114/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/update-profile', data);
export const changePassword = (data) => api.put('/auth/change-password', data);
export const toggleFavourite = (turfId) => api.put(`/auth/favourites/${turfId}`);

// Turfs
export const getTurfs = (params) => api.get('/turfs', { params });
export const getTurfBySlug = (slug) => api.get(`/turfs/${slug}`);
export const createTurf = (data) => api.post('/turfs', data);
export const updateTurf = (id, data) => api.put(`/turfs/${id}`, data);
export const deleteTurf = (id) => api.delete(`/turfs/${id}`);
export const getMyTurfs = () => api.get('/turfs/owner/my-turfs');
export const uploadPhotos = (id, formData) =>
  api.post(`/turfs/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Slots
export const generateSlots = (data) => api.post('/slots/generate', data);
export const getSlots = (turfId, date) => api.get(`/slots/${turfId}`, { params: { date } });
export const updateSlotPrice = (id, price) => api.put(`/slots/${id}/price`, { price });
export const blockSlots = (data) => api.put('/slots/block', data);
export const unblockSlots = (data) => api.put('/slots/unblock', data);

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/my-bookings');
export const getTurfBookings = (turfId, params) => api.get(`/bookings/turf/${turfId}`, { params });
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);

// Reviews
export const createReview = (data) => api.post('/reviews', data);
export const getTurfReviews = (turfId, params) => api.get(`/reviews/turf/${turfId}`, { params });
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// Admin
export const getPendingTurfs = () => api.get('/admin/turfs/pending');
export const approveTurf = (id) => api.put(`/admin/turfs/${id}/approve`);
export const rejectTurf = (id, notes) => api.put(`/admin/turfs/${id}/reject`, { notes });
export const getUsers = (params) => api.get('/admin/users', { params });
export const toggleUserActive = (id) => api.put(`/admin/users/${id}/toggle-active`);
export const getAllBookings = (params) => api.get('/admin/bookings', { params });
export const adminCancelBooking = (id) => api.put(`/admin/bookings/${id}/cancel`);
export const getStats = () => api.get('/admin/stats');

export default api;
