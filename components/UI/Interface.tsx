import React from 'react';
import { useTreeStore } from '../../stores/useTreeStore';
import Uploader from './Uploader';

const Interface: React.FC = () => {
  const isVisionReady = useTreeStore((state) => state.isVisionReady);
  const interactionStrength = useTreeStore((state) => state.interactionStrength);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 drop-shadow-md">
            Magic Tree
          </h1>
          <p className="text-white/60 text-sm mt-1">Experimental WebGL x AI Gesture</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
           <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isVisionReady ? 'border-green-500 text-green-400 bg-green-900/20' : 'border-red-500 text-red-400 bg-red-900/20'} transition-colors`}>
             {isVisionReady ? 'AI Vision Active' : 'Initializing Camera...'}
           </div>
        </div>
      </div>

      {/* Center Indicator */}
      {isVisionReady && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center opacity-70">
          <div className="text-white/30 text-xs uppercase tracking-widest mb-2">Gesture Strength</div>
          <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-100 ease-out"
              style={{ width: `${interactionStrength * 100}%` }}
            />
          </div>
          <p className="text-white/40 text-[10px] mt-2">
            {interactionStrength < 0.2 ? "Fist to Assemble" : interactionStrength > 0.8 ? "Open Hand to Explode" : "Hold..."}
          </p>
        </div>
      )}

      {/* Footer Controls */}
      <div className="flex items-end justify-between w-full">
        <div className="text-white/50 text-xs max-w-xs">
          <p className="font-semibold text-white/80 mb-1">How to play:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Allow camera access.</li>
            <li>Show your hand to the camera.</li>
            <li><strong>Closed Fist:</strong> Tree assembles.</li>
            <li><strong>Open Hand:</strong> Tree explodes.</li>
          </ul>
        </div>

        <Uploader />
      </div>
    </div>
  );
};

export default Interface;
