// components/SearchBar.tsx

import React, { useRef } from 'react';
import useClickOutside from '../hooks/useClickOutside';
import { useSearchContext } from '../hooks/useSearchContext';
import { useSelectedMealContext } from '../hooks/useSelectedMealContext';
import { Meal } from '../types';

const SearchBar: React.FC = () => {
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
    setQuery, // Destructure setQuery
    isLoadingSearchResults,
  } = useSearchContext();

  const { selectMeal, clearSelectedMeal } = useSelectedMealContext();

  const suggestionsRef = useRef<HTMLUListElement>(null);

  // Handle clicks outside the suggestions dropdown to close it
  useClickOutside({
    ref: suggestionsRef,
    handler: () => setSuggestions([]),
  });

  // Function to handle "Search" button click
  const handleButtonClick = async () => {
    await handleSearch();        // Perform the search
    clearSelectedMeal();         // Close the ExpandedRecipeCard
    setSuggestions([]);           // Clear suggestions
    setQuery('');                 // Clear search input
  };

  // Function to handle suggestion clicks
  const handleSuggestionClick = (suggestion: Meal) => {
    selectMeal(suggestion);       // Set the selected meal to display ExpandedRecipeCard
    setSuggestions([]);           // Clear the suggestions to hide them
    setQuery('');                 // Clear the search input
  };

  // Handle key down events directly in the component
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleSearchKeyDown(e, () => {
      clearSelectedMeal();
    });
  };

  return (
    <div className="relative mb-8 w-full md:max-w-md font-secondary">
      <div className="mt-6 flex flex-col">
        <div className="flex">
          <input
            type="text"
            placeholder="Search for a meal"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown} // Handle key events directly
            className="px-2 py-1 border bg-slate-100 border-gray-400 flex-1 rounded-l-lg focus:outline-none"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-activedescendant={
              highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined
            }
          />
          <button
            onClick={handleButtonClick} // Handle search button click
            className="px-2 py-1 bg-orange-700 text-white hover:bg-orange-900 rounded-r-lg"
            aria-label="Search"
          >
            Search
          </button>
        </div>

        <div className="flex items-center mt-2 justify-center">
          <input
            type="checkbox"
            id="recipe"
            checked={searchType === 'recipe'}
            onChange={() => handleSearchTypeChange('recipe')}
            className="mr-2 size-4"
          />
          <label htmlFor="recipe" className="mr-4 text-white">
            Search by Recipe
          </label>

          <input
            type="checkbox"
            id="ingredient"
            checked={searchType === 'ingredient'}
            onChange={() => handleSearchTypeChange('ingredient')}
            className="mr-2 size-4"
          />
          <label htmlFor="ingredient" className="text-white">
            Search by Ingredient
          </label>
        </div>
      </div>

      {/* Optional: Display a loading indicator if search is in progress */}
      {isLoadingSearchResults && (
        <div className="flex justify-center items-center mt-4">
          {/* Replace with your spinner component or any loading indicator */}
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )}

    

      {suggestions.length > 0 && (
        <ul
          ref={suggestionsRef}
          id="search-suggestions"
          className="absolute left-0 right-0 top-12 bg-white border border-gray-300 rounded-md mt-1 shadow-lg z-10"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              id={`suggestion-${index}`}
              key={suggestion.idMeal}
              onClick={() => handleSuggestionClick(suggestion)} // Use the new handler
              className={`p-2 cursor-pointer hover:bg-gray-200 ${
                index === highlightedIndex ? 'bg-orange-100' : ''
              }`}
              aria-selected={index === highlightedIndex}
              role="option"
            >
              {suggestion.strMeal}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
