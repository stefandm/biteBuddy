import { ApiResponse } from '../types';
import pluralize from 'pluralize';

// API Base URL
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Debounce delay (in milliseconds)
const DEBOUNCE_DELAY = 1000;

// Cache for storing API responses
const cache = new Map<string, ApiResponse>();

// Debounce function
const debounce = <T extends (...args: never[]) => void>(func: T, wait: number): T => {
  let timeout: NodeJS.Timeout;
  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  } as T;
};

// Normalize ingredient names
export const normalizeIngredient = (ingredient: string): string => {
  const lowerCaseIngredient = ingredient.toLowerCase();
  console.log(`Normalizing ingredient: ${lowerCaseIngredient}`); // Debug log
  return pluralize.singular(lowerCaseIngredient);
};

// Search meals with caching and error handling
export const searchMeals = async (query: string, isIngredientSearch = false): Promise<ApiResponse> => {
  const cacheKey = `${isIngredientSearch ? 'i' : 's'}=${query}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/${isIngredientSearch ? 'filter' : 'search'}.php?${isIngredientSearch ? 'i' : 's'}=${query}`);
    if (response.status === 429) {
      console.error('Rate limit exceeded. Please try again later.');
      return { meals: [] };
    }
    const data: ApiResponse = await response.json();
    const result: ApiResponse = {
      meals: Array.isArray(data.meals) ? data.meals : []
    };
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching meals:', error);
    return { meals: [] };
  }
};

// Fetch meal details
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

// Export debounced search function
export const debouncedSearchMeals = debounce(searchMeals, DEBOUNCE_DELAY);
