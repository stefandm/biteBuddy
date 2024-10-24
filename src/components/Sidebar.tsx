import React from 'react';
import logoIMG from '/images/logoAndName.jpg';
import { useAuth } from '../hooks/useAuth';
import SavedRecipes from './SavedRecipes';

const Sidebar: React.FC = () => {
  const { user, signIn, signOutUser } = useAuth();

  return (
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
    <SavedRecipes />
  </div>
  );
};

export default Sidebar;
