import React, { useRef } from 'react';
import * as THREE from 'three';
import { useTreeStore } from '../../stores/useTreeStore';

const Uploader: React.FC = () => {
  const addUserTexture = useTreeStore((state) => state.addUserTexture);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const loader = new THREE.TextureLoader();
          loader.load(result, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            // Often textures from DOM need flipY false depending on UVs, 
            // but for simple planes, defaults are usually fine or flipY=true.
            // Let's keep default but ensure SRGB.
            addUserTexture(texture);
          });
        }
      };
      reader.readAsDataURL(file as Blob);
    });
  };

  return (
    <div className="pointer-events-auto">
      <input
        type="file"
        multiple
        accept="image/*"
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full font-semibold hover:bg-white/20 transition-all shadow-lg text-sm flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        Add Photo Ornament
      </button>
    </div>
  );
};

export default Uploader;