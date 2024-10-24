import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserRecipesProvider, useUserRecipes } from './contexts/UserRecipesContext';
import { SearchProvider, useSearch } from './contexts/SearchContext';
import { SelectedMealProvider, useSelectedMeal } from './contexts/SelectedMealContext';

import SearchBar from './components/SearchBar';
import SavedRecipes from './components/SavedRecipes';
import RecipeList from './components/RecipeList';
import ExpandedRecipeCard from './components/ExpandedRecipeCard';
import SkeletonList from './components/SkeletonList';
import Modal from './components/Modal'; 

import logoIMG from '/images/logoAndName.jpg';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppContent: React.FC = () => {
  const { user, signIn, signOutUser } = useAuth();
  const { selectedMeal, clearSelectedMeal } = useSelectedMeal();
  const {
    userRecipes,
    addRecipeToUser,
    randomMeals,
  } = useUserRecipes();
  const {
    searchResults,
    isLoadingSearchResults, 
  } = useSearch();
  const handleAddRecipe = async () => {
    if (selectedMeal) {
      await addRecipeToUser(selectedMeal);
      clearSelectedMeal(); 
    }
  };

  return (
    <div className="flex flex-col bg-slate-800 font-body font-main md:flex-row min-h-screen">
      <div
        className="border-b md:border-r border-orange-300 p-4 overflow-auto
        md:sticky md:top-0 md:h-screen md:max-w-[20vw] xl:max-w-[14vw]
        relative flex-shrink-0"
      >
        <img
          className="hidden md:inline-block h-auto w-auto object-cover mb-8 scale-[80%] rounded-xl"
          src={logoIMG}
          alt="Logo"
        />
        {user ? (
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl text-orange-300 text-center font-bold [text-shadow:2px_2px_6px_#000000]">
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
      <div className="flex-1 px-6 md:px-8 mb-10 overflow-auto">
        <SearchBar />
          <>
            {isLoadingSearchResults ? (
              <SkeletonList />
            ) : searchResults.length > 0 ? (
              <>
                <h2 className="text-4xl font-bold my-[5vh] text-center text-orange-300 [text-shadow:2px_2px_6px_#000000]">
                  Search Results
                </h2>
                <RecipeList meals={searchResults} itemsPerPage={12} />
              </>
            ) : (
              <>
              {randomMeals.length > 0 && (
                  <>
                    <h2 className="text-4xl font-bold my-[5vh] text-center text-orange-300 [text-shadow:2px_2px_6px_#000000]">
                      In Need of Inspiration?
                    </h2>
                    <RecipeList meals={randomMeals} itemsPerPage={12} />
                  </>
                )}
              </>
            )}
          </>
        <Modal isOpen={!!selectedMeal} onClose={clearSelectedMeal}>
          {selectedMeal && (
            <ExpandedRecipeCard onAddRecipe={handleAddRecipe} onClose={clearSelectedMeal} />
          )}
        </Modal>
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
