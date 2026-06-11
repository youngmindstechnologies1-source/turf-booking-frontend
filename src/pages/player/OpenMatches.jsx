import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getOpenMatches } from '../../services/api';
import { SPORTS, CITIES } from '../../utils/constants';
import { formatPrice, formatDate, getSportIcon } from '../../utils/helpers';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineLocationMarker, HiOutlineUserGroup, HiOutlineSearch, HiOutlineUserCircle } from 'react-icons/hi';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const OpenMatches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sport: '',
    skillLevel: 'all',
    city: '',
  });

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.sport) params.sport = filters.sport;
      if (filters.skillLevel && filters.skillLevel !== 'all') params.skillLevel = filters.skillLevel;
      if (filters.city) params.city = filters.city;

      const res = await getOpenMatches(params);
      setMatches(res.data.matches || []);
    } catch (err) {
      toast.error('Failed to load open matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getSkillLevelBadge = (level) => {
    switch (level) {
      case 'beginner':
        return <span className="badge badge-success">Beginner</span>;
      case 'intermediate':
        return <span className="badge badge-warning">Intermediate</span>;
      case 'advanced':
        return <span className="badge badge-danger">Advanced</span>;
      default:
        return <span className="badge badge-info">All Skills</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '32px 24px 64px' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Open Matches Feed</h1>
        <p className="page-subtitle">Find local games looking for players and join the action</p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '20px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Sport Selector */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Sport</label>
            <select value={filters.sport} onChange={(e) => handleFilterChange('sport', e.target.value)}>
              <option value="">All Sports</option>
              {SPORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Level Selector */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Skill Level</label>
            <select value={filters.skillLevel} onChange={(e) => handleFilterChange('skillLevel', e.target.value)}>
              <option value="all">Any Skill Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* City Selector */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>City</label>
            <select value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)}>
              <option value="">All Cities</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feed Content */}
      {loading ? (
        <Loader text="Searching for matches..." />
      ) : matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <HiOutlineSearch size={48} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '8px' }}>No matches found</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Try adjusting your search filters or book a slot to host your own match!
          </p>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => {
            const currentHeadcount = match.hostTeamCount + (match.joinedPlayers?.length || 0);
            const openSpots = match.maxPlayers - currentHeadcount;
            const spotsFullPercent = (currentHeadcount / match.maxPlayers) * 100;
            const pricePerSpot = Math.ceil((match.turf?.pricePerHour || 1000) / match.maxPlayers);

            return (
              <motion.div
                key={match._id}
                className="card match-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/matches/${match._id}`)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
                        {getSportIcon(match.sport)}
                      </span>
                      <div>
                        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, margin: 0 }}>
                          {match.title}
                        </h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', margin: 0 }}>
                          Hosted by {match.host?.name}
                        </p>
                      </div>
                    </div>
                    {getSkillLevelBadge(match.skillLevel)}
                  </div>

                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {match.description || 'Join our squad for an exciting game! Cost split equally.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      <HiOutlineCalendar size={16} />
                      <span>{formatDate(match.date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      <HiOutlineClock size={16} />
                      <span>{match.startTime} - {match.endTime}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      <HiOutlineLocationMarker size={16} />
                      <span style={{ textTransform: 'capitalize' }}>
                        {match.turf?.name}, {match.turf?.city}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Headcount Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    <span>Headcount</span>
                    <span style={{ fontWeight: 600 }}>{currentHeadcount} / {match.maxPlayers} players</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${spotsFullPercent}%` }} />
                  </div>
                  
                  {/* Open spots & split share */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <div>
                      {openSpots > 0 ? (
                        <span className="badge badge-success" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                          {openSpots} Spots Open
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                          Full
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', margin: 0 }}>Split Cost</p>
                      <p className="gradient-text" style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>
                        {formatPrice(pricePerSpot)} / player
                      </p>
                    </div>
                  </div>

                  <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '16px' }}>
                    View Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpenMatches;
