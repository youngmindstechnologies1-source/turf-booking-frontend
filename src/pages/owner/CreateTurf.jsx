import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createTurf, uploadPhotos } from '../../services/api';
import { SPORTS, AMENITIES, SURFACE_TYPES, CITIES } from '../../utils/constants';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCheck, HiOutlinePhotograph } from 'react-icons/hi';
import toast from 'react-hot-toast';

const STEPS = ['Basic Info', 'Sports & Surface', 'Amenities', 'Pricing & Hours', 'Photos'];

const CreateTurf = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

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

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

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

  const canProceed = () => {
    switch (step) {
      case 0:
        return form.name.trim() && form.city;
      case 1:
        return form.sports.length > 0 && form.surfaceType;
      case 2:
        return true;
      case 3:
        return form.pricePerHour > 0;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.city || form.sports.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        pricePerHour: Number(form.pricePerHour),
        slotDuration: Number(form.slotDuration),
      };

      const res = await createTurf(payload);
      const turf = res.data.turf || res.data.data || res.data;

      // Upload photos if any
      if (photos.length > 0 && turf._id) {
        const formData = new FormData();
        photos.forEach((p) => formData.append('photos', p));
        try {
          await uploadPhotos(turf._id, formData);
        } catch {
          toast.error('Turf created but photo upload failed');
        }
      }

      toast.success('Turf created successfully! It will be reviewed by an admin.');
      navigate('/owner/turfs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create turf');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Create New Turf</h1>
        <p className="page-subtitle">List your turf to start receiving bookings</p>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        {STEPS.map((label, i) => (
          <span key={label} style={{ display: 'contents' }}>
            {i > 0 && (
              <div
                className={`step-connector ${i <= step ? 'completed' : ''}`}
                style={{ background: i <= step ? 'var(--color-primary)' : 'var(--color-border)' }}
              />
            )}
            <div className={`step ${i === step ? 'active' : i < step ? 'completed' : ''}`}>
              <div className="step-number">
                {i < step ? <HiOutlineCheck size={16} /> : i + 1}
              </div>
              <span className="step-label">{label}</span>
            </div>
          </span>
        ))}
      </div>

      {/* Form Steps */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="card"
      >
        <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '24px' }}>
          {STEPS[step]}
        </h3>

        {step === 0 && (
          <>
            <div className="input-group">
              <label>Turf Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                placeholder="e.g., Green Arena Sports Complex"
              />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder="Describe your turf, facilities, and what makes it special..."
                rows={4}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div className="input-group">
              <label>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => updateForm('address', e.target.value)}
                placeholder="Full address"
              />
            </div>
            <div className="input-group">
              <label>City *</label>
              <select value={form.city} onChange={(e) => updateForm('city', e.target.value)}>
                <option value="">Select city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="input-group">
              <label>Sports Available *</label>
              <div className="checkbox-group">
                {SPORTS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`checkbox-item ${form.sports.includes(s.value) ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem('sports', s.value)}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label>Surface Type *</label>
              <select value={form.surfaceType} onChange={(e) => updateForm('surfaceType', e.target.value)}>
                <option value="">Select surface</option>
                {SURFACE_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="input-group">
            <label>Amenities (select all that apply)</label>
            <div className="amenity-grid">
              {AMENITIES.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  className={`amenity-item ${form.amenities.includes(a.value) ? 'selected' : ''}`}
                  onClick={() => toggleArrayItem('amenities', a.value)}
                >
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <>
            <div className="input-group">
              <label>Price Per Hour (₹) *</label>
              <input
                type="number"
                value={form.pricePerHour}
                onChange={(e) => updateForm('pricePerHour', e.target.value)}
                placeholder="e.g., 1500"
                min="0"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label>Opening Time</label>
                <input
                  type="time"
                  value={form.operatingHours.open}
                  onChange={(e) =>
                    updateForm('operatingHours', { ...form.operatingHours, open: e.target.value })
                  }
                />
              </div>
              <div className="input-group">
                <label>Closing Time</label>
                <input
                  type="time"
                  value={form.operatingHours.close}
                  onChange={(e) =>
                    updateForm('operatingHours', { ...form.operatingHours, close: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="input-group">
              <label>Slot Duration (minutes)</label>
              <select
                value={form.slotDuration}
                onChange={(e) => updateForm('slotDuration', e.target.value)}
              >
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="dropzone" onClick={() => document.getElementById('photo-input').click()}>
              <HiOutlinePhotograph size={40} color="var(--color-text-muted)" />
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '12px' }}>
                Click to upload photos (max 5)
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                JPEG, PNG, WEBP • Max 5MB each
              </p>
              <input
                id="photo-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotos}
                style={{ display: 'none' }}
              />
            </div>
            {photosPreviews.length > 0 && (
              <div className="dropzone-preview">
                {photosPreviews.map((src, i) => (
                  <img key={i} src={src} alt={`Preview ${i + 1}`} className="dropzone-thumb" />
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          <HiOutlineArrowLeft size={16} /> Previous
        </button>

        {step < STEPS.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            Next <HiOutlineArrowRight size={16} />
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Turf'} <HiOutlineCheck size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateTurf;
