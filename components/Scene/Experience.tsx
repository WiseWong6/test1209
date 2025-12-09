import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import MagicTree from './MagicTree';

const Experience: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-gray-900 to-black">
      <Canvas 
        camera={{ position: [0, 0, 12], fov: 45 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]} // Clamp pixel ratio for performance
      >
        <color attach="background" args={['#050505']} />
        
        {/* Environment */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={500} scale={15} size={2} speed={0.4} opacity={0.5} color="#ffd700" />
        
        {/* Lights */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffaa00" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffaa" />
        
        {/* The Tree */}
        <group position={[0, -2, 0]}>
          <MagicTree />
        </group>

        {/* Interaction */}
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.5}
          minDistance={5}
          maxDistance={20}
        />

        {/* Post Processing */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default Experience;
