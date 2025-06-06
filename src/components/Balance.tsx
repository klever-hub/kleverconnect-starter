import { useEffect, useRef, useState } from 'react';
import { useKlever } from '../hooks/useKlever';
import { useSlotMachineAnimation } from '../hooks/useSlotMachineAnimation';
import './Balance.css';

export const Balance = () => {
  const { isConnected, balance, isLoadingBalance, refreshBalance } = useKlever();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Get auto-refresh preference from localStorage
  const [autoRefresh, setAutoRefresh] = useState(() => {
    const saved = localStorage.getItem('balance-auto-refresh');
    return saved !== 'false'; // Default to true
  });

  // Use slot machine animation for balance display
  const { displayValue: displayBalance, isAnimating } = useSlotMachineAnimation(
    balance?.amount || null,
    {
      duration: 500,
      steps: 20,
      randomness: 0.3
    }
  );

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    const newValue = !autoRefresh;
    setAutoRefresh(newValue);
    localStorage.setItem('balance-auto-refresh', String(newValue));
  };

  // Manual refresh with animation
  const handleManualRefresh = () => {
    setIsManualRefreshing(true);
    refreshBalance();
    setTimeout(() => setIsManualRefreshing(false), 500);
  };

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set up new interval if connected and auto-refresh is enabled
    if (isConnected && autoRefresh) {
      // Refresh immediately when connected
      refreshBalance();

      // Then refresh every 2.5 seconds
      intervalRef.current = setInterval(() => {
        refreshBalance();
      }, 2500);
    }

    // Cleanup on unmount or when connection status changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isConnected, refreshBalance, autoRefresh]);

  const formatBalance = (amount: number, token: string) => {
    return `${amount.toFixed(4)} ${token}`;
  };

  if (!isConnected) {
    return <div className="balance-container balance-hidden"></div>;
  }

  return (
    <div className={`balance-container ${isAnimating ? 'animating' : ''}`}>
      {isLoadingBalance && !balance ? (
        <span className="balance-loading">Loading...</span>
      ) : balance && displayBalance !== null ? (
        <>
          <span className="balance-value">{formatBalance(displayBalance, balance.token)}</span>
          <div className="balance-controls">
            {!autoRefresh && (
              <button
                className={`manual-refresh-btn ${isManualRefreshing ? 'refreshing' : ''}`}
                onClick={handleManualRefresh}
                title="Refresh balance"
              >
                🔄
              </button>
            )}
            <button
              className={`auto-refresh-toggle ${autoRefresh ? 'active' : ''}`}
              onClick={toggleAutoRefresh}
              title={
                autoRefresh
                  ? 'Auto-refresh ON (click to disable)'
                  : 'Auto-refresh OFF (click to enable)'
              }
            >
              {autoRefresh ? '⚡' : '🔌'}
            </button>
          </div>
        </>
      ) : (
        <span className="balance-empty">-</span>
      )}
    </div>
  );
};
