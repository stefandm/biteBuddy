// components/SearchBar.tsx

import React, { useRef } from 'react';
import useClickOutside from '../hooks/useClickOutside';
import { Meal } from '../types';

interface SearchBarProps {
  query: string;
  searchType: 'recipe' | 'ingredient';
  suggestions: Meal[];
  highlightedIndex: number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSearchTypeChange: (type: 'recipe' | 'ingredient') => void;
  handleSearch: () => void;
  handleSelectMeal: (idMeal: string) => void;
  setSuggestions: React.Dispatch<React.SetStateAction<Meal[]>>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  query,
  searchType,
  suggestions,
  highlightedIndex,
  handleInputChange,
  handleSearchKeyDown,
  handleSearchTypeChange,
  handleSearch,
  handleSelectMeal,
  setSuggestions,
}) => {
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
          <label htmlFor="ingredient" className='text-white'>Search by Ingredient</label>
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
              onClick={() => handleSelectMeal(suggestion.idMeal)}
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
