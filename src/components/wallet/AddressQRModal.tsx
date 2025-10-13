import { useState } from 'react';
import { AddressQRCode } from '@/components/wallet/AddressQRCode';
import { useToast } from '@/hooks';
import './AddressQRModal.css';

interface AddressQRModalProps {
  address: string;
  network?: string;
  onClose: () => void;
}

export const AddressQRModal = ({ address, onClose }: AddressQRModalProps) => {
  const { addToast } = useToast();
  const [amount, setAmount] = useState('');
  const [assetId, setAssetId] = useState('KLV');
  const [message, setMessage] = useState('');

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      addToast({
        title: 'Copied!',
        message: 'Address copied to clipboard',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      addToast({
        title: 'Copy Failed',
        message: 'Could not copy address',
        type: 'error',
      });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="qr-modal-backdrop" onClick={handleBackdropClick}>
      <div className="qr-modal">
        <div className="qr-modal-header">
          <h2>Receive Tokens</h2>
          <button onClick={onClose} className="qr-modal-close" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="qr-modal-content">
          <div className="qr-section">
            <AddressQRCode
              address={address}
              amount={amount}
              assetId={assetId}
              message={message}
              showLabel={true}
            />
          </div>

          <div className="qr-divider"></div>

          <div className="qr-modal-form">
            <div className="form-header">
              <span className="form-title">Payment Request</span>
              <span className="form-subtitle">(Optional)</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <input
                  id="amount"
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input"
                  step="0.000001"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="asset">Asset</label>
                <input
                  id="asset"
                  type="text"
                  placeholder="KLV"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value.toUpperCase())}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <input
                id="message"
                type="text"
                placeholder="Payment for..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="form-input"
                maxLength={50}
              />
            </div>

            <div className="qr-uri-preview">
              <span className="uri-label">URI:</span>
              <code className="uri-value">
                klever:{address.slice(0, 8)}...?amount={amount}&kda={assetId}
                {message && '&message=...'}
              </code>
            </div>
          </div>

          <button onClick={handleCopyAddress} className="btn btn-primary btn-full btn-copy">
            <span className="btn-icon">📋</span>
            Copy Address
          </button>
        </div>
      </div>
    </div>
  );
};
