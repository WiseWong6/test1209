import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTreeStore } from '../../stores/useTreeStore';

interface PhotoNodeProps {
  texture: THREE.Texture;
  index: number;
  total: number;
}

const PhotoNode: React.FC<PhotoNodeProps> = ({ texture, index, total }) => {
  const groupRef = useRef<THREE.Group>(null);
  const interactionStrength = useTreeStore((state) => state.interactionStrength);

  // Pre-calculate positions
  const phi = Math.acos(-1 + (2 * index) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;
  
  // Tree shape (Cone-ish) positions
  // h moves from bottom (-2) to top (2)
  const h = -3 + (index / total) * 6;
  const r = Math.sqrt(9 - h * h) * 0.6; // radius varying with height
  const angle = index * 0.5;
  
  const treePos = new THREE.Vector3(
    Math.cos(angle) * r,
    h,
    Math.sin(angle) * r
  );

  // Chaos Position (Random sphere)
  const chaosRadius = 8 + Math.random() * 4;
  const chaosPos = new THREE.Vector3(
    chaosRadius * Math.sin(phi) * Math.cos(theta),
    chaosRadius * Math.cos(phi),
    chaosRadius * Math.sin(phi) * Math.sin(theta)
  );

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Interpolate position based on strength
      // Strength 0 = Tree, Strength 1 = Chaos
      const targetPos = new THREE.Vector3().lerpVectors(treePos, chaosPos, interactionStrength);
      
      // Smooth damp
      groupRef.current.position.lerp(targetPos, delta * 3);
      
      // Face camera but maintain some random tilt when exploded
      groupRef.current.lookAt(state.camera.position);
      
      // Scale jitter on interaction
      const targetScale = 1 + interactionStrength * 0.5;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1));
    }
  });

  return (
    <group ref={groupRef}>
      {/* Photo Frame (Polaroid Backing) */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[1.2, 1.4, 0.05]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.8} />
      </mesh>
      
      {/* The Image */}
      <mesh position={[0, 0.1, 0.02]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export default PhotoNode;
