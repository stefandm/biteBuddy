
import React, { useEffect, useState } from 'react';
import loading from '/images/loading.png'

interface LoadingScreenProps {
  isVisible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible }) => {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      // Delay hiding the screen to allow for fade-out effect
      const timer = setTimeout(() => setShouldRender(false), 300); // Duration of the transition
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    shouldRender && (
      <div
        className={`fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50 transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <img src={loading} alt="loading" className='w-screen h-screen'/>      </div>
    )
  );
};

export default LoadingScreen;
