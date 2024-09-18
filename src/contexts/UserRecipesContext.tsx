// contexts/UserRecipesContext.tsx

import { createContext } from 'react';
import { Recipe, Meal } from '../types';

interface UserRecipesContextProps {
    userRecipes: Recipe[];
    addRecipeToUser: (meal: Meal) => Promise<void>;
    deleteRecipeFromUser: (recipeId: string) => Promise<void>;
    recommendations: Meal[];
    isLoadingRecommendations: boolean;
    randomMeals: Meal[];
    isLoadingRandomMeals: boolean;
}

export const UserRecipesContext = createContext<UserRecipesContextProps | undefined>(undefined);
