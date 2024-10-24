import React from 'react';
import { AuthProvider } from './contexts/AuthProvider';
import { UserRecipesProvider } from './contexts/UserRecipesProvider';
import { SelectedMealProvider } from './contexts/SelectedMealProvider';
import { SearchProvider } from './contexts/SearchProvider';

import Sidebar from './components/Sidebar';
import SearchSection from './components/SearchSection';
import ModalContainer from './components/ModalContainer';
import Notifications from './components/Notifications';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UserRecipesProvider>
        <SelectedMealProvider>
          <SearchProvider>
            <div className="flex flex-col md:flex-row min-h-screen bg-slate-800 font-body font-main">
              <Sidebar />
              <div className="flex-1 px-6 md:px-8 mb-10 overflow-auto">
                <SearchSection />
                <ModalContainer />
              </div>
            </div>
            <Notifications />
          </SearchProvider>
        </SelectedMealProvider>
      </UserRecipesProvider>
    </AuthProvider>
  );
};

export default App;
