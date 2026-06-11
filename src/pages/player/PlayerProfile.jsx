import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUserProfile, toggleFollow } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice, formatDate, getSportIcon } from '../../utils/helpers';
import {
  HiOutlineUserAdd,
  HiOutlineUserRemove,
  HiOutlineArrowLeft,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineSparkles,
  HiOutlinePlusCircle,
  HiOutlineMinusCircle
} from 'react-icons/hi';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const PlayerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getUserProfile(id);
      setProfile(res.data.profile);
    } catch (err) {
      toast.error('Failed to load player profile');
      navigate('/matches');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    setLoading(true);
    fetchProfile();
  }, [fetchProfile]);

  const handleFollow = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      const res = await toggleFollow(id);
      setProfile((prev) => ({
        ...prev,
        isFollowing: res.data.isFollowing,
        followersCount: res.data.isFollowing ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1),
      }));
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to follow player');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader text="Loading player profile..." />;
  if (!profile) return null;

  const currentUserId = currentUser?.id || currentUser?._id;
  const isSelf = profile.id === currentUserId;

  const getSkillLevelBadge = (level) => {
    switch (level) {
      case 'beginner':
        return <span className="badge badge-success">Beginner</span>;
      case 'intermediate':
        return <span className="badge badge-warning">Intermediate</span>;
      case 'advanced':
        return <span className="badge badge-danger">Advanced</span>;
      default:
        return <span className="badge badge-info">Beginner</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '32px 24px 64px', maxWidth: '960px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost"
        style={{ marginBottom: '24px', paddingLeft: 0 }}
      >
        <HiOutlineArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        {/* Left Column: Player Card */}
        <div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ textAlign: 'center', padding: '32px' }}>
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: 800,
                margin: '0 auto 16px',
              }}
            >
              {profile.name?.charAt(0)?.toUpperCase()}
            </div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '4px' }}>{profile.name}</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              {profile.email}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              {getSkillLevelBadge(profile.skillLevel)}
              <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                {profile.role}
              </span>
            </div>

            {/* Stats */}
            <div className="profile-stats" style={{ padding: '12px', margin: '0 0 24px' }}>
              <div className="profile-stat-item" style={{ flex: 1 }}>
                <div className="profile-stat-value">{profile.followingCount}</div>
                <div className="profile-stat-label">Following</div>
              </div>
              <div className="profile-stat-item" style={{ flex: 1 }}>
                <div className="profile-stat-value">{profile.followersCount}</div>
                <div className="profile-stat-label">Followers</div>
              </div>
            </div>

            {/* Follow Toggle */}
            {!isSelf && (
              <button
                onClick={handleFollow}
                className={`btn ${profile.isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                style={{ width: '100%' }}
                disabled={actionLoading}
              >
                {profile.isFollowing ? <HiOutlineMinusCircle size={16} /> : <HiOutlinePlusCircle size={16} />}
                {profile.isFollowing ? 'Following' : 'Follow Player'}
              </button>
            )}

            {isSelf && (
              <Link to="/profile" className="btn btn-secondary" style={{ width: '100%' }}>
                Edit My Profile
              </Link>
            )}
          </motion.div>
        </div>

        {/* Right Column: Hosted/Joined Matches list */}
        <div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            {/* Matches Hosted */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlineSparkles color="var(--color-primary)" /> Matches Hosted
              </h3>
              {profile.hostedMatches?.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '24px' }}>
                  No matches hosted yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {profile.hostedMatches.map((match) => (
                    <Link
                      key={match._id}
                      to={`/matches/${match._id}`}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', transition: 'all 0.2s' }}
                      className="match-history-item"
                    >
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 4px 0' }}>{match.title}</h4>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <HiOutlineCalendar /> {formatDate(match.date)}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <HiOutlineClock /> {match.startTime} - {match.endTime}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}>
                            <HiOutlineLocationMarker /> {match.turf?.name}
                          </span>
                        </div>
                      </div>
                      <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>{match.sport}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Matches Joined */}
            <div className="card">
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlineCalendar color="var(--color-primary)" /> Matches Joined
              </h3>
              {profile.joinedMatches?.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '24px' }}>
                  No matches joined yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {profile.joinedMatches.map((match) => (
                    <Link
                      key={match._id}
                      to={`/matches/${match._id}`}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', transition: 'all 0.2s' }}
                      className="match-history-item"
                    >
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 4px 0' }}>{match.title}</h4>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <HiOutlineCalendar /> {formatDate(match.date)}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <HiOutlineClock /> {match.startTime} - {match.endTime}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}>
                            <HiOutlineLocationMarker /> {match.turf?.name}
                          </span>
                        </div>
                      </div>
                      <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>{match.sport}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
