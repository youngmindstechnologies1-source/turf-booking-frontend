import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { changePassword, getUserProfile } from '../../services/api';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineShieldCheck, HiOutlineUserGroup } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [skillLevel, setSkillLevel] = useState(user?.skillLevel || 'beginner');
  const [saving, setSaving] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?._id && !user?.id) return;
      try {
        const res = await getUserProfile(user._id || user.id);
        setFollowersCount(res.data.profile?.followersCount || 0);
        setFollowingCount(res.data.profile?.followingCount || 0);
        if (res.data.profile?.skillLevel) {
          setSkillLevel(res.data.profile.skillLevel);
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      }
    };
    fetchProfileData();
  }, [user]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim(), skillLevel });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container" style={{ padding: '32px 24px 64px', maxWidth: '720px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>

        {/* Avatar & Role Info */}
        <div className="card" style={{ marginBottom: '24px', textAlign: 'center', padding: '32px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 800,
              margin: '0 auto 16px',
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '4px' }}>{user?.name}</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
            {user?.email}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
              <HiOutlineShieldCheck size={12} /> {user?.role}
            </span>
            <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
              Skill: {skillLevel}
            </span>
          </div>

          {/* Followers / Following Counts */}
          <div className="profile-stats" style={{ margin: '0 auto', maxWidth: '300px' }}>
            <div className="profile-stat-item">
              <div className="profile-stat-value">{followingCount}</div>
              <div className="profile-stat-label">Following</div>
            </div>
            <div className="profile-stat-item">
              <div className="profile-stat-value">{followersCount}</div>
              <div className="profile-stat-label">Followers</div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '20px' }}>
            <HiOutlineUser style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Edit Profile
          </h3>
          <form onSubmit={handleProfileUpdate}>
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6 }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Email cannot be changed
              </p>
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
              />
            </div>
            <div className="input-group">
              <label>Skill Level</label>
              <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
                <option value="beginner">Beginner (Casual play)</option>
                <option value="intermediate">Intermediate (Competitive play)</option>
                <option value="advanced">Advanced (High-performance play)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '20px' }}>
            <HiOutlineShieldCheck style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Change Password
          </h3>
          <form onSubmit={handleChangePassword}>
            <div className="input-group">
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="input-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="input-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <button type="submit" className="btn btn-secondary" disabled={changingPassword}>
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
