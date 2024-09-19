// contexts/SearchContext.tsx

import { createContext } from 'react';
import { Meal } from '../types';

interface SearchContextProps {
  query: string;
  searchType: 'recipe' | 'ingredient';
  suggestions: Meal[];
  searchResults: Meal[];
  highlightedIndex: number;
  isLoadingSearchResults: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: () => Promise<void>;
  handleSearchTypeChange: (type: 'recipe' | 'ingredient') => void;
  handleSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  setSuggestions: React.Dispatch<React.SetStateAction<Meal[]>>;
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
  setQuery: React.Dispatch<React.SetStateAction<string>>; // Add this line
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export { SearchContext };
