// api/mealapi.ts

import { ApiResponse, Meal } from '../types';
import pluralize from 'pluralize';

export const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const cache = new Map<string, ApiResponse>();

export const normalizeIngredient = (ingredient: string): string => {
  const lowerCaseIngredient = ingredient.toLowerCase();
  return pluralize.singular(lowerCaseIngredient);
};

export const searchMeals = async (
  query: string,
  isIngredientSearch = false
): Promise<ApiResponse> => {
  if (!query.trim()) {
    return { meals: [] };
  }

  if (isIngredientSearch) {
    // Generate singular and plural forms
    const singularForm = pluralize.singular(query.toLowerCase());
    const pluralForm = pluralize.plural(query.toLowerCase());

    // console.log(`Searching for ingredients: ${singularForm} and ${pluralForm}`);

    const cacheKey = `i=${singularForm}|${pluralForm}`;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    try {
      // Fetch meals with singular form
      const responseSingular = await fetch(
        `${API_BASE_URL}/filter.php?i=${encodeURIComponent(singularForm)}`
      );
      const dataSingular: ApiResponse = await responseSingular.json();
      const mealsSingular = Array.isArray(dataSingular.meals) ? dataSingular.meals : [];

      // Fetch meals with plural form if it's different
      let mealsPlural: Meal[] = [];
      if (singularForm !== pluralForm) {
        const responsePlural = await fetch(
          `${API_BASE_URL}/filter.php?i=${encodeURIComponent(pluralForm)}`
        );
        const dataPlural: ApiResponse = await responsePlural.json();
        mealsPlural = Array.isArray(dataPlural.meals) ? dataPlural.meals : [];
      }

      // Combine and remove duplicates
      const combinedMeals = [...mealsSingular, ...mealsPlural];
      const uniqueMeals = Array.from(
        new Map(combinedMeals.map((meal) => [meal.idMeal, meal])).values()
      );

      const result: ApiResponse = {
        meals: uniqueMeals,
      };

      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching meals:', error);
      return { meals: [] };
    }
  } else {
    // Non-ingredient search remains the same
    const cacheKey = `s=${query}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/search.php?s=${encodeURIComponent(query)}`
      );
      const data: ApiResponse = await response.json();
      const result: ApiResponse = {
        meals: Array.isArray(data.meals) ? data.meals : [],
      };
      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching meals:', error);
      return { meals: [] };
    }
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

// Debounce function and debouncedSearchMeals remain unchanged


export const fetchRandomMeals = async (count: number = 12): Promise<Meal[]> => {
  const randomMeals: Meal[] = [];
  const fetchedMealIds = new Set<string>(); // Use a Set to store unique meal IDs

  try {
    while (randomMeals.length < count) {
      const response = await fetch(`${API_BASE_URL}/random.php`);
      const data: ApiResponse = await response.json();
      if (data.meals && data.meals.length > 0) {
        const meal = data.meals[0];

        // Check if the meal ID is already in the Set
        if (!fetchedMealIds.has(meal.idMeal)) {
          fetchedMealIds.add(meal.idMeal); // Add the new meal ID to the Set
          randomMeals.push(meal); // Add the meal to the list
        }
      }
    }
  } catch (error) {
    console.error('Error fetching random meals:', error);
  }

  return randomMeals;
};
