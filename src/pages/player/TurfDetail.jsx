import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineCheckCircle,
  HiOutlinePhotograph,
} from 'react-icons/hi';
import { getTurfBySlug, getTurfReviews, createBooking } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice, formatDate, getSportIcon } from '../../utils/helpers';
import { AMENITIES } from '../../utils/constants';
import SlotPicker from '../../components/player/SlotPicker';
import PaymentModeModal from '../../components/player/PaymentModeModal';
import StarRating from '../../components/common/StarRating';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const TurfDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [turf, setTurf] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [booking, setBooking] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchTurf = useCallback(async () => {
    try {
      const res = await getTurfBySlug(slug);
      const data = res.data.turf || res.data.data || res.data;
      setTurf(data);
      if (data.sports?.length > 0) {
        setSelectedSport(data.sports[0]);
      }
    } catch (err) {
      console.error('Failed to fetch turf:', err);
      toast.error('Turf not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  const fetchReviews = useCallback(async () => {
    if (!turf?._id) return;
    try {
      const res = await getTurfReviews(turf._id);
      setReviews(res.data.reviews || res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  }, [turf?._id]);

  useEffect(() => {
    fetchTurf();
  }, [fetchTurf]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSlotsSelected = (slots) => {
    setSelectedSlots(slots);
  };

  const handleBookNowClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book');
      navigate('/login');
      return;
    }

    if (selectedSlots.length === 0) {
      toast.error('Please select at least one slot');
      return;
    }

    if (!selectedSport) {
      toast.error('Please select a sport');
      return;
    }

    setShowPaymentModal(true);
  };

  const handleBookingConfirm = async ({ paymentMode, playerCount }) => {
    setBooking(true);
    try {
      const res = await createBooking({
        turfId: turf._id,
        slotIds: selectedSlots.map((s) => s._id),
        sport: selectedSport,
        paymentMode,
        playerCount,
      });
      const data = res.data.booking || res.data.data || res.data;
      setShowPaymentModal(false);
      setSelectedSlots([]);
      toast.success(paymentMode === 'upi_split' ? 'Split created!' : 'Booking confirmed!');
      // Navigate to the confirmation page
      navigate(`/booking/${data._id}/confirmation`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Slots may have been taken.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <Loader text="Loading turf details..." />;
  if (!turf) return null;

  const totalPrice = selectedSlots.reduce((sum, s) => sum + (s.price || 0), 0);

  const getAmenityIcon = (value) => {
    const found = AMENITIES.find((a) => a.value === value);
    return found ? found.icon : '✓';
  };

  const getAmenityLabel = (value) => {
    const found = AMENITIES.find((a) => a.value === value);
    return found ? found.label : value;
  };

  const getPhotoUrl = (p) => {
    if (!p) return '';
    if (p.startsWith('/s3/') || p.startsWith('/uploads/')) return p;
    if (p.startsWith('http')) {
      try {
        const url = new URL(p);
        return `/s3${url.pathname}`;
      } catch {
        return p;
      }
    }
    return `/uploads/${p}`;
  };

  const photos = turf.photos?.map(getPhotoUrl) || [];

  return (
    <div style={{ paddingBottom: '64px' }}>
      {/* Photo Gallery */}
      <div className="container" style={{ paddingTop: '24px' }}>
        {photos.length > 0 ? (
          <div className="photo-gallery" style={{ position: 'relative' }}>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={0}
              slidesPerView={1}
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              {photos.map((photo, i) => (
                <SwiperSlide key={i}>
                  <img src={photo} alt={`${turf.name} - ${i + 1}`} />
                </SwiperSlide>
              ))}
            </Swiper>
            {photos.length > 1 && (
              <div className="image-counter-badge">
                <HiOutlinePhotograph size={14} />
                {photos.length} photos
              </div>
            )}
          </div>
        ) : (
          <img src='/images/turf-placeholder.png' alt={turf.name} style={{ width: '100%', height: '350px', objectFit: 'cover', borderRadius: 'var(--radius-xl)' }} />
        )}
      </div>

      {/* Content */}
      <div className="container" style={{ marginTop: '32px' }}>
        <div className="turf-detail-grid">
          {/* Left Column - Turf Info */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span className={`badge ${turf.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                  {turf.status}
                </span>
                {turf.surfaceType && (
                  <span className="badge badge-info">{turf.surfaceType.replace('-', ' ')}</span>
                )}
              </div>

              <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>
                {turf.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)' }}>
                  <HiOutlineLocationMarker size={18} />
                  <span style={{ textTransform: 'capitalize' }}>{turf.address || turf.city}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <StarRating rating={turf.averageRating || 0} size={16} />
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    ({turf.totalReviews || turf.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Description */}
              {turf.description && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '12px' }}>About</h3>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                    {turf.description}
                  </p>
                </div>
              )}

              {/* Sports */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '12px' }}>Sports Available</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {turf.sports?.map((s) => (
                    <span
                      key={s}
                      style={{
                        background: 'var(--color-bg-tertiary)',
                        border: '1px solid var(--color-border)',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {getSportIcon(s)} {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              {turf.amenities?.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '12px' }}>Amenities</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                    {turf.amenities.map((a) => (
                      <div
                        key={a}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          background: 'var(--color-bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.9rem',
                        }}
                      >
                        <span>{getAmenityIcon(a)}</span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{getAmenityLabel(a)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Operating Hours */}
              {turf.operatingHours && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '12px' }}>
                    <HiOutlineClock style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Operating Hours
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {turf.operatingHours.open} — {turf.operatingHours.close}
                  </p>
                  {turf.slotDuration && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                      {turf.slotDuration} min slots
                    </p>
                  )}
                </div>
              )}

              {/* Reviews */}
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '20px' }}>
                  Reviews ({reviews.length})
                </h3>
                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)' }}>No reviews yet. Be the first to review!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reviews.map((review) => (
                      <div key={review._id} className="card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'var(--gradient-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                              }}
                            >
                              {review.player?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                {review.player?.name || 'Player'}
                              </p>
                              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                                {formatDate(review.createdAt)}
                              </p>
                            </div>
                          </div>
                          <StarRating rating={review.rating} size={14} />
                        </div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Booking Sidebar */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
                  <HiOutlineCurrencyRupee size={20} style={{ color: 'var(--color-primary)' }} />
                  <span className="gradient-text" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>
                    {formatPrice(turf.pricePerHour)}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>/hour</span>
                </div>

                {/* Sport Selection */}
                {turf.sports?.length > 1 && (
                  <div className="input-group">
                    <label>Select Sport</label>
                    <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)}>
                      {turf.sports.map((s) => (
                        <option key={s} value={s}>{getSportIcon(s)} {s}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Slot Picker */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                    Select Date & Time
                  </label>
                  <SlotPicker
                    turfId={turf._id}
                    sport={selectedSport}
                    onSlotsSelected={handleSlotsSelected}
                  />
                </div>

                {/* Booking Summary */}
                {selectedSlots.length > 0 && (
                  <div style={{
                    padding: '16px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '16px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Slots</span>
                      <span style={{ fontSize: '0.85rem' }}>{selectedSlots.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Sport</span>
                      <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{selectedSport}</span>
                    </div>
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }}>Total</span>
                      <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  className={`btn btn-primary btn-lg ${selectedSlots.length > 0 ? 'btn-book-pulse' : ''}`}
                  style={{ width: '100%' }}
                  onClick={handleBookNowClick}
                  disabled={booking || selectedSlots.length === 0}
                >
                  {booking ? 'Booking...' : selectedSlots.length === 0 ? 'Select Slots to Book' : `Book Now — ${formatPrice(totalPrice)}`}
                </button>

                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '12px' }}>
                  💳 Pay at venue or split via UPI • Free cancellation
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Payment Mode Modal */}
      <PaymentModeModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={totalPrice}
        turf={turf}
        onConfirm={handleBookingConfirm}
        isSubmitting={booking}
      />
    </div>
  );
};

export default TurfDetail;
