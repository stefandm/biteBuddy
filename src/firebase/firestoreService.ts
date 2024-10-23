import { collection, addDoc, Timestamp, onSnapshot, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from './config';
import { Recipe } from '../types';
import { Meal } from '../types';


export const addRecipe = async (userId: string, meal: Meal) => {
  try {
      const docRef = await addDoc(collection(db, 'recipes'), {
          userId,
          meal,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
      });
      console.log('Recipe added with ID: ', docRef.id);
  } catch (e) {
      console.error('Error adding recipe: ', e);
  }
};


export const listenToUserRecipes = (userId: string, callback: (recipes: Recipe[]) => void) => {
    const q = query(collection(db, 'recipes'), where('userId', '==', userId));
    return onSnapshot(q, (querySnapshot) => {
        const recipes: Recipe[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            meal: doc.data().meal as Recipe['meal']
        }));
        callback(recipes);
    }, (error) => {
        console.error('Error retrieving recipes: ', error);
    });
};



export const deleteRecipe = async (recipeId: string) => {
    try {
        await deleteDoc(doc(db, 'recipes', recipeId));
    } catch (e) {
        console.error('Error deleting recipe: ', e);
    }
};


