import { useState, useEffect, useCallback } from 'react';
import { addRecipe, deleteRecipe, listenToUserRecipes } from '../firebase/firestoreService';
import { searchMeals } from '../api/mealapi';
import { Meal, Recipe, INGREDIENT_KEYS, IngredientKey, ApiResponse, User } from '../types';

const useRecipes = (user: User | null) => {
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [recommendations, setRecommendations] = useState<Meal[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);

  // Generates recommendations based on user's saved recipes
  const generateRecommendations = useCallback(async (recipes: Recipe[]) => {
    if (recipes.length === 0) {
      setRecommendations([]); // Clear recommendations if no recipes are saved
      return;
    }

    // Extract ingredients from saved recipes
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

      // Fetch meals based on ingredients
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

      // Remove duplicates and already saved meals
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
    } else {
      setRecommendations([]); // Clear recommendations if no ingredients are found
    }
  }, []);

  // Listen to changes in user's saved recipes
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

  // Regenerate recommendations whenever userRecipes changes
  useEffect(() => {
    generateRecommendations(userRecipes);
  }, [userRecipes, generateRecommendations]);

  const addRecipeToUser = async (meal: Meal) => {
    if (user) {
      await addRecipe(user.uid, meal);
    }
  };

  const deleteRecipeFromUser = async (recipeId: string) => {
    if (user) {
      await deleteRecipe(recipeId);
    }
  };

  return {
    userRecipes,
    recommendations,
    isLoadingRecommendations,
    addRecipeToUser,
    deleteRecipeFromUser,
  };
};

export default useRecipes;
