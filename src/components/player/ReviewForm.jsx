import { useState } from 'react';
import { createReview } from '../../services/api';
import StarRating from '../common/StarRating';
import toast from 'react-hot-toast';
import { HiOutlineX } from 'react-icons/hi';

const ReviewForm = ({ bookingId, turfId, turfName, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const maxChars = 500;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Please write at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      await createReview({
        turf: turfId,
        booking: bookingId,
        rating,
        comment: comment.trim()
      });
      toast.success('Review submitted successfully!');
      if (onSubmit) onSubmit();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.2rem' }}>Leave a Review</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              {turfName}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
          >
            <HiOutlineX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Rating */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '12px', fontSize: '0.9rem' }}>
                How was your experience?
              </p>
              <StarRating
                rating={rating}
                size={32}
                interactive={true}
                onRate={setRating}
              />
              {rating > 0 && (
                <p style={{ color: 'var(--color-primary)', marginTop: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent!'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="input-group">
              <label htmlFor="review-comment">Your Review</label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, maxChars))}
                placeholder="Share your experience about the turf, facilities, and overall vibe..."
                rows={4}
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '6px',
                fontSize: '0.75rem',
                color: comment.length >= maxChars ? 'var(--color-danger)' : 'var(--color-text-muted)'
              }}>
                {comment.length}/{maxChars}
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || rating === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
