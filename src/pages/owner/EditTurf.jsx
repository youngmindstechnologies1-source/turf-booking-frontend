import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTurfBySlug, updateTurf, uploadPhotos } from '../../services/api';
import { SPORTS, AMENITIES, SURFACE_TYPES, CITIES } from '../../utils/constants';
import { HiOutlinePhotograph } from 'react-icons/hi';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EditTurf = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    sports: [],
    surfaceType: '',
    amenities: [],
    pricePerHour: '',
    operatingHours: { open: '06:00', close: '23:00' },
    slotDuration: 60,
  });

  const [photos, setPhotos] = useState([]);
  const [photosPreviews, setPhotosPreviews] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        // Fetch by ID via direct API call
        const res = await api.get(`/turfs/${id}`);
        const turf = res.data.turf || res.data.data || res.data;

        setForm({
          name: turf.name || '',
          description: turf.description || '',
          address: turf.address || '',
          city: turf.city || '',
          sports: turf.sports || [],
          surfaceType: turf.surfaceType || '',
          amenities: turf.amenities || [],
          pricePerHour: turf.pricePerHour || '',
          operatingHours: turf.operatingHours || { open: '06:00', close: '23:00' },
          slotDuration: turf.slotDuration || 60,
        });

        setExistingPhotos(
          (turf.photos || []).map((p) => (p.startsWith('http') ? p : `/uploads/${p}`))
        );
      } catch (err) {
        toast.error('Failed to load turf');
        navigate('/owner/turfs');
      } finally {
        setLoading(false);
      }
    };

    fetchTurf();
  }, [id, navigate]);

  const updateForm_ = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArrayItem = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setPhotos(files);
    setPhotosPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.city || form.sports.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await updateTurf(id, {
        ...form,
        pricePerHour: Number(form.pricePerHour),
        slotDuration: Number(form.slotDuration),
      });

      if (photos.length > 0) {
        const formData = new FormData();
        photos.forEach((p) => formData.append('photos', p));
        try {
          await uploadPhotos(id, formData);
        } catch {
          toast.error('Turf updated but photo upload failed');
        }
      }

      toast.success('Turf updated successfully');
      navigate('/owner/turfs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update turf');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading turf..." />;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Edit Turf</h1>
        <p className="page-subtitle">Update your turf listing details</p>
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Basic Info */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '20px' }}>Basic Info</h3>
            <div className="input-group">
              <label>Turf Name *</label>
              <input type="text" value={form.name} onChange={(e) => updateForm_('name', e.target.value)} />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => updateForm_('description', e.target.value)} rows={4} style={{ resize: 'vertical' }} />
            </div>
            <div className="input-group">
              <label>Address</label>
              <input type="text" value={form.address} onChange={(e) => updateForm_('address', e.target.value)} />
            </div>
            <div className="input-group">
              <label>City *</label>
              <select value={form.city} onChange={(e) => updateForm_('city', e.target.value)}>
                <option value="">Select city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sports & Surface */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '20px' }}>Sports & Surface</h3>
            <div className="input-group">
              <label>Sports Available *</label>
              <div className="checkbox-group">
                {SPORTS.map((s) => (
                  <button key={s.value} type="button" className={`checkbox-item ${form.sports.includes(s.value) ? 'selected' : ''}`} onClick={() => toggleArrayItem('sports', s.value)}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label>Surface Type *</label>
              <select value={form.surfaceType} onChange={(e) => updateForm_('surfaceType', e.target.value)}>
                <option value="">Select surface</option>
                {SURFACE_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amenities */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '20px' }}>Amenities</h3>
            <div className="amenity-grid">
              {AMENITIES.map((a) => (
                <button key={a.value} type="button" className={`amenity-item ${form.amenities.includes(a.value) ? 'selected' : ''}`} onClick={() => toggleArrayItem('amenities', a.value)}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Hours */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '20px' }}>Pricing & Hours</h3>
            <div className="input-group">
              <label>Price Per Hour (₹) *</label>
              <input type="number" value={form.pricePerHour} onChange={(e) => updateForm_('pricePerHour', e.target.value)} min="0" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label>Opening Time</label>
                <input type="time" value={form.operatingHours.open} onChange={(e) => updateForm_('operatingHours', { ...form.operatingHours, open: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Closing Time</label>
                <input type="time" value={form.operatingHours.close} onChange={(e) => updateForm_('operatingHours', { ...form.operatingHours, close: e.target.value })} />
              </div>
            </div>
            <div className="input-group">
              <label>Slot Duration (minutes)</label>
              <select value={form.slotDuration} onChange={(e) => updateForm_('slotDuration', e.target.value)}>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>
          </div>

          {/* Photos */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '20px' }}>Photos</h3>
            {existingPhotos.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Current Photos</p>
                <div className="dropzone-preview">
                  {existingPhotos.map((src, i) => (
                    <img key={i} src={src} alt={`Existing ${i + 1}`} className="dropzone-thumb" />
                  ))}
                </div>
              </div>
            )}
            <div className="dropzone" onClick={() => document.getElementById('edit-photo-input').click()}>
              <HiOutlinePhotograph size={32} color="var(--color-text-muted)" />
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>
                Upload new photos (replaces existing)
              </p>
              <input id="edit-photo-input" type="file" multiple accept="image/*" onChange={handlePhotos} style={{ display: 'none' }} />
            </div>
            {photosPreviews.length > 0 && (
              <div className="dropzone-preview">
                {photosPreviews.map((src, i) => (
                  <img key={i} src={src} alt={`New ${i + 1}`} className="dropzone-thumb" />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/owner/turfs')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTurf;
