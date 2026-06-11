import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMatchDetails, joinMatch, leaveMatch, toggleFollow } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice, formatDate, getSportIcon } from '../../utils/helpers';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineArrowLeft,
  HiOutlinePlusCircle,
  HiOutlineMinusCircle,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineCurrencyRupee
} from 'react-icons/hi';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [match, setMatch] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isFollowingHost, setIsFollowingHost] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      const res = await getMatchDetails(id);
      setMatch(res.data.match);
      setBooking(res.data.booking);
      
      // Check if current user is following host
      if (res.data.match?.host?._id) {
        // Fetch target host profile to check follow status
        const currentUserId = user?.id || user?._id;
        const followingArray = res.data.match?.host?.followers || [];
        setIsFollowingHost(followingArray.includes(currentUserId));
      }
    } catch (err) {
      toast.error('Failed to load match details');
      navigate('/matches');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, user]);

  useEffect(() => {
    setLoading(true);
    fetchDetails();
  }, [fetchDetails]);

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await joinMatch(id);
      toast.success('Successfully joined match!');
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join match');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await leaveMatch(id);
      toast.success('Successfully left match.');
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave match');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFollowHost = async () => {
    if (!match?.host?._id) return;
    try {
      const res = await toggleFollow(match.host._id);
      setIsFollowingHost(res.data.isFollowing);
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to follow host');
    }
  };

  if (loading) return <Loader text="Loading match details..." />;
  if (!match) return null;

  const currentUserId = user?.id || user?._id;
  const isHost = match.host?._id === currentUserId;
  const isJoined = match.joinedPlayers?.some((p) => p.user?._id === currentUserId);
  const currentHeadcount = match.hostTeamCount + (match.joinedPlayers?.length || 0);
  const isFull = currentHeadcount >= match.maxPlayers;
  const pricePerSpot = Math.ceil((booking?.totalAmount || match.turf?.pricePerHour || 1000) / match.maxPlayers);

  const getSkillLevelBadge = (level) => {
    switch (level) {
      case 'beginner':
        return <span className="badge badge-success">Beginner Only</span>;
      case 'intermediate':
        return <span className="badge badge-warning">Intermediate Only</span>;
      case 'advanced':
        return <span className="badge badge-danger">Advanced Only</span>;
      default:
        return <span className="badge badge-info">Open to All Skills</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '32px 24px 64px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/matches')}
        className="btn btn-ghost"
        style={{ marginBottom: '24px', paddingLeft: 0 }}
      >
        <HiOutlineArrowLeft size={16} /> Back to Open Matches
      </button>

      {/* Grid Layout */}
      <div className="turf-detail-grid">
        {/* Left Column: Match Details */}
        <div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {getSportIcon(match.sport)} {match.sport}
              </span>
              {getSkillLevelBadge(match.skillLevel)}
            </div>

            <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: '16px', fontFamily: "'Outfit', sans-serif" }}>
              {match.title}
            </h1>

            {/* Description */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '12px' }}>Description</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                {match.description || 'No description provided. Come down for a great game of sports! Cost is split equally.'}
              </p>
            </div>

            {/* Match Information */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '16px' }}>Venue & Time</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HiOutlineCalendar size={20} color="var(--color-primary)" />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Date</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{formatDate(match.date)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HiOutlineClock size={20} color="var(--color-primary)" />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Time</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{match.startTime} - {match.endTime}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', gridColumn: 'span 2' }}>
                  <HiOutlineLocationMarker size={20} color="var(--color-primary)" />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Turf Address</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>
                      {match.turf?.name}, {match.turf?.address}, {match.turf?.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Host Section */}
            <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {match.host?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Hosted By</p>
                  <Link to={`/profile/${match.host?._id}`} style={{ fontWeight: 700, fontSize: '1.05rem', display: 'block' }}>
                    {match.host?.name}
                  </Link>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem', padding: '1px 8px', marginTop: '4px' }}>
                    {match.host?.skillLevel || 'beginner'}
                  </span>
                </div>
              </div>
              
              {!isHost && (
                <button
                  onClick={handleFollowHost}
                  className={`btn btn-sm ${isFollowingHost ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {isFollowingHost ? <HiOutlineMinusCircle size={14} /> : <HiOutlinePlusCircle size={14} />}
                  {isFollowingHost ? 'Following' : 'Follow Player'}
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Headcount & Joined Players */}
        <div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlineUserGroup color="var(--color-primary)" /> Match Headcount
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span>Headcount status</span>
                <span style={{ fontWeight: 700 }}>{currentHeadcount} / {match.maxPlayers} Joined</span>
              </div>
              <div className="progress-bar-container" style={{ marginBottom: '24px' }}>
                <div className="progress-bar-fill" style={{ width: `${(currentHeadcount / match.maxPlayers) * 100}%` }} />
              </div>

              {/* Price Calculation */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  <span>Total Slot Price</span>
                  <span>{formatPrice(booking?.totalAmount || match.turf?.pricePerHour || 1000)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  <span>Total Players</span>
                  <span>{match.maxPlayers}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>Your Split Cost</span>
                  <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.4rem' }}>
                    {formatPrice(pricePerSpot)}
                  </span>
                </div>
              </div>

              {/* Split Booking Warning */}
              {isJoined && booking?.paymentMode === 'upi_split' && (
                <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '0.85rem' }}>
                  <p style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <HiOutlineSparkles color="#3B82F6" /> Split Payment Required
                  </p>
                  <p style={{ margin: '0 0 12px 0', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                    This match uses UPI Split payments. Tap below to submit your payment details or UTR code.
                  </p>
                  <Link to={`/pay/split/${booking.bookingRef}`} className="btn btn-primary btn-sm" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <HiOutlineCurrencyRupee size={16} /> Pay Your Share
                  </Link>
                </div>
              )}

              {/* Actions */}
              {isHost ? (
                <button className="btn btn-secondary btn-lg" style={{ width: '100%' }} disabled>
                  <HiOutlineCheckCircle size={18} /> You are the Host
                </button>
              ) : isJoined ? (
                <button
                  className="btn btn-danger btn-lg"
                  style={{ width: '100%' }}
                  onClick={handleLeave}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Leaving...' : 'Leave Match'}
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={handleJoin}
                  disabled={actionLoading || isFull}
                >
                  {actionLoading ? 'Joining...' : isFull ? 'Match is Full' : 'Join Match'}
                </button>
              )}
            </div>

            {/* Roster */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '16px' }}>Players List</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      {match.host?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <Link to={`/profile/${match.host?._id}`} style={{ fontWeight: 600, fontSize: '0.85rem' }}>{match.host?.name}</Link>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Host</p>
                    </div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{match.host?.skillLevel || 'beginner'}</span>
                </div>

                {match.hostTeamCount > 1 && (
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-text-muted)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    👥 Host Group (+{match.hostTeamCount - 1} spots filled by friends)
                  </div>
                )}

                {match.joinedPlayers?.map((player) => (
                  <div key={player.user?._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-tertiary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                        {player.user?.name?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <Link to={`/profile/${player.user?._id}`} style={{ fontWeight: 600, fontSize: '0.85rem' }}>{player.user?.name || 'Player'}</Link>
                        <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Joined solo</p>
                      </div>
                    </div>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{player.user?.skillLevel || 'beginner'}</span>
                  </div>
                ))}

                {match.joinedPlayers?.length === 0 && match.hostTeamCount === match.maxPlayers && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>No other players have joined yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
