// App.tsx

import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import  UserRecipesProvider  from './contexts/UserRecipesProvider';
import { SearchProvider } from './contexts/SearchProvider';
import { SelectedMealProvider } from './contexts/SelectedMealContext';

import { useAuthContext } from './hooks/useAuthContext';
import { useUserRecipesContext } from './hooks/useUserRecipesContext';
import { useSelectedMealContext } from './hooks/useSelectedMealContext';
import { useSearchContext } from './hooks/useSearchContext';

import SearchBar from './components/SearchBar';
import SavedRecipes from './components/SavedRecipes';
import RecipeList from './components/RecipeList';
import ExpandedRecipeCard from './components/ExpandedRecipeCard';
import RecipeSkeleton from './components/RecipeSkeleton';

import logoIMG from '/images/logoAndName.jpg';

const AppContent: React.FC = () => {
  const { user, signIn, signOutUser } = useAuthContext();
  const { selectedMeal, clearSelectedMeal, scrollToTopRef } = useSelectedMealContext();
  const {
    userRecipes,
    addRecipeToUser,
    recommendations,
    isLoadingRecommendations,
    randomMeals,
    isLoadingRandomMeals,
  } = useUserRecipesContext();
  const {
    searchResults,
    isLoadingSearchResults,
  } = useSearchContext();

  useEffect(() => {
    if (selectedMeal) {
      scrollToTopRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [selectedMeal, scrollToTopRef]);

  const handleAddRecipe = async () => {
    if (selectedMeal) {
      await addRecipeToUser(selectedMeal);
    }
  };

  return (
    <div className="flex flex-col bg-slate-800 font-body font-main md:flex-row min-h-screen">
      {/* Sidebar with user info and saved recipes */}
      <div
        className="border-b md:border-r border-orange-800 p-4 overflow-auto
        md:sticky md:top-0 md:h-screen md:max-w-[20vw] xl:max-w-[14vw]
        relative flex-shrink-0"
      >
        <img
          className="hidden md:block h-auto w-auto object-cover mb-8 scale-[80%] rounded-[20%]"
          src={logoIMG}
          alt="Logo"
        />
        {/* User authentication section */}
        {user ? (
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl text-orange-500 text-center font-bold">
              Welcome, {user.displayName}
            </h1>
            <button
              onClick={signOutUser}
              className="px-2 py-1 font-secondary text-red-500 hover:bg-red-500 hover:text-white rounded shadow-[1px_1px_2px_1px_#f56565]"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex-col flex items-center mt-3">
            <h1 className="my-4 text-lg font-secondary text-white text-center">
              Sign in to view saved recipes
            </h1>
            <button
              onClick={signIn}
              className="p-2 font-secondary text-blue-400 rounded border border-blue-400 hover:text-white hover:bg-blue-400"
            >
              Sign In with Google
            </button>
          </div>
        )}

        {/* Saved Recipes */}
        {userRecipes.length > 0 && <SavedRecipes />}
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Reference for scrolling to top */}
        <div ref={scrollToTopRef}></div>

        {/* Search Bar */}
        <SearchBar />

        {/* Selected Meal or Search Results */}
        {selectedMeal ? (
          <ExpandedRecipeCard onAddRecipe={handleAddRecipe} onClose={clearSelectedMeal} />
        ) : (
          <>
            {/* Search Results */}
            {isLoadingSearchResults ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <RecipeSkeleton cards={8} />
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <h2 className="text-4xl font-bold my-[5vh] text-center text-orange-300">
                  Search Results
                </h2>
                <RecipeList meals={searchResults} />
              </>
            ) : (
              <>
                {/* Recommendations */}
                {userRecipes.length > 0 && (
                  <>
                    <h2 className="text-4xl font-bold my-[5vh] text-center text-orange-300">
                      Based on your taste
                    </h2>
                    {isLoadingRecommendations ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <RecipeSkeleton cards={8} />
                      </div>
                    ) : (
                      <RecipeList meals={recommendations} />
                    )}
                  </>
                )}

                {/* Need inspiration */}
                <>
                  <h2 className="text-4xl  font-bold my-[5vh] text-center text-orange-300 ">
                    In need of inspiration?
                  </h2>
                  {isLoadingRandomMeals ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      <RecipeSkeleton cards={8} />
                    </div>
                  ) : (
                    <RecipeList meals={randomMeals} />
                  )}
                </>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UserRecipesProvider>
        <SelectedMealProvider>
          <SearchProvider>
            <AppContent />
          </SearchProvider>
        </SelectedMealProvider>
      </UserRecipesProvider>
    </AuthProvider>
  );
};

export default App;
