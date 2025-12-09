import { create } from 'zustand';
import { TreeState } from '../types';

export const useTreeStore = create<TreeState>((set) => ({
  interactionStrength: 0, // Starts formed as a tree
  userTextures: [],
  isVisionReady: false,
  
  setInteractionStrength: (val) => set({ interactionStrength: val }),
  
  addUserTexture: (texture) => set((state) => ({ 
    userTextures: [...state.userTextures, texture] 
  })),

  setVisionReady: (ready) => set({ isVisionReady: ready }),
}));
