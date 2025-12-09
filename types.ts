import * as THREE from 'three';

export interface TreeState {
  interactionStrength: number; // 0 (Tree/Fist) to 1 (Chaos/Open)
  userTextures: THREE.Texture[];
  setInteractionStrength: (val: number) => void;
  addUserTexture: (texture: THREE.Texture) => void;
  isVisionReady: boolean;
  setVisionReady: (ready: boolean) => void;
}

export type HandLandmarkResult = {
  landmarks: { x: number; y: number; z: number }[][];
};
