import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useTreeStore } from '../stores/useTreeStore';

const VISION_BASE_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm";

export const useHandLandmarker = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const setInteractionStrength = useTreeStore((state) => state.setInteractionStrength);
  const setVisionReady = useTreeStore((state) => state.setVisionReady);

  useEffect(() => {
    const initLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(VISION_BASE_URL);
        
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        startWebcam();
      } catch (err: any) {
        console.error("Error initializing MediaPipe:", err);
        setError("Failed to load AI model.");
      }
    };

    initLandmarker();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startWebcam = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Webcam not supported.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      const video = document.createElement("video");
      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;
      
      video.onloadeddata = () => {
        video.play();
        videoRef.current = video;
        setVisionReady(true);
        predict();
      };
    } catch (err) {
      setError("Camera permission denied.");
    }
  };

  const predict = () => {
    if (landmarkerRef.current && videoRef.current && videoRef.current.readyState >= 2) {
      const startTimeMs = performance.now();
      const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        // ID 4 = Thumb Tip, ID 8 = Index Finger Tip
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];

        // Calculate Euclidean distance between thumb and index
        const distance = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) + 
          Math.pow(thumbTip.y - indexTip.y, 2) + 
          Math.pow(thumbTip.z - indexTip.z, 2)
        );

        // Normalize Logic:
        // < 0.05 (Closed/Fist) -> Strength 0 (Tree formed)
        // > 0.15 (Open Hand)   -> Strength 1 (Exploded)
        const minD = 0.05;
        const maxD = 0.15;
        
        // Clamp and normalize
        let strength = (distance - minD) / (maxD - minD);
        strength = Math.max(0, Math.min(1, strength));

        // Update Global Store directly
        setInteractionStrength(strength);
      } else {
        // If no hand detected, slowly drift back to tree form (0)
        // We read the current state via a transient subscription or just set slowly?
        // For simplicity, we assume 0 if no hand.
        setInteractionStrength(0);
      }
    }
    requestRef.current = requestAnimationFrame(predict);
  };

  return { error };
};
