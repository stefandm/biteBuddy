import React from 'react';

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-slate-900">
    <div className="flex flex-col items-center">
      {/* Spinner */}
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-4"></div>
      
      {/* "Bite Buddy" Text */}
      <span className="text-orange-300 text-5xl font-bold">
        Bite Buddy
      </span>
    </div>
  </div>
);

export default Spinner;
