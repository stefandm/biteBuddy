import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, provider } from './firebase/config';
import {
  searchMeals,
  getMealDetails,
} from './api/mealapi';
import {
  addRecipe,
  listenToUserRecipes,
  deleteRecipe,
} from './firebase/firestoreService';
import useClickOutside from './hooks/useClickOutside';
import RecipeCard from './components/RecipeCard';
import ExpandedRecipeCard from './components/ExpandedRecipeCard';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  Meal,
  Recipe,
  User,
  INGREDIENT_KEYS,
  IngredientKey,
  ApiResponse,
} from './types';
import RecipeSkeleton from './components/RecipeSkeleton';
import logoIMG from '/images/logoAndName.jpg';

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
  const [isLoadingSearchResults, setIsLoadingSearchResults] = useState<boolean>(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<'recipe' | 'ingredient'>('recipe');

  const scrollToTopRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  useClickOutside({
    ref: suggestionsRef,
    handler: () => setSuggestions([]),
  });

  const generateRecommendations = useCallback(async (recipes: Recipe[]) => {
    if (recipes.length === 0) return;

    const ingredients = recipes
      .flatMap((recipe) =>
        INGREDIENT_KEYS
          .map((key) => recipe.meal[key as IngredientKey])
          .filter(
            (value): value is string =>
              value !== null && value !== '' && typeof value === 'string'
          )
      );

    if (ingredients.length > 0) {
      setIsLoadingRecommendations(true);

      const uniqueIngredients = [...new Set(ingredients)];
      const recommendedMeals: Meal[] = [];

      for (const ingredient of uniqueIngredients.slice(0, 7)) {
        try {
          const response: ApiResponse = await searchMeals(ingredient);

          if (response.meals) {
            const filteredResults = response.meals.filter(
              (meal) =>
                !recipes.some(
                  (recipe) => recipe.meal.idMeal === meal.idMeal
                )
            );

            recommendedMeals.push(...filteredResults);
          }
        } catch (error) {
          console.error('Error fetching meals:', error);
        }
      }

      const uniqueMeals = Array.from(
        new Map(recommendedMeals.map((meal) => [meal.idMeal, meal])).values()
      );

      const filteredRecommendations = uniqueMeals.filter(
        (meal) =>
          !recipes.some(
            (recipe) => recipe.meal.idMeal === meal.idMeal
          )
      );

      setRecommendations(filteredRecommendations);
      setIsLoadingRecommendations(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const unsubscribeRecipes = listenToUserRecipes(
          currentUser.uid,
          (recipes) => {
            setUserRecipes(recipes);
            generateRecommendations(recipes);

            setSelectedRecipeId(null);
            setSelectedMeal(null);
          }
        );

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
  }, [generateRecommendations]);

  const handleSearch = async () => {
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsLoadingSearchResults(true);
    const isIngredientSearch = searchType === 'ingredient';
    const response = await searchMeals(query, isIngredientSearch);

    const results = response.meals || [];

    const filteredResults = results.filter(
      (meal: Meal) =>
        !userRecipes.some(
          (recipe) => recipe.meal.idMeal === meal.idMeal
        )
    );

    setSearchResults(filteredResults);
    setSuggestions([]);
    setSelectedMeal(null);
    setSelectedRecipeId(null);
    setIsLoadingSearchResults(false);
  };

  const handleSearchTypeChange = (type: 'recipe' | 'ingredient') => {
    setSearchType(type);
  };

  const handleSearchKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
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

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = e.target.value;
    setQuery(query);
    setHighlightedIndex(-1);

    if (query.length > 2) {
      const response = await searchMeals(query);
      const results = response.meals || [];
      setSuggestions(results.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectMeal = async (idMeal: string) => {
    const meal =
      searchResults.find((m) => m.idMeal === idMeal) ||
      recommendations.find((m) => m.idMeal === idMeal) ||
      suggestions.find((m) => m.idMeal === idMeal) ||
      userRecipes.map((r) => r.meal).find((m) => m.idMeal === idMeal);

    if (meal) {
      setSelectedMeal(meal);
      setSelectedRecipeId(null);

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
      setQuery('');
    } else {
      console.error(
        'Meal not found in search results, recommendations, or suggestions:',
        idMeal
      );
    }
  };

  const handleAddRecipe = useCallback(async () => {
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
        prevResults.filter(
          (meal) => meal.idMeal !== selectedMeal.idMeal
        )
      );
      setSuggestions((prevSuggestions) =>
        prevSuggestions.filter(
          (meal) => meal.idMeal !== selectedMeal.idMeal
        )
      );

      setSelectedMeal(null);

      generateRecommendations([
        ...userRecipes,
        { id: '', meal: selectedMeal },
      ]);
    }
  }, [user, selectedMeal, userRecipes, generateRecommendations]);

  const handleDeleteRecipe = useCallback(
    async (recipeId: string) => {
      await deleteRecipe(recipeId);
      const updatedRecipes = userRecipes.filter(
        (recipe) => recipe.id !== recipeId
      );
      setUserRecipes(updatedRecipes);

      if (updatedRecipes.length === 0) {
        setRecommendations([]);
      } else {
        generateRecommendations(updatedRecipes);
      }

      setSelectedRecipeId(null);
      setSelectedMeal(null);
    },
    [userRecipes, generateRecommendations]
  );

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipeId(recipe.id);
    setSelectedMeal(recipe.meal);
    scrollToTopRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleCloseRecipe = () => {
    setSelectedMeal(null);
    setSelectedRecipeId(null);
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
      <div className="flex flex-col font-body font-main md:flex-row min-h-screen">
        <div
          className="border-b md:border-r border-orange-800 p-4 overflow-auto
            md:sticky md:top-0 md:h-screen md:max-w-[20vw] xl:max-w-[14vw]
            relative flex-shrink-0"
        >
          <img
            className="hidden md:block h-auto w-auto object-cover mb-8 scale-[80%]"
            src={logoIMG}
            alt="Logo"
          />
          {user ? (
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-2xl text-orange-400 text-center font-bold">
                Welcome, {user.displayName}
              </h1>
              <button
                onClick={handleSignOut}
                className="px-2 py-1 font-secondary text-red-500 hover:bg-red-500 hover:text-white rounded shadow-[1px_1px_2px_1px_#f56565]"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex-col flex items-center mt-3">
              <h1 className="my-4 text-lg font-secondary text-center">
                Sign in to view saved recipes
              </h1>
              <button
                onClick={handleSignIn}
                className="p-2 font-secondary text-blue-400  rounded border border-blue-400 hover:text-white hover:bg-blue-400"
              >
                Sign In with Google
              </button>
            </div>
          )}

          {userRecipes.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mt-14 mb-4 text-center">
                Saved Recipes
              </h2>
              <ul className="md:min-w-full">
                {userRecipes.map((recipe) => (
                  <li
                    key={recipe.id}
                    className="sm:flex md:flex-col font-secondary flex rounded-lg lg:flex-row mb-3  shadow-[1px_1px_1px_2px_#f6ad55]"
                  >
                    <button
                      onClick={() => handleSelectRecipe(recipe)}
                      className={`w-full  text-left py-[3px] px-2 rounded-l-lg hover:bg-orange-400 hover:text-white md:text-center lg:text-left  ${
                        selectedRecipeId === recipe.id
                          ? 'bg-orange-400 text-white '
                          : 'bg-white text-orange-900'
                      }`}
                    >
                      {recipe.meal.strMeal}
                    </button>
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="rounded-r-lg py-1 px-2 border-l-[1px] border-orange-400 text-red-600 hover:text-white hover:bg-red-400"
                    >
                      X
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <div className="relative mb-8 w-full  md:max-w-md">
            <div className="mt-6 flex flex-col">
              <div className="flex font-secondary">
                <input
                  type="text"
                  placeholder="Search for a meal"
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleSearchKeyDown}
                  className="px-2 py-1 border  border-gray-400  flex-1 rounded-l-lg focus:outline-none"
                />
                <button
                  onClick={() => {
                    handleSearch();
                    setQuery('');
                    setSelectedMeal(null);
                    setSelectedRecipeId(null);
                  }}
                  className="px-2 py-1 bg-orange-500 text-white hover:bg-orange-700 rounded-r-lg"
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
                <label htmlFor="recipe" className="mr-4">
                  Search by Recipe
                </label>

                <input
                  type="checkbox"
                  id="ingredient"
                  checked={searchType === 'ingredient'}
                  onChange={() => handleSearchTypeChange('ingredient')}
                  className="mr-2 size-4"
                />
                <label htmlFor="ingredient">Search by Ingredient</label>
              </div>
            </div>
            <div ref={scrollToTopRef}></div>
            {suggestions.length > 0 && (
              <ul
                ref={suggestionsRef}
                className="absolute left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 shadow-lg z-10"
              >
                {suggestions.map((suggestion, index) => (
                  <li
                    key={suggestion.idMeal}
                    onClick={() => handleSelectMeal(suggestion.idMeal)}
                    className={`p-2 cursor-pointer font-secondary  hover:bg-gray-200 ${
                      index === highlightedIndex ? 'bg-orange-100' : ''
                    }`}
                  >
                    {suggestion.strMeal}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedMeal ? (
            <ExpandedRecipeCard
              meal={selectedMeal}
              onAddRecipe={handleAddRecipe}
              onClose={handleCloseRecipe}
            />
          ) : (
            <>
              {isLoadingSearchResults ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <RecipeSkeleton cards={8} />
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <h2 className="text-3xl font-bold mb-[5vh] text-center text-orange-700">
                    Search Results
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {searchResults.map((meal) => (
                      <RecipeCard
                        key={meal.idMeal}
                        meal={meal}
                        onClick={handleSelectMeal}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex justify-center">
                  <h1>Cool layout goes here</h1>
                </div>
              )}

              {isLoadingRecommendations ? (
                <div className="mb-8">
                  <h2 className="text-3xl text-orange-700 font-extrabold mt-[7vh] mb-[3vh] text-center">
                    Based on your taste
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <RecipeSkeleton cards={6} />
                  </div>
                </div>
              ) : recommendations.length > 0 && (
                <>
                  <h2 className="text-3xl text-orange-700 font-extrabold mt-[7vh]  mb-[3vh] text-center">
                    Based on your taste
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {recommendations.map((meal) => (
                      <RecipeCard
                        key={meal.idMeal}
                        meal={meal}
                        onClick={handleSelectMeal}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default App;
