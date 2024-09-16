// App.tsx

import React, { useState, useRef, useEffect } from 'react';
import useAuth from './hooks/useAuth';
import useSearch from './hooks/useSearch';
import useRecipes from './hooks/useRecipes';
import SearchBar from './components/SearchBar';
import SavedRecipes from './components/SavedRecipes';
import Recommendations from './components/Recommendations';
import RecipeList from './components/RecipeList';
import ExpandedRecipeCard from './components/ExpandedRecipeCard';
import { Meal, Recipe } from './types';
import { getMealDetails, fetchRandomMeals } from './api/mealapi';
import logoIMG from '/images/logoAndName.jpg';
import RecipeSkeleton from './components/RecipeSkeleton';

const App: React.FC = () => {
  const { user, signIn, signOut } = useAuth();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const scrollToTopRef = useRef<HTMLInputElement>(null);

  // State for random meals
  const [randomMeals, setRandomMeals] = useState<Meal[]>([]);
  const [isLoadingRandomMeals, setIsLoadingRandomMeals] = useState<boolean>(false);

  const {
    userRecipes,
    recommendations,
    isLoadingRecommendations,
    addRecipeToUser,
    deleteRecipeFromUser,
  } = useRecipes(user);


  const handleSelectMeal = async (idMeal: string) => {
    const meal =
      searchResults.find((m) => m.idMeal === idMeal) ||
      recommendations.find((m) => m.idMeal === idMeal) ||
      suggestions.find((m) => m.idMeal === idMeal) ||
      randomMeals.find((m) => m.idMeal === idMeal) || // Add check for random meals
      userRecipes.map((r) => r.meal).find((m) => m.idMeal === idMeal);

    if (meal) {
      setSelectedMeal(meal);
      setSelectedRecipeId(null);

      // Fetch meal details if instructions are not available
      if (!meal.strInstructions) {
        try {
          const details = await getMealDetails(idMeal);
          setSelectedMeal(details);
        } catch (error) {
          console.error('Error fetching meal details:', error);
        }
      }

      scrollToTopRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      setSuggestions([]);
      setHighlightedIndex(-1);
    } else {
      console.error('Meal not found:', idMeal);
    }
  };

  const {
    query,
    searchType,
    suggestions,
    searchResults,
    highlightedIndex,
    isLoadingSearchResults,
    handleInputChange,
    handleSearch,
    handleSearchTypeChange,
    handleSearchKeyDown,
    setSuggestions,
    setHighlightedIndex,
  } = useSearch(userRecipes, handleSelectMeal);

  /** Effect hook to fetch random meals when no search results are available */
  useEffect(() => {
    if (searchResults.length === 0 && query.trim() === '') {
      setIsLoadingRandomMeals(true);
      fetchRandomMeals(12).then((meals) => {
        setRandomMeals(meals);
        setIsLoadingRandomMeals(false);
      });
    }
  }, [searchResults, query]);

  /** Function to handle selecting a meal from search results, recommendations, or random meals */
  

  /** Function to handle adding a recipe to user's saved recipes */
  const handleAddRecipe = async () => {
    if (!user) {
      alert('You must be logged in to add a recipe.');
      return;
    }

    if (selectedMeal) {
      const recipeExists = userRecipes.some(
        (recipe) => recipe.meal.idMeal === selectedMeal.idMeal
      );

      if (recipeExists) {
        alert('This recipe is already saved.');
        return;
      }

      await addRecipeToUser(selectedMeal);
      setSelectedMeal(null);
    }
  };

  /** Function to handle deleting a recipe from user's saved recipes */
  const handleDeleteRecipe = async (recipeId: string) => {
    await deleteRecipeFromUser(recipeId);
    setSelectedRecipeId(null);
    setSelectedMeal(null);
  };

  /** Function to handle selecting a recipe from saved recipes */
  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipeId(recipe.id);
    setSelectedMeal(recipe.meal);
    scrollToTopRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  /** Function to handle closing the expanded recipe view */
  const handleCloseRecipe = () => {
    setSelectedMeal(null);
    setSelectedRecipeId(null);
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
              onClick={signOut}
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
        {userRecipes.length > 0 && (
          <SavedRecipes
            userRecipes={userRecipes}
            selectedRecipeId={selectedRecipeId}
            handleSelectRecipe={handleSelectRecipe}
            handleDeleteRecipe={handleDeleteRecipe}
          />
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Reference for scrolling to top */}
        <div ref={scrollToTopRef}></div>

        {/* Search Bar */}
        <SearchBar
          query={query}
          searchType={searchType}
          suggestions={suggestions}
          highlightedIndex={highlightedIndex}
          handleInputChange={handleInputChange}
          handleSearchKeyDown={handleSearchKeyDown}
          handleSearchTypeChange={handleSearchTypeChange}
          handleSearch={handleSearch}
          handleSelectMeal={handleSelectMeal}
          setSuggestions={setSuggestions}
        />

        {/* Selected Meal or Search Results */}
        {selectedMeal ? (
          <ExpandedRecipeCard
            meal={selectedMeal}
            onAddRecipe={handleAddRecipe}
            onClose={handleCloseRecipe}
          />
        ) : (
          <>
            {/* Search Results */}
            {isLoadingSearchResults ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <RecipeSkeleton cards={8} />
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <h2 className="text-3xl font-bold mb-[5vh] text-center text-orange-300">
                  Search Results
                </h2>
                <RecipeList meals={searchResults} onSelectMeal={handleSelectMeal} />
              </>
            ) : (
              // Display random meals if no search results
              <Recommendations
              recommendations={recommendations}
              isLoading={isLoadingRecommendations}
              handleSelectMeal={handleSelectMeal}
              />
            )}

            {/* Recommendations */}
            <>
              <h2 className="text-3xl mt-10 font-bold mb-[5vh] text-center text-orange-300">
                    Need inspiration?
              </h2>
              {isLoadingRandomMeals ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <RecipeSkeleton cards={8} />
               </div>
              ) : (
                  <>
                    <RecipeList meals={randomMeals} onSelectMeal={handleSelectMeal} />
                  </>
                )}
            </>
            
            </>
            )}
          </div>
        </div>
      );
    };
    
    export default App;