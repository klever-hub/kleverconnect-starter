import { useState, useRef, useEffect } from 'react';
import { useKlever } from '../hooks/useKlever';
import { useToast } from '../hooks/useToast';
import './NetworkBadge.css';

interface NetworkBadgeProps {
  floating?: boolean;
}

export const NetworkBadge = ({ floating = false }: NetworkBadgeProps) => {
  const { network, switchNetwork } = useKlever();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNetworkSwitch = async (newNetwork: 'mainnet' | 'testnet' | 'devnet') => {
    try {
      await switchNetwork(newNetwork);
      setIsOpen(false);
      toast.success('Network Switched', `Successfully switched to ${getNetworkLabel(newNetwork)}`);
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Network Switch Failed', 'Failed to switch network. Please try again.');
    }
  };

  const getNetworkLabel = (net?: string) => {
    const targetNetwork = net || network;
    switch (targetNetwork) {
      case 'mainnet':
        return 'Mainnet';
      case 'testnet':
        return 'Testnet';
      case 'devnet':
        return 'Devnet';
      default:
        return 'Testnet';
    }
  };

  const getNetworkColor = () => {
    switch (network) {
      case 'mainnet':
        return 'network-mainnet';
      case 'testnet':
        return 'network-testnet';
      case 'devnet':
        return 'network-devnet';
      default:
        return 'network-testnet';
    }
  };


  return (
    <div className={`network-badge-container ${floating ? 'floating' : ''}`} ref={dropdownRef}>
        <button
          className={`network-badge ${getNetworkColor()}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Switch network"
        >
          <span className="network-dot"></span>
          <span className="network-label">{getNetworkLabel()}</span>
          <svg 
            className={`network-chevron ${isOpen ? 'open' : ''}`} 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none"
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

      {isOpen && (
        <div className="network-dropdown">
          <button
            className={`network-option ${network === 'mainnet' ? 'active' : ''}`}
            onClick={() => handleNetworkSwitch('mainnet')}
          >
            <span className="network-dot network-mainnet"></span>
            Mainnet
          </button>
          <button
            className={`network-option ${network === 'testnet' ? 'active' : ''}`}
            onClick={() => handleNetworkSwitch('testnet')}
          >
            <span className="network-dot network-testnet"></span>
            Testnet
          </button>
          <button
            className={`network-option ${network === 'devnet' ? 'active' : ''}`}
            onClick={() => handleNetworkSwitch('devnet')}
          >
            <span className="network-dot network-devnet"></span>
            Devnet
          </button>
        </div>
      )}
    </div>
  );
};