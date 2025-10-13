import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import './AddressQRCode.css';

interface AddressQRCodeProps {
  /** Klever wallet address */
  address: string;
  /** Amount to request (optional) */
  amount?: string;
  /** Asset ID (default: KLV) */
  assetId?: string;
  /** Message/label for the payment (optional) */
  message?: string;
  /** Show address label below QR code */
  showLabel?: boolean;
}

/**
 * AddressQRCode - Simple, styled QR code for Klever wallet addresses
 *
 * A plug-and-play component for displaying wallet addresses as QR codes.
 * Supports Bitcoin-style payment URI format with amount, asset, and message.
 *
 * @example Basic usage
 * ```tsx
 * <AddressQRCode address={walletAddress} />
 * ```
 *
 * @example Payment request (like Bitcoin URI)
 * ```tsx
 * <AddressQRCode
 *   address={walletAddress}
 *   amount="10.5"
 *   assetId="KLV"
 *   message="Payment for services"
 * />
 * ```
 */
export const AddressQRCode = ({
  address,
  amount,
  assetId = 'KLV',
  message,
  showLabel = true,
}: AddressQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      if (!canvasRef.current || !address) return;

      try {
        // Bitcoin-style payment URI format:
        // klever:address?amount=10&kda=KLV&message=Payment%20for%20services
        let qrValue = `klever:${address}`;

        const params = new URLSearchParams();
        if (amount) params.append('amount', amount);
        if (assetId && amount) params.append('kda', assetId);
        if (message) params.append('message', message);

        const queryString = params.toString();
        if (queryString) {
          qrValue += `?${queryString}`;
        }

        const canvas = canvasRef.current;

        // Generate QR code with Klever purple accent
        await QRCode.toCanvas(canvas, qrValue, {
          width: 280,
          margin: 2,
          color: {
            dark: '#1f2937', // Dark gray for better scanning
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M', // Medium - good balance
        });

        // Add Klever logo overlay
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = '/kleverhub_logo_only.png';

        img.onload = () => {
          const logoSize = 84; // 30% of 280px (1.5x of original 56px)
          const x = (280 - logoSize) / 2;
          const y = (280 - logoSize) / 2;

          // White background circle for logo
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(140, 140, logoSize / 2 + 4, 0, 2 * Math.PI);
          ctx.fill();

          // Draw logo
          ctx.drawImage(img, x, y, logoSize, logoSize);
        };

        img.onerror = () => {
          console.warn('Klever logo not found, showing QR code without logo');
        };
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      }
    };

    void generateQRCode();
  }, [address, amount, assetId, message]);

  const shortAddress = `${address.slice(0, 12)}...${address.slice(-12)}`;

  return (
    <div className="address-qr-code">
      <div className="qr-frame">
        <canvas ref={canvasRef} className="qr-canvas" />
        <div className="qr-accent-corner qr-corner-tl"></div>
        <div className="qr-accent-corner qr-corner-tr"></div>
        <div className="qr-accent-corner qr-corner-bl"></div>
        <div className="qr-accent-corner qr-corner-br"></div>
      </div>

      {showLabel && (
        <div className="qr-info">
          <div className="qr-address">
            <code>{shortAddress}</code>
          </div>
          {amount && (
            <div className="qr-payment-info">
              <div className="qr-payment-details">
                <span className="payment-label">Amount:</span>
                <span className="payment-value">
                  {amount} {assetId}
                </span>
              </div>
              {message && (
                <div className="qr-payment-details">
                  <span className="payment-label">Message:</span>
                  <span className="payment-value">{message}</span>
                </div>
              )}
            </div>
          )}
          <p className="qr-hint">{amount ? 'Scan to pay' : 'Scan to copy address'}</p>
        </div>
      )}
    </div>
  );
};
