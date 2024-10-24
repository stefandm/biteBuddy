import React, { useRef } from 'react';
import useClickOutside from '../../hooks/useClickOutside';
import { useSearch } from '../../hooks/useSearch';
import { useSelectedMeal } from '../../hooks/useSelectedMeal';
import { Meal } from '../../types';
import SearchBarUI from './Ui';

const SearchBarContainer: React.FC = () => {
  const {
    query,
    searchType,
    suggestions,
    highlightedIndex,
    handleInputChange,
    handleSearch,
    handleSearchTypeChange,
    handleSearchKeyDown,
    setSuggestions,
    setQuery,
    setHighlightedIndex,
  } = useSearch();

  const { selectMeal, clearSelectedMeal } = useSelectedMeal();

  const suggestionsRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside({
    ref: suggestionsRef,
    handler: () => setSuggestions([]),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSearch();
    clearSelectedMeal();
    setSuggestions([]);
    setQuery('');
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (suggestion: Meal) => {
    selectMeal(suggestion);
    setSuggestions([]);
    setQuery('');
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleSearchKeyDown(e, () => {
      clearSelectedMeal();
      inputRef.current?.blur();
    });
  };

  return (
    <SearchBarUI
      query={query}
      searchType={searchType}
      suggestions={suggestions}
      highlightedIndex={highlightedIndex}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      handleSearchTypeChange={handleSearchTypeChange}
      handleKeyDown={handleKeyDown}
      handleSuggestionClick={handleSuggestionClick}
      suggestionsRef={suggestionsRef}
      inputRef={inputRef}
    />
  );
};

export default SearchBarContainer;
