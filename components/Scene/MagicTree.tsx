import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTreeStore } from '../../stores/useTreeStore';
import PhotoNode from './PhotoNode';

const PARTICLE_COUNT = 2500;

// Custom Shader Material for particles
const ParticleMaterial = {
  vertexShader: `
    uniform float uTime;
    uniform float uStrength;
    attribute vec3 aStartPos;
    attribute vec3 aTargetPos;
    attribute float aRandom;
    
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // Mix positions: 0 = Target (Tree), 1 = Start (Chaos/Explosion)
      // Note: We inverted logic in naming for convenience, let's stick to:
      // uStrength 0 = Tree, 1 = Chaos.
      
      vec3 pos = mix(aTargetPos, aStartPos, uStrength);
      
      // Add spiral rotation effect when assembling
      float angle = uTime * 0.2 + aStartPos.y;
      if (uStrength < 0.5) {
        float rot = (1.0 - uStrength) * 0.5;
        // Simple Y-axis rotation matrix logic could go here, 
        // but let's keep it simple translation for stability.
      }

      // Noise/Wobble
      pos.x += sin(uTime * aRandom + pos.y) * 0.1 * uStrength;
      pos.y += cos(uTime * 0.5 * aRandom) * 0.1 * uStrength;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Color mixing: Gold to Green/Red based on position
      vec3 colorA = vec3(1.0, 0.84, 0.0); // Gold
      vec3 colorB = vec3(0.0, 0.5, 0.2); // Green
      vColor = mix(colorB, colorA, aRandom);
      
      // Alpha fade slightly on explosion
      vAlpha = 1.0;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      // Circular particle
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;
      
      gl_FragColor = vec4(vColor, vAlpha);
    }
  `
};

const MagicTree: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const interactionStrength = useTreeStore((state) => state.interactionStrength);
  const userTextures = useTreeStore((state) => state.userTextures);

  const { targetPositions, startPositions, randoms } = useMemo(() => {
    const tPos = new Float32Array(PARTICLE_COUNT * 3);
    const sPos = new Float32Array(PARTICLE_COUNT * 3);
    const rnd = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // TARGET: Tree Shape (Cone)
      // Height -4 to 4
      const h = -4 + Math.random() * 8;
      // Radius decreases as height increases
      const rBase = (4 - h) * 0.5; 
      const theta = Math.random() * Math.PI * 2 * 6; // Spiral
      const x = Math.cos(theta) * rBase;
      const z = Math.sin(theta) * rBase;
      
      tPos[i * 3] = x;
      tPos[i * 3 + 1] = h;
      tPos[i * 3 + 2] = z;

      // START: Chaos (Sphere/Explosion)
      const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
      const randTheta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
      const radius = 10 + Math.random() * 5;

      sPos[i * 3] = radius * Math.sin(phi) * Math.cos(randTheta);
      sPos[i * 3 + 1] = radius * Math.cos(phi);
      sPos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(randTheta);

      rnd[i] = Math.random();
    }

    return { targetPositions: tPos, startPositions: sPos, randoms: rnd };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Smooth lerp the strength value
      materialRef.current.uniforms.uStrength.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uStrength.value,
        interactionStrength,
        0.1
      );
    }
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <icosahedronGeometry args={[0.08, 0]}>
          <instancedBufferAttribute attach="attributes-aTargetPos" args={[targetPositions, 3]} />
          <instancedBufferAttribute attach="attributes-aStartPos" args={[startPositions, 3]} />
          <instancedBufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
        </icosahedronGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={ParticleMaterial.vertexShader}
          fragmentShader={ParticleMaterial.fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uStrength: { value: 0 }
          }}
          transparent
        />
      </instancedMesh>

      {/* Render User Photos */}
      {userTextures.map((texture, i) => (
        <PhotoNode 
          key={texture.uuid} 
          texture={texture} 
          index={i} 
          total={Math.max(userTextures.length, 1)} 
        />
      ))}
    </>
  );
};

export default MagicTree;
