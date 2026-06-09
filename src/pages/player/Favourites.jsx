import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getTurfBySlug } from '../../services/api';
import TurfCard from '../../components/player/TurfCard';
import Loader from '../../components/common/Loader';
import api from '../../services/api';

const Favourites = () => {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavourites = useCallback(async () => {
    if (!user?.favouriteTurfs?.length) {
      setTurfs([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch all favourite turfs by their IDs
      const promises = user.favouriteTurfs.map(async (id) => {
        try {
          // Try getting by ID via the turfs list endpoint
          const res = await api.get(`/turfs?_id=${id}`);
          const data = res.data.turfs || res.data.data || [];
          return data[0] || null;
        } catch {
          return null;
        }
      });

      const results = await Promise.all(promises);
      setTurfs(results.filter(Boolean));
    } catch (err) {
      console.error('Failed to fetch favourites:', err);
      setTurfs([]);
    } finally {
      setLoading(false);
    }
  }, [user?.favouriteTurfs]);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  return (
    <div className="container" style={{ padding: '32px 24px 64px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">My Favourites</h1>
          <p className="page-subtitle">Your saved turfs for quick access</p>
        </div>

        {loading ? (
          <Loader text="Loading your favourites..." />
        ) : turfs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">❤️</div>
            <h3>No Favourites Yet</h3>
            <p>
              Browse turfs and tap the heart icon to save your favourites here.
            </p>
          </div>
        ) : (
          <div className="turf-grid">
            {turfs.map((turf, i) => (
              <motion.div
                key={turf._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <TurfCard turf={turf} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Favourites;
