import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import  UserRecipesProvider  from './contexts/UserRecipesProvider';
import { SearchProvider } from './contexts/SearchProvider';
import { SelectedMealProvider } from './contexts/SelectedMealContext';

import { useAuthContext } from './hooks/useAuthContext';
import { useUserRecipesContext } from './hooks/useUserRecipesContext';
import { useSelectedMealContext } from './hooks/useSelectedMealContext';
import { useSearchContext } from './hooks/useSearchContext';

import SearchBar from './components/SearchBar';
import SavedRecipes from './components/SavedRecipes';
import RecipeList from './components/RecipeList';
import ExpandedRecipeCard from './components/ExpandedRecipeCard';
import SkeletonList from './components/SkeletonList';

import logoIMG from '/images/logoAndName.jpg';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import default styles
import Spinner from './components/Spinner';

const AppContent: React.FC = () => {
  const { user, signIn, signOutUser } = useAuthContext();
  const { selectedMeal, clearSelectedMeal, scrollToTopRef } = useSelectedMealContext();
  const {
    userRecipes,
    addRecipeToUser,
    recommendations,
    isLoadingRecommendations,
    randomMeals,
    isLoadingRandomMeals,
  } = useUserRecipesContext();
  const {
    searchResults,
    isLoadingSearchResults,
  } = useSearchContext();

  useEffect(() => {
    if (selectedMeal) {
      scrollToTopRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [selectedMeal, scrollToTopRef]);

  const handleAddRecipe = async () => {
    if (selectedMeal) {
      await addRecipeToUser(selectedMeal);
    }
  };

  if(isLoadingRandomMeals || isLoadingRecommendations ){
    return <Spinner/>
  }

  return (
    <div className="flex flex-col bg-slate-800 font-body font-main md:flex-row min-h-screen">
      <div
        className="border-b md:border-r border-orange-300 p-4 overflow-auto
        md:sticky md:top-0 md:h-screen md:max-w-[20vw] xl:max-w-[14vw]
        relative flex-shrink-"
      >
        <img
          className="hidden md:inline-block h-auto w-auto object-cover mb-8 scale-[80%] rounded-xl"
          src={logoIMG}
          alt="Logo"
        />
        {user ? (
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl  text-orange-300 text-center font-bold">
              Welcome, {user.displayName}
            </h1>
            <button
              onClick={signOutUser}
              className="px-2 py-1 font-secondary text-red-500 hover:bg-red-500 hover:text-white rounded shadow-[1px_1px_2px_1px_#f56565]"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex-col flex items-center mt-3">
            <h1 className="my-4 text-lg font-secondary text-white text-center">
              Sign in to view saved recipes
            </h1>
            <button
              onClick={signIn}
              className="p-2 font-secondary text-blue-400 rounded border border-blue-400 hover:text-white hover:bg-blue-400"
            >
              Sign In with Google
            </button>
          </div>
        )}

        {userRecipes.length > 0 && <SavedRecipes />}
      </div>

      <div className="flex-1 px-6 md:px-8 overflow-auto">
        {/* Reference for scrolling to top */}
        <div ref={scrollToTopRef}></div>

        <SearchBar />

        {selectedMeal ? (
          <ExpandedRecipeCard onAddRecipe={handleAddRecipe} onClose={clearSelectedMeal} />
        ) : (
          <>
            {isLoadingSearchResults ? (
              <SkeletonList/>
            ) : searchResults.length > 0 ? (
              <>
                <h2 className="text-4xl font-bold my-[5vh] text-center text-orange-300">
                  Search Results
                </h2>
                <RecipeList meals={searchResults} />
              </>
            ) : (
              <>
                {recommendations.length > 0 && (
                  <>
                    <h2 className="text-4xl font-bold my-[5vh] text-center text-orange-300">
                      Based on your taste
                    </h2>
                    {isLoadingRecommendations ? (
                    <SkeletonList/>
                    ) :  (
                      <RecipeList meals={recommendations} />
                    )}
                  </>
                )}

                <>
                  <h2 className="text-4xl  font-bold my-[5vh] text-center text-orange-300 ">
                    In need of inspiration?
                  </h2>
                  {isLoadingRandomMeals ? (
                    <SkeletonList/>
                  ) : (
                    <RecipeList meals={randomMeals} />
                  )}
                </>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <>
    <AuthProvider>
      <UserRecipesProvider>
        <SelectedMealProvider>
          <SearchProvider>
            <AppContent />
          </SearchProvider>
        </SelectedMealProvider>
      </UserRecipesProvider>
    </AuthProvider>
    <ToastContainer
        position="bottom-center"     
        autoClose={1500}      
        hideProgressBar={true}  
        newestOnTop={false}       
        closeOnClick            
        rtl={false}              
        pauseOnFocusLoss       
        draggable                
        theme="dark"          
      />
    </>
  );
};

export default App;
