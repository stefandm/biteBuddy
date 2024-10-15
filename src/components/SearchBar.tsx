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
    setQuery, 
  } = useSearchContext();

  const { selectMeal, clearSelectedMeal } = useSelectedMealContext();

  const suggestionsRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Ref to the input element

  // Handle clicks outside the suggestions dropdown to close it
  useClickOutside({
    ref: suggestionsRef,
    handler: () => setSuggestions([]),
  });

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload
    await handleSearch(); // Perform the search
    clearSelectedMeal(); // Close the ExpandedRecipeCard
    setSuggestions([]); // Clear suggestions
    setQuery(''); // Clear search input
    inputRef.current?.blur(); // Dismiss the keyboard by blurring the input
  };

  // Function to handle suggestion clicks
  const handleSuggestionClick = (suggestion: Meal) => {
    selectMeal(suggestion); // Set the selected meal to display ExpandedRecipeCard
    setSuggestions([]); // Clear the suggestions to hide them
    setQuery(''); // Clear the search input
    inputRef.current?.blur(); // Dismiss the keyboard if open
  };

  // Handle key down events directly in the component
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Escape') {
      handleSearchKeyDown(e, () => {
        clearSelectedMeal();
        inputRef.current?.blur(); // Dismiss the keyboard
      });
    }
    // Do not handle 'Enter' key here to allow form submission
  };

  return (
    <div className="relative mb-8 w-full md:max-w-md font-secondary">
      {/* Wrap the input and button in a form */}
      <form onSubmit={handleSubmit}>
        <div className="mt-6 flex flex-col">
          <div className="flex">
            <input
              type="search" // Changed from "text" to "search"
              placeholder="Search for a meal"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              ref={inputRef} // Assign the ref to the input
              className="px-2 py-1 border bg-slate-100 border-gray-400 flex-1 rounded-l-lg focus:outline-none"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              role="combobox"
              aria-expanded={suggestions.length > 0}
              aria-activedescendant={
                highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined
              }
              enterKeyHint="search" // Hint to display 'Search' on the keyboard
            />
            <button
              type="submit" // Changed from "button" to "submit"
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
      </form>


      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <ul
          ref={suggestionsRef}
          id="search-suggestions"
          className="absolute left-0 right-0 top-8 bg-white border border-gray-300 rounded-md mt-1 shadow-lg z-10"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              id={`suggestion-${index}`}
              key={suggestion.idMeal}
              onClick={() => handleSuggestionClick(suggestion)} 
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
