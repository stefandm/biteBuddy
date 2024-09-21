// contexts/UserRecipesProvider.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { addRecipe, deleteRecipe, listenToUserRecipes } from '../firebase/firestoreService';
import { API_BASE_URL, searchMeals } from '../api/mealapi';
import { Meal, Recipe, INGREDIENT_KEYS, IngredientKey, ApiResponse } from '../types';
import { useAuthContext } from '../hooks/useAuthContext';
import { UserRecipesContext } from './UserRecipesContext';
import { toast } from 'react-toastify'; // Import toast

const UserRecipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [recommendations, setRecommendations] = useState<Meal[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);
  const [randomMeals, setRandomMeals] = useState<Meal[]>([]);
  const [isLoadingRandomMeals, setIsLoadingRandomMeals] = useState<boolean>(false);

  
  // Generates recommendations based on user's saved recipes
  const generateRecommendations = useCallback(async (recipes: Recipe[]) => {
    if (recipes.length === 0) {
      setRecommendations([]); // Clear recommendations if no recipes are saved
      return;
    }

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

      for (const ingredient of uniqueIngredients.slice(3, uniqueIngredients.length)) {
        try {
          const response = await searchMeals(ingredient);
          if (response.meals) {
            const filteredResults = response.meals.filter(
              (meal) => !recipes.some((recipe) => recipe.meal.idMeal === meal.idMeal)
            );
            recommendedMeals.push(...filteredResults);
          }
        } catch (error) {
          console.error('Error fetching meals:', error);
          toast.error('Failed to fetch meal recommendations.');
        }
      }

      const uniqueMeals = Array.from(
        new Map(recommendedMeals.map((meal) => [meal.idMeal, meal])).values()
      );

      const filteredRecommendations = uniqueMeals.filter(
        (meal) => !recipes.some((recipe) => recipe.meal.idMeal === meal.idMeal)
      );

      setRecommendations(filteredRecommendations);
      setIsLoadingRecommendations(false);
    } else {
      setRecommendations([]); // Clear recommendations if no ingredients are found
    }
  }, []);

  const fetchRandomMealsExcludingUserRecipes = useCallback(async () => {
    setIsLoadingRandomMeals(true);
    try {
      const fetchedMealIds = new Set<string>(userRecipes.map((recipe) => recipe.meal.idMeal));
      const randomMealsList: Meal[] = [];

      while (randomMealsList.length < 8) {
        const response = await fetch(`${API_BASE_URL}/random.php`);
        const data: ApiResponse = await response.json();
        if (data.meals && data.meals.length > 0) {
          const meal = data.meals[0];
          if (
            !fetchedMealIds.has(meal.idMeal) &&
            !randomMealsList.some((m) => m.idMeal === meal.idMeal)
          ) {
            randomMealsList.push(meal);
          }
        }
      }

      setRandomMeals(randomMealsList);
    } catch (error) {
      console.error('Error fetching random meals:', error);
      toast.error('Failed to fetch random meals.');
    } finally {
      setIsLoadingRandomMeals(false);
    }
  }, [userRecipes]);

  useEffect(() => {
    if (user) {
      const unsubscribeRecipes = listenToUserRecipes(user.uid, (recipes) => {
        setUserRecipes(recipes);
      });
      return () => unsubscribeRecipes();
    } else {
      setUserRecipes([]);
      setRecommendations([]);
    }
  }, [user]);

  useEffect(() => {
    generateRecommendations(userRecipes);
  }, [userRecipes, generateRecommendations]);

  const hasFetchedRandomMeals = useRef(false);

  useEffect(() => {
    if (!hasFetchedRandomMeals.current) {
      fetchRandomMealsExcludingUserRecipes();
      hasFetchedRandomMeals.current = true;
    }
  }, [fetchRandomMealsExcludingUserRecipes]);

  // Updated addRecipeToUser function with duplicate check
  const addRecipeToUser = async (meal: Meal) => {
    if (user) {
      // Check if the recipe is already saved
      const isAlreadySaved = userRecipes.some(
        (recipe) => recipe.meal.idMeal === meal.idMeal
      );

      if (isAlreadySaved) {
        toast.info('Recipe is already saved');
        return; // Exit the function to prevent adding duplicate
      }

      try {
        // If not saved, proceed to add the recipe
        await addRecipe(user.uid, meal);
        toast.success('Recipe saved');
      } catch (error) {
        console.error('Error adding recipe:', error);
        toast.error('Failed to save the recipe.');
      }
    } else {
      toast.error('You must be signed in to add a recipe.');
    }
  };

  const deleteRecipeFromUser = async (recipeId: string) => {
    if (user) {
      try {
        await deleteRecipe(recipeId);
        // toast.success('Recipe deleted successfully');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        toast.error('Failed to delete the recipe.');
      }
    }
  };

  return (
    <UserRecipesContext.Provider
      value={{
        userRecipes,
        addRecipeToUser,
        deleteRecipeFromUser,
        recommendations,
        isLoadingRecommendations, 
        randomMeals,
        isLoadingRandomMeals,
      }}
    >
      {children}
    </UserRecipesContext.Provider>
  );
};

export default UserRecipesProvider;
