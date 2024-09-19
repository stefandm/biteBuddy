// components/SearchBar.tsx

import React, { useRef } from 'react';
import useClickOutside from '../hooks/useClickOutside';
import { useSearchContext } from '../hooks/useSearchContext';
import { useSelectedMealContext } from '../hooks/useSelectedMealContext';

const SearchBar: React.FC = () => {
  const {
    query,
    searchType,
    suggestions,
    highlightedIndex,
    handleInputChange,
    handleSearchKeyDown,
    handleSearchTypeChange,
    handleSearch,
    setSuggestions,
  } = useSearchContext();

  const { selectMeal } = useSelectedMealContext();

  const suggestionsRef = useRef<HTMLUListElement>(null);

  useClickOutside({
    ref: suggestionsRef,
    handler: () => setSuggestions([]),
  });

  return (
    <div className="relative mb-8 w-full  md:max-w-md">
      <div className="mt-6 flex flex-col">
        <div className="flex font-secondary">
          <input
            type="text"
            placeholder="Search for a meal"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleSearchKeyDown}
            className="px-2 py-1 border  bg-slate-100 border-gray-400  flex-1 rounded-l-lg focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-2 py-1 bg-orange-700 text-white hover:bg-orange-900 rounded-r-lg"
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
            className="mr-2 size-4 "
          />
          <label htmlFor="ingredient" className="text-white">
            Search by Ingredient
          </label>
        </div>
      </div>

      {suggestions.length > 0 && (
        <ul
          ref={suggestionsRef}
          className="absolute left-0 right-0 top-8 bg-white border border-gray-300 rounded-md mt-1 shadow-lg z-10"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.idMeal}
              onClick={() => selectMeal(suggestion)}
              className={`p-2 cursor-pointer font-secondary hover:bg-gray-200 ${
                index === highlightedIndex ? 'bg-orange-100' : ''
              }`}
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
