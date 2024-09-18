// hooks/useSearchContext.ts

import { useContext } from 'react';
import { SearchContext } from '../contexts/SearchContext';

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};
