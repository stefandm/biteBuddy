// components/LoadingScreen.tsx
import loading from "/images/loading.png"
import { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
       <img
                src={loading}
                alt="loading"
                width={0}
                height={0}
                sizes="100"
                className="w-auto h-[50vh] rounded"
              />
    </div>
  );
};

export default LoadingScreen;
