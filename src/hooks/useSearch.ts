import { useContext } from 'react';
import { SearchContext } from '../contexts/SearchProvider';
import { SearchContextProps } from '../contexts/SearchProvider'; // Ensure this interface is exported from SearchProvider.tsx

export const useSearch = (): SearchContextProps => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
