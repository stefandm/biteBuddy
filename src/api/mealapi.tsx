// src/mealApi.ts
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// import {stemmer} from 'stemmer';
import pluralize from 'pluralize';

import { ApiResponse } from '../types';


export const normalizeIngredient = (ingredient: string): string => {
  // Convert to lower case
  const lowerCaseIngredient = ingredient.toLowerCase();
  
  console.log(`Normalizing ingredient: ${lowerCaseIngredient}`); // Debug log

  // Normalize by removing plural forms (e.g., "carrots" to "carrot")
  return pluralize.singular(lowerCaseIngredient);
};





export const searchMeals = async (query: string, isIngredientSearch = false): Promise<ApiResponse> => {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/${isIngredientSearch ? 'filter' : 'search'}.php?${isIngredientSearch ? 'i' : 's'}=${query}`);
    const data: ApiResponse = await response.json();
    
    // Handle cases where 'meals' is null or empty
    return {
      meals: Array.isArray(data.meals) ? data.meals : []
    };
  } catch (error) {
    console.error('Error fetching meals:', error);
    return { meals: [] }; // Return an empty array in case of an error
  }
};









export const getMealDetails = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/lookup.php?i=${id}`);
    if (!response.ok) throw new Error('Failed to fetch meal details');
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
  } catch (error) {
    console.error('Error fetching meal details:', error);
    return null;
  }
};
