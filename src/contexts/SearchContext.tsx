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
  handleSearchKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    onSearchPerformed?: () => void
  ) => void;
  setSuggestions: (suggestions: Meal[]) => void;
  setHighlightedIndex: (index: number) => void;
  setQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export { SearchContext };
