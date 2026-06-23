import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineAdjustments,
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlineTrendingUp,
  HiOutlineOfficeBuilding
} from 'react-icons/hi';
import { FaTrophy } from 'react-icons/fa6';
import { getTurfs } from '../../services/api';
import { SPORTS, SURFACE_TYPES, CITIES } from '../../utils/constants';
import TurfCard from '../../components/player/TurfCard';
import Loader from '../../components/common/Loader';

const SPORT_COLORS = {
  cricket: 'rgba(245, 158, 11, 0.15)',
  football: 'rgba(16, 185, 129, 0.15)',
  badminton: 'rgba(59, 130, 246, 0.15)',
  tennis: 'rgba(168, 85, 247, 0.15)',
  basketball: 'rgba(239, 68, 68, 0.15)',
  volleyball: 'rgba(236, 72, 153, 0.15)',
  hockey: 'rgba(14, 165, 233, 0.15)',
  other: 'rgba(100, 116, 139, 0.15)'
};

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Filters from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [sport, setSport] = useState(searchParams.get('sport') || '');
  const [surface, setSurface] = useState(searchParams.get('surface') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const fetchTurfs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (city) params.city = city;
      if (sport) params.sport = sport;
      if (surface) params.surface = surface;
      if (sort) params.sort = sort;

      const res = await getTurfs(params);
      const data = res.data;
      setTurfs(data.turfs || data.data || []);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / 12) || 1);
    } catch (err) {
      console.error('Failed to fetch turfs:', err);
      setTurfs([]);
    } finally {
      setLoading(false);
    }
  }, [search, city, sport, surface, sort, page]);

  useEffect(() => {
    fetchTurfs();
  }, [fetchTurfs]);

  // Request geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setUserLocation(null),
        { timeout: 8000 }
      );
    }
  }, []);

  // Sync filters to URL
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (city) params.city = city;
    if (sport) params.sport = sport;
    if (surface) params.surface = surface;
    if (sort) params.sort = sort;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [search, city, sport, surface, sort, page, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setSport('');
    setSurface('');
    setSort('');
    setPage(1);
  };

  const hasActiveFilters = city || sport || surface || sort;

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
  };

  const handleSportClick = (sportValue) => {
    setSport(sport === sportValue ? '' : sportValue);
    setPage(1);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: 'url(/images/hero-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className='hero-overlay'></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-content container">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Find & Book the Best <br />
              <span className="gradient-text">Sports Turfs</span> Near You
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Discover top-rated turfs for cricket, football, badminton & more. 
              Book instantly, play today.
            </motion.p>
            <motion.form
              onSubmit={handleSearch}
              className="hero-search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <HiOutlineSearch size={20} color="var(--color-text-muted)" />
              <input
                type="text"
                placeholder="Search turfs by name or location..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </motion.form>

            {/* Hero Trust Stats */}
            <motion.div
              className="hero-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              {[
                { num: '500+', label: 'Verified Turfs' },
                { num: '10K+', label: 'Active Players' },
                { num: '50K+', label: 'Bookings Made' }
              ].map((stat) => (
                <div key={stat.label} className="hero-stat-item">
                  <div className="hero-stat-number">{stat.num}</div>
                  <div className="hero-stat-label">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <motion.section
        className='how-it-works container'
        style={{ padding: '64px 24px' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={sectionVariants}
      >
        <h2 style={{ textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 700, marginBottom: '48px' }}>How It <span className='gradient-text'>Works</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { step: '01', title: 'Search', desc: 'Find turfs near you by sport, location, or availability', icon: <HiOutlineSearch size={26} /> },
            { step: '02', title: 'Book', desc: 'Pick your preferred time slot and confirm instantly', icon: <HiOutlineCalendar size={26} /> },
            { step: '03', title: 'Play', desc: 'Show up, play your game, and leave a review', icon: <FaTrophy size={24} /> }
          ].map((item) => (
            <motion.div
              key={item.step}
              className='card'
              style={{ textAlign: 'center', padding: '32px 24px' }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <div className="how-it-works-icon">{item.icon}</div>
              <div className='gradient-text' style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '8px' }}>STEP {item.step}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>{item.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Sports */}
      <motion.section
        className="featured-sports container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={sectionVariants}
      >
        <h2 style={{ textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontSize: '2.25rem', fontWeight: 800, marginBottom: '12px' }}>
          Browse by <span className='gradient-text'>Sport</span>
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: '48px', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 48px' }}>
          Select a sport to filter courts and see available slots instantly.
        </p>
        <div className="featured-sports-grid">
          {SPORTS.filter(s => s.value !== 'other').map((s) => (
            <motion.div
              key={s.value}
              className={`featured-sport-card ${sport === s.value ? 'active' : ''}`}
              onClick={() => handleSportClick(s.value)}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="featured-sport-image"
                style={{ backgroundImage: `url(/images/sport-${s.value}.png)` }}
              />
              <div className="featured-sport-overlay"></div>
              
              {sport === s.value && (
                <div className="featured-sport-active-indicator">
                  <span className="active-dot"></span>
                  Selected
                </div>
              )}

              <div className="featured-sport-info">
                <span className="featured-sport-emoji-badge">{s.icon}</span>
                <span className="featured-sport-label">{s.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="container" style={{ padding: '32px 24px 64px' }}>
        {/* Filter Bar */}
        <div className="filter-bar">
          <button
            className={`filter-chip ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <HiOutlineAdjustments size={16} />
            Filters
          </button>

          {/* Quick Sport Filters */}
          {SPORTS.slice(0, 6).map((s) => (
            <button
              key={s.value}
              className={`filter-chip ${sport === s.value ? 'active' : ''}`}
              onClick={() => { setSport(sport === s.value ? '' : s.value); setPage(1); }}
            >
              {s.icon} {s.label}
            </button>
          ))}

          {hasActiveFilters && (
            <button className="filter-chip" onClick={clearFilters} style={{ color: 'var(--color-danger)' }}>
              <HiOutlineX size={14} />
              Clear
            </button>
          )}
        </div>

        {/* Expanded Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="filter-panel"
            style={{ marginBottom: '24px' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>City</label>
                <select value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }}>
                  <option value="">All Cities</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Surface Type</label>
                <select value={surface} onChange={(e) => { setSurface(e.target.value); setPage(1); }}>
                  <option value="">All Surfaces</option>
                  {SURFACE_TYPES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Sort By</label>
                <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                  <option value="">Default</option>
                  <option value="price">Price: Low → High</option>
                  <option value="-price">Price: High → Low</option>
                  <option value="-averageRating">Top Rated</option>
                  <option value="-createdAt">Newest</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            {loading ? 'Searching...' : `${turfs.length} turfs found`}
          </p>
        </div>

        {/* Turf Grid */}
        {loading ? (
          <Loader text="Finding the best turfs for you..." />
        ) : turfs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ color: 'var(--color-text-muted)' }}>
              <HiOutlineOfficeBuilding size={64} />
            </div>
            <h3>No Turfs Found</h3>
            <p>Try adjusting your search or filters to find turfs near you.</p>
            {hasActiveFilters && (
              <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={clearFilters}>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="turf-grid">
            {turfs.map((turf, i) => (
              <motion.div
                key={turf._id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={cardVariants}
              >
                <TurfCard turf={turf} userLocation={userLocation} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span style={{ color: 'var(--color-text-muted)', padding: '0 4px' }}>…</span>
                  )}
                  <button
                    className={`pagination-btn ${page === p ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              className="pagination-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              →
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
