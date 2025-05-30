import { useKlever } from '../hooks/useKlever';
import './Balance.css';

export const Balance = () => {
  const { isConnected, balance, isLoadingBalance } = useKlever();

  const formatBalance = (balance: { amount: number; decimals: number; token: string }) => {
    return `${balance.amount.toFixed(4)} ${balance.token}`;
  };

  if (!isConnected) {
    return <div className="balance-container balance-hidden"></div>;
  }

  return (
    <div className="balance-container">
      {isLoadingBalance ? (
        <span className="balance-loading">Loading...</span>
      ) : balance ? (
        <span className="balance-value">{formatBalance(balance)}</span>
      ) : (
        <span className="balance-empty">-</span>
      )}
    </div>
  );
};
