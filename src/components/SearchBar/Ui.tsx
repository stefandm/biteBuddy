import React from 'react';
import { Meal } from '../../types';

interface SearchBarUIProps {
  query: string;
  searchType: 'recipe' | 'ingredient';
  suggestions: Meal[];
  highlightedIndex: number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleSearchTypeChange: (type: 'recipe' | 'ingredient') => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSuggestionClick: (suggestion: Meal) => void;
  suggestionsRef: React.RefObject<HTMLUListElement>;
  inputRef: React.RefObject<HTMLInputElement>;
}

const SearchBarUI: React.FC<SearchBarUIProps> = ({
  query,
  searchType,
  suggestions,
  highlightedIndex,
  handleInputChange,
  handleSubmit,
  handleSearchTypeChange,
  handleKeyDown,
  handleSuggestionClick,
  suggestionsRef,
  inputRef,
}) => {
  return (
    <div className="relative mb-8 w-full md:max-w-md font-secondary">
      <form onSubmit={handleSubmit}>
        <div className="mt-6 flex flex-col">
          <div className="flex">
            <input
              type="search"
              placeholder="Search for a meal"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              ref={inputRef}
              className="px-2 py-1 border bg-slate-100 border-gray-400 flex-1 rounded-l-lg focus:outline-none"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              role="combobox"
              aria-expanded={suggestions.length > 0}
              aria-activedescendant={
                highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined
              }
              enterKeyHint="search"
            />
            <button
              type="submit"
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

export default SearchBarUI;
