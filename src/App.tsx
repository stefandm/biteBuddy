import React, { useState, useEffect, useCallback, useRef } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, provider } from './firebase/config';
import { searchMeals, getMealDetails } from './api/mealapi';
import { addRecipe, listenToUserRecipes, deleteRecipe } from './firebase/firestoreService';
import useClickOutside from './hooks/useClickOutside';
import RecipeCard from './components/RecipeCard';
import 'react-loading-skeleton/dist/skeleton.css';
import { Meal, Recipe, User, INGREDIENT_KEYS, IngredientKey, ApiResponse } from './types';
import RecipeSkeleton from './components/RecipeSkeleton';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [query, setQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Meal[]>([]);
  const [suggestions, setSuggestions] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [recommendations, setRecommendations] = useState<Meal[]>([]);
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [isLoadingSearchResults, setIsLoadingSearchResults] = useState<boolean>(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<'recipe' | 'ingredient'>('recipe');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  useClickOutside({
    ref: suggestionsRef,
    handler: () => setSuggestions([]),
  });


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        const unsubscribeRecipes = listenToUserRecipes(user.uid, (recipes) => {
          setUserRecipes(recipes);
          generateRecommendations(recipes);
          setSelectedRecipeId(null);
          setSelectedMeal(null);
        });
        return () => unsubscribeRecipes();
      } else {
        setUserRecipes([]);
        setSearchResults([]);
        setSelectedMeal(null);
        setRecommendations([]);
        setSelectedRecipeId(null);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (selectedRecipeId) {
      const recipe = userRecipes.find((r) => r.id === selectedRecipeId);
      setSelectedMeal(recipe?.meal || null);
    }
  }, [selectedRecipeId, userRecipes]);


  
  const generateRecommendations = useCallback(async (recipes: Recipe[]) => {
    if (recipes.length === 0) return;
  
    // Extract and filter unique ingredients from user recipes
    const ingredients = recipes
      .flatMap((recipe) =>
        INGREDIENT_KEYS
          .map((key) => recipe.meal[key as IngredientKey])
          .filter((value): value is string => value !== null && value !== '' && typeof value === 'string')
      );
  
    if (ingredients.length > 0) {
      setIsLoadingRecommendations(true);
  
      const uniqueIngredients = [...new Set(ingredients)];
      const recommendedMeals: Meal[] = [];
  
      // Iterate over unique ingredients and fetch meals
      for (const ingredient of uniqueIngredients.slice(0, 10)) {
        try {
          const response: ApiResponse = await searchMeals(ingredient);
  
          if (response.meals) {
            const filteredResults = response.meals.filter(
              (meal) => !userRecipes.some((recipe) => recipe.meal.idMeal === meal.idMeal)
            );
  
            recommendedMeals.push(...filteredResults);
          }
        } catch (error) {
          console.error('Error fetching meals:', error);
        }
      }
  
      // Remove duplicates from recommendations
      const uniqueMeals = Array.from(
        new Map(recommendedMeals.map((meal) => [meal.idMeal, meal])).values()
      );
  
      // Ensure recommendations are updated correctly
      const filteredRecommendations = uniqueMeals.filter(
        (meal) => !userRecipes.some((recipe) => recipe.meal.idMeal === meal.idMeal)
      );
  
      console.log('User Recipes:', userRecipes.map(recipe => recipe.meal.idMeal));
      console.log('Unique Meals:', uniqueMeals.map(meal => meal.idMeal));
      console.log('Filtered Recommendations:', filteredRecommendations.map(meal => meal.idMeal));
  
      setRecommendations(filteredRecommendations);
      setIsLoadingRecommendations(false);
    }
  }, [userRecipes]);
  
  useEffect(() => {
    generateRecommendations(userRecipes);
  }, [userRecipes, generateRecommendations]);
  

  

  const handleSearch = async () => {
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsLoadingSearchResults(true);
    const isIngredientSearch = searchType === 'ingredient';
    const response = await searchMeals(query, isIngredientSearch);

    // Ensure 'response.meals' is treated as an array
    const results = response.meals || [];

    // Filter out meals that are already in the user's saved recipes
    const filteredResults = results.filter(
      (meal: Meal) => !userRecipes.some((recipe) => recipe.meal.idMeal === meal.idMeal)
    );

    setSearchResults(filteredResults);
    setSuggestions([]);
    setSelectedMeal(null); // Clear the selected meal
    setSelectedRecipeId(null); // Clear the selected recipe ID
    setIsLoadingSearchResults(false);
  };

  const handleSearchTypeChange = (type: 'recipe' | 'ingredient') => {
    setSearchType(type);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleSelectMeal(suggestions[highlightedIndex].idMeal);
      } else {
        handleSearch();
      }
      setSuggestions([]);
      setQuery('');
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setQuery('');
    } else if (e.key === 'ArrowDown') {
      setHighlightedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
      );
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setQuery(query);
    setHighlightedIndex(-1);

    if (query.length > 2) {
      const response = await searchMeals(query);
      const results = response.meals || [];
      setSuggestions(results.slice(0, 7));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectMeal = async (idMeal: string) => {
    console.log('handleSelectMeal called with idMeal:', idMeal);
    
    // Check if the meal is in the search results, recommendations, or suggestions
    const meal = searchResults.find((m) => m.idMeal === idMeal) ||
                 recommendations.find((m) => m.idMeal === idMeal) ||
                 suggestions.find((m) => m.idMeal === idMeal);
  
    if (meal) {
      setSelectedMeal(meal);  // Set the selected meal
      setSelectedRecipeId(null);  // Clear the selected recipe ID
  
      try {
        const details = await getMealDetails(idMeal);
        console.log('Meal details fetched:', details);
        setSelectedMeal(details);  // Update the selected meal with details
  
        // Scroll to the top of the page
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (error) {
        console.error('Error fetching meal details:', error);
      }
  
      // Clear suggestions after selecting a meal
      setSuggestions([]);
      setQuery('');
    } else {
      console.error('Meal not found in search results, recommendations, or suggestions:', idMeal);
    }
  };
  


 
  const handleAddRecipe = async () => {
    if (!user) {
      alert('You must be logged in to add a recipe.');
      return;
    }

    if (selectedMeal) {
      const recipeExists = userRecipes.some(
        (recipe) => recipe.meal.idMeal === selectedMeal?.idMeal
      );

      if (recipeExists) {
        alert('This recipe is already saved.');
        return;
      }

      await addRecipe(user.uid, selectedMeal);
      setSearchResults((prevResults) =>
        prevResults.filter((meal) => meal.idMeal !== selectedMeal.idMeal)
      );
      setSuggestions((prevSuggestions) =>
        prevSuggestions.filter((meal) => meal.idMeal !== selectedMeal.idMeal)
      );
      setSelectedMeal(null);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    await deleteRecipe(recipeId);
    const updatedRecipes = userRecipes.filter((recipe) => recipe.id !== recipeId);
    setUserRecipes(updatedRecipes);

    if (updatedRecipes.length === 0) {
      setRecommendations([]);
    } else {
      generateRecommendations(updatedRecipes);
    }

    setSelectedRecipeId(null);
    setSelectedMeal(null);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipeId(recipe.id);
    setExpandedMealId(recipe.meal.idMeal === expandedMealId ? null : recipe.meal.idMeal);
  };

  const handleCloseRecipe = () => {
    setSelectedMeal(null);
    setSelectedRecipeId(null);
    setExpandedMealId(null);
  };

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
        <div className="md:min-w-[20vw] bg-white border-r border-gray-300 p-4 overflow-auto">
          {user ? (
          <div className='flex flex-col items-center gap-2'>
            <h1 className='text-4xl text-center'>Welcome, {user.displayName}</h1>
            {/* <img className='h-[30px] w-[30px] rounded-[50%]' src={user.photoURL || ""} alt="" /> */}
            <button
              onClick={handleSignOut}
              className="p-1 bg-red-500  text-white rounded"
            >
              Sign Out
            </button>
            </div>
          ) : (
            <div className='flex-col flex items-center'>
            <button
              onClick={handleSignIn}
              className="mt-4 p-2 bg-blue-500 text-white rounded"
            >
              Sign In with Google
            </button>
            </div>
          )}
          
          {userRecipes.length > 0 ? (
            <>
            <h2 className="text-xl font-bold mb-4 text-center">My Saved Recipes</h2>
            <ul className='md:min-w-full'>
              {userRecipes.map((recipe) => (
                <li key={recipe.id} className="mb-2 sm:flex md:flex-col flex lg:flex-row ">
                  <button
                    onClick={() => handleSelectRecipe(recipe)}
                    className={`w-full text-left p-2 rounded ${
                      selectedRecipeId === recipe.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {recipe.meal.strMeal}
                  </button>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
            </>
          ) : (
            null
          )}
          
        </div>
        <div className=" p-4 overflow-auto">
          <div className="relative mb-8 w-full md:max-w-md">
            <div className="flex flex-col">
              <div className="flex ">
                <input
                  type="text"
                  placeholder="Search for a meal"
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleSearchKeyDown}
                  className="p-2 border-gray-300 rounded-l-md flex-1"
                  ref={inputRef}
                />
                <button
                  onClick={() => {
                    handleSearch();
                    setQuery('');
                    setSelectedMeal(null);
                    setSelectedRecipeId(null);
                  }}
                  className="p-2 bg-blue-500 text-white rounded-r-md"
                >
                  Search
                </button>
              </div>

              <div className="flex items-center mt-2">
                <input
                  type="radio"
                  id="recipe"
                  checked={searchType === 'recipe'}
                  onChange={() => handleSearchTypeChange('recipe')}
                  className="mr-2"
                />
                <label htmlFor="recipe" className="mr-4">Search by Recipe</label>

                <input
                  type="radio"
                  id="ingredient"
                  checked={searchType === 'ingredient'}
                  onChange={() => handleSearchTypeChange('ingredient')}
                  className="mr-2"
                />
                <label htmlFor="ingredient">Search by Ingredient</label>
              </div>
            </div>

            {suggestions.length > 0 && (
              <ul
                ref={suggestionsRef}
                className="absolute left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 shadow-lg z-10"
              >
                {suggestions.map((suggestion, index) => (
                  <li
                    key={suggestion.idMeal}
                    onClick={() => handleSelectMeal(suggestion.idMeal)}
                    className={`p-2 cursor-pointer hover:bg-gray-200 ${
                      index === highlightedIndex ? 'bg-gray-300' : ''
                    }`}
                  >
                    {suggestion.strMeal}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedMeal && (
            <div className="mb-8 flex flex-col">
              <RecipeCard
                // exists={recipeExists}
                meal={selectedMeal}
                onClick={handleAddRecipe}
                buttonText="Add to My Recipes"
                isExpanded={true}
              />
              <button
                onClick={handleCloseRecipe}
                className="mt-4 p-2 bg-gray-500 w-full text-white rounded"
              >
                Close
              </button>
            </div>
          )}

          <div className="mb-8">
            {isLoadingSearchResults ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <RecipeSkeleton cards={8}/>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <h2 className="text-xl font-bold mb-4">Search Results</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {searchResults.map((meal) => (
                    <RecipeCard
                      key={meal.idMeal}
                      meal={meal}
                      onClick={() => handleSelectMeal(meal.idMeal)}
                      buttonText="View Recipe"
                      isExpanded={expandedMealId === meal.idMeal}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p></p>
            )}
          </div>

          <div className="mb-8">
            {isLoadingRecommendations ? (
            <div>
              <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <RecipeSkeleton cards={6} />
              </div>
            </div>
            ) : recommendations.length > 0 ? (
              <>
                <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {recommendations.map((meal) => (
                    <RecipeCard
                      key={meal.idMeal}
                      meal={meal}
                      onClick={() => handleSelectMeal(meal.idMeal)}
                      buttonText="View Recipe"
                      isExpanded={expandedMealId === meal.idMeal}
                    />
                  ))}
                </div>
              </>
            ) : (
              null
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
