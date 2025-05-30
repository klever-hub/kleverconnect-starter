import { useContext } from 'react';
import { KleverContext } from '../contexts/KleverContext';

export const useKlever = () => {
  const context = useContext(KleverContext);
  if (!context) {
    throw new Error('useKlever must be used within a KleverProvider');
  }
  return context;
};
