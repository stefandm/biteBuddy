// src/contexts/UserRecipesContext.tsx
import React, { createContext, useState, useEffect, useCallback, useRef, useContext, ReactNode } from 'react';
import { addRecipe, deleteRecipe, listenToUserRecipes } from '../firebase/firestoreService';
import { API_BASE_URL, searchMeals } from '../api/mealapi';
import { Meal, Recipe, INGREDIENT_KEYS, IngredientKey, ApiResponse } from '../types';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

interface UserRecipesContextProps {
  userRecipes: Recipe[];
  addRecipeToUser: (meal: Meal) => Promise<void>;
  deleteRecipeFromUser: (recipeId: string) => Promise<void>;
  recommendations: Meal[];
  isLoadingRecommendations: boolean;
  randomMeals: Meal[];
  isLoadingRandomMeals: boolean;
  
}

const UserRecipesContext = createContext<UserRecipesContextProps | undefined>(undefined);

export const UserRecipesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [recommendations, setRecommendations] = useState<Meal[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);
  const [randomMeals, setRandomMeals] = useState<Meal[]>([]);
  const [isLoadingRandomMeals, setIsLoadingRandomMeals] = useState<boolean>(false);

  // Generates recommendations based on user's saved recipes
  const generateRecommendations = useCallback(async (recipes: Recipe[]) => {
    if (recipes.length === 0) {
      setRecommendations([]);
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
      setRecommendations([]);
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

  const addRecipeToUser = async (meal: Meal) => {
    if (user) {
      const isAlreadySaved = userRecipes.some(
        (recipe) => recipe.meal.idMeal === meal.idMeal
      );

      if (isAlreadySaved) {
        toast.info('Recipe is already saved');
        return;
      }

      try {
        await addRecipe(user.uid, meal);
        toast.success('Recipe saved');
      } catch (error) {
        console.error('Error adding recipe:', error);
        toast.error('Failed to save the recipe.');
      }
    } else {
      toast.error('You must be signed in to save a recipe.');
    }
  };

  const deleteRecipeFromUser = async (recipeId: string) => {
    if (user) {
      try {
        await deleteRecipe(recipeId);
        // Optionally, add a success toast
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

// Custom hook to use UserRecipesContext
export const useUserRecipes = (): UserRecipesContextProps => {
  const context = useContext(UserRecipesContext);
  if (context === undefined) {
    throw new Error('useUserRecipes must be used within a UserRecipesProvider');
  }
  return context;
};
