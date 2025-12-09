import React from 'react';
import Experience from './components/Scene/Experience';
import Interface from './components/UI/Interface';
import { useHandLandmarker } from './hooks/useHandLandmarker';

const App: React.FC = () => {
  // Initialize AI hook
  const { error } = useHandLandmarker();

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {error && (
        <div className="absolute top-0 left-0 w-full bg-red-600 text-white p-2 text-center z-50 font-bold">
          {error}
        </div>
      )}
      
      <Experience />
      <Interface />
    </main>
  );
};

export default App;
