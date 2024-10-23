import React, { createContext, useState, useEffect, useCallback, useRef, useContext, ReactNode } from 'react';
import { addRecipe, listenToUserRecipes } from '../firebase/firestoreService';
import {
    fetchRandomMeal } from '../api/mealapi';
import { Meal, Recipe } from '../types';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { writeBatch, doc } from 'firebase/firestore';
import debounce from 'lodash/debounce';
import { db } from '../firebase/config'; 

interface UserRecipesContextProps {
  userRecipes: Recipe[];
  addRecipeToUser: (meal: Meal) => Promise<void>;
  deleteRecipeFromUser: (recipeId: string) => void;
  randomMeals: Meal[];
  isLoadingRandomMeals: boolean;
}

const UserRecipesContext = createContext<UserRecipesContextProps | undefined>(undefined);

export const UserRecipesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [randomMeals, setRandomMeals] = useState<Meal[]>([]);
  const [isLoadingRandomMeals, setIsLoadingRandomMeals] = useState<boolean>(false);

  const pendingDeletionsRef = useRef<Set<string>>(new Set());

  const debouncedBatchDelete = useRef(
    debounce(async () => {
      const deletions = Array.from(pendingDeletionsRef.current);
      if (deletions.length === 0) return;

      const batch = writeBatch(db);
      deletions.forEach((recipeId) => {
        const recipeDoc = doc(db, 'recipes', recipeId);
        batch.delete(recipeDoc);
      });

      try {
        await batch.commit();
        toast.success('Recipes deleted successfully');
      } catch (error) {
        console.error('Error deleting recipes:', error);
        toast.error('Failed to delete recipes.');
      } finally {
        pendingDeletionsRef.current.clear();
      }
    }, 300) 
  ).current;

  const deleteRecipeFromUser = (recipeId: string) => {
    if (!user) {
      toast.error('You must be signed in to delete a recipe.');
      return;
    }

    pendingDeletionsRef.current.add(recipeId);
    debouncedBatchDelete();
  };

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

  const fetchRandomMealsExcludingUserRecipes = useCallback(async () => {
    setIsLoadingRandomMeals(true);
    try {
      const fetchedMealIds = new Set<string>(userRecipes.map((recipe) => recipe.meal.idMeal));
      const randomMealsList: Meal[] = [];

      while (randomMealsList.length < 8) {
        const meal = await fetchRandomMeal();
        if (
          meal &&
          !fetchedMealIds.has(meal.idMeal) &&
          !randomMealsList.some((m) => m.idMeal === meal.idMeal)
        ) {
          randomMealsList.push(meal);
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
    }
  }, [user]);

  const hasFetchedRandomMeals = useRef(false);

  useEffect(() => {
    if (!hasFetchedRandomMeals.current) {
      fetchRandomMealsExcludingUserRecipes();
      hasFetchedRandomMeals.current = true;
    }
  }, [fetchRandomMealsExcludingUserRecipes]);

  return (
    <UserRecipesContext.Provider
      value={{
        userRecipes,
        addRecipeToUser,
        deleteRecipeFromUser,
        randomMeals,
        isLoadingRandomMeals,
      }}
    >
      {children}
    </UserRecipesContext.Provider>
  );
};

export const useUserRecipes = (): UserRecipesContextProps => {
  const context = useContext(UserRecipesContext);
  if (context === undefined) {
    throw new Error('useUserRecipes must be used within a UserRecipesProvider');
  }
  return context;
};
