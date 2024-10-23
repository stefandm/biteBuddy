import { ApiResponse, Meal } from "../types";

export const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export const searchMeals = async (
  query: string,
  isIngredientSearch: boolean = false
): Promise<ApiResponse> => {
  const endpoint = isIngredientSearch ? 'filter.php?i=' : 'search.php?s=';
  const response = await fetch(`${API_BASE_URL}/${endpoint}${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch meals');
  }
  const data: ApiResponse = await response.json();
  return data;
};

export const lookupMeal = async (idMeal: string): Promise<Meal> => {
  const response = await fetch(`${API_BASE_URL}/lookup.php?i=${idMeal}`);
  if (!response.ok) {
    throw new Error('Failed to fetch meal details');
  }
  const data: ApiResponse = await response.json();
  if (!data.meals || data.meals.length === 0) {
    throw new Error('Meal not found');
  }
  return data.meals[0];
};
