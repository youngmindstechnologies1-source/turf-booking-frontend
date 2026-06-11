import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiOutlineCash, HiOutlineDeviceMobile, HiOutlineUserGroup, HiOutlineArrowRight } from 'react-icons/hi';
import { formatPrice, generateUpiIntent } from '../../utils/helpers';

const PaymentModeModal = ({
  isOpen,
  onClose,
  totalAmount,
  turf,
  onConfirm,
  isSubmitting,
}) => {
  const [step, setStep] = useState(1);
  const [paymentMode, setPaymentMode] = useState('');
  const [playerCount, setPlayerCount] = useState(2);

  if (!isOpen) return null;

  const splitAmount = Math.ceil(totalAmount / playerCount);

  const handleModeSelect = (mode) => {
    setPaymentMode(mode);
    setStep(2);
  };

  const handleConfirm = () => {
    onConfirm({
      paymentMode,
      playerCount: paymentMode === 'cash' ? playerCount : playerCount,
    });
  };

  const handleClose = () => {
    setStep(1);
    setPaymentMode('');
    setPlayerCount(2);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <motion.div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        style={{ maxWidth: '480px', width: '90%' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.2rem' }}>
            {step === 1 ? 'Choose Payment Mode' : 'How Many Players?'}
          </h3>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <HiOutlineX size={22} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Total Amount Display */}
              <div style={{
                textAlign: 'center',
                padding: '16px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '24px',
              }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Total Amount</p>
                <p className="gradient-text" style={{ fontSize: '2rem', fontWeight: 800 }}>
                  {formatPrice(totalAmount)}
                </p>
              </div>

              {/* Payment Mode Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => handleModeSelect('cash')}
                  className="payment-mode-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.15)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <HiOutlineCash size={24} color="#10B981" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>💵 Cash / Pay at Venue</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      Collect cash from your group at the turf
                    </p>
                  </div>
                  <HiOutlineArrowRight size={18} color="var(--color-text-muted)" />
                </button>

                <button
                  onClick={() => handleModeSelect('upi_split')}
                  className="payment-mode-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                    background: 'rgba(59, 130, 246, 0.15)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <HiOutlineDeviceMobile size={24} color="#3B82F6" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>📱 Split via UPI</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      Each player pays their share directly via UPI
                    </p>
                  </div>
                  <HiOutlineArrowRight size={18} color="var(--color-text-muted)" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Mode Badge */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span className={`badge ${paymentMode === 'cash' ? 'badge-success' : 'badge-info'}`}
                  style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
                  {paymentMode === 'cash' ? '💵 Cash at Venue' : '📱 UPI Split'}
                </span>
              </div>

              {/* Player Count */}
              <div style={{
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
                  <HiOutlineUserGroup size={20} color="var(--color-primary)" />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Number of Players</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                  <button
                    onClick={() => setPlayerCount(Math.max(1, playerCount - 1))}
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    −
                  </button>
                  <span style={{
                    fontSize: '2.5rem', fontWeight: 800, minWidth: '60px', textAlign: 'center',
                    background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    {playerCount}
                  </span>
                  <button
                    onClick={() => setPlayerCount(Math.min(20, playerCount + 1))}
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Split Calculation */}
              <div style={{
                padding: '16px',
                background: paymentMode === 'upi_split'
                  ? 'rgba(59, 130, 246, 0.08)'
                  : 'rgba(16, 185, 129, 0.08)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                border: `1px solid ${paymentMode === 'upi_split'
                  ? 'rgba(59, 130, 246, 0.2)'
                  : 'rgba(16, 185, 129, 0.2)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Total</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatPrice(totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Players</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{playerCount}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Per Person</span>
                  <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.3rem' }}>
                    {formatPrice(splitAmount)}
                  </span>
                </div>
              </div>

              {/* UPI Split Note */}
              {paymentMode === 'upi_split' && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(251, 191, 36, 0.08)',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                }}>
                  ⏰ Slot will be locked for <strong>15 minutes</strong> while payments are collected.
                  You'll pay your share first, then share a payment link with your group.
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                  style={{ flex: 1 }}
                >
                  Back
                </button>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  style={{ flex: 2 }}
                >
                  {isSubmitting
                    ? 'Booking...'
                    : paymentMode === 'upi_split'
                      ? `Confirm & Pay ${formatPrice(splitAmount)}`
                      : 'Confirm Booking'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PaymentModeModal;
