import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, loginUser, registerUser, updateProfile as updateProfileAPI, toggleFavourite as toggleFavouriteAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      const res = await getMe();
      setUser(res.data.user || res.data.data || res.data);
      setToken(storedToken);
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const data = res.data;
    const newToken = data.token;
    const userData = data.user || data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await registerUser(formData);
    const data = res.data;
    const newToken = data.token;
    const userData = data.user || data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUserProfile = async (data) => {
    const res = await updateProfileAPI(data);
    const updatedUser = res.data.user || res.data.data || res.data;
    setUser(updatedUser);
    return updatedUser;
  };

  const toggleFavourite = async (turfId) => {
    try {
      const res = await toggleFavouriteAPI(turfId);
      const favourites = res.data.favouriteTurfs || res.data.favourites || res.data.data;
      setUser(prev => ({
        ...prev,
        favouriteTurfs: favourites
      }));
      return favourites;
    } catch (err) {
      toast.error('Failed to update favourites');
      throw err;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile: updateUserProfile,
    toggleFavourite,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
