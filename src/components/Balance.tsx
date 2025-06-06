import { useEffect, useRef, useState } from 'react';
import { useKlever } from '../hooks/useKlever';
import './Balance.css';

export const Balance = () => {
  const { isConnected, balance, isLoadingBalance, refreshBalance } = useKlever();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [displayBalance, setDisplayBalance] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousBalanceRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set up new interval if connected
    if (isConnected) {
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
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isConnected, refreshBalance]);

  // Animate balance changes
  useEffect(() => {
    if (balance && balance.amount !== previousBalanceRef.current) {
      // If balance changed, animate it
      if (previousBalanceRef.current !== null && previousBalanceRef.current !== balance.amount) {
        setIsAnimating(true);
        
        // Create slot machine effect
        const startValue = previousBalanceRef.current;
        const endValue = balance.amount;
        const duration = 500; // milliseconds
        const steps = 20;
        const stepTime = duration / steps;
        
        let currentStep = 0;
        
        const animate = () => {
          currentStep++;
          
          if (currentStep < steps) {
            // Generate random value between start and end for slot effect
            const progress = currentStep / steps;
            const range = endValue - startValue;
            const randomOffset = (Math.random() - 0.5) * Math.abs(range) * 0.3;
            const interpolatedValue = startValue + (range * progress) + randomOffset;
            
            setDisplayBalance(interpolatedValue);
            animationRef.current = setTimeout(animate, stepTime);
          } else {
            // Final value
            setDisplayBalance(endValue);
            setIsAnimating(false);
          }
        };
        
        animate();
      } else {
        // First time setting balance
        setDisplayBalance(balance.amount);
      }
      
      previousBalanceRef.current = balance.amount;
    }
  }, [balance]);

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
        <span className="balance-value">
          {formatBalance(displayBalance, balance.token)}
        </span>
      ) : (
        <span className="balance-empty">-</span>
      )}
    </div>
  );
};
