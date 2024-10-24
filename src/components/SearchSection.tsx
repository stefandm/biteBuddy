import React from 'react';
import SearchBar from './SearchBar';
import RecipeList from './RecipeList';
import SkeletonList from './SkeletonList';
import { useSearch } from '../hooks/useSearch';
import { useUserRecipes } from '../hooks/useUserRecipes';

const SearchSection: React.FC = () => {
  const { searchResults, isLoadingSearchResults } = useSearch();
  const { randomMeals } = useUserRecipes();

  return (
    <div>
      <SearchBar />
      {isLoadingSearchResults ? (
        <SkeletonList />
      ) : searchResults.length > 0 ? (
        <>
            <h2 className="text-4xl font-bold my-[5vh] text-center text-orange-300 [text-shadow:2px_2px_6px_#000000]">
                Search Results
            </h2>
          <RecipeList meals={searchResults} itemsPerPage={12} />
        </>
      ) : (
        <>
          {randomMeals.length > 0 && (
            <>
              <h2 className='text-4xl font-bold my-[5vh] text-center text-orange-300 [text-shadow:2px_2px_6px_#000000]"'>In Need of Inspiration?</h2>
              <RecipeList meals={randomMeals} itemsPerPage={12} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SearchSection;
