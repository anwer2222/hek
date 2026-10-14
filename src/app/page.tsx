"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

interface CanvasTourProps {
  totalFrames: number;
  framePath: (index: number) => string;
  fps?: number;
}

{/* export default function PropertyTourViewer() { */}

export default function Home() {
  const TOTAL_FRAMES = 429; // Total count of webp frames
  const FPS = 30;

  // Replace these with your 6 exact stopping frame indices (0-indexed)
  // e.g., Frame 1 is index 0, Frame 25 is index 24, etc.
  const KEYFRAMES = [0, 18, 116, 178, 235, 296, 356,419, 429];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);

  // Preload all frames on mount
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new window.Image();
      img.src = `/frames/frame-${String(i).padStart(5, "0")}.webp`;

      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));

        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setLoaded(true);

          // Render initial frame
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext("2d");
            canvas.width = img.naturalWidth || 1280;
            canvas.height = img.naturalHeight || 720;
            ctx?.drawImage(images[KEYFRAMES[0]], 0, 0);
          }
        }
      };
      images.push(img);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [TOTAL_FRAMES]);

  // Frame transition runner
  const animateTo = (targetFrame: number, onComplete?: () => void) => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    const frameInterval = 1000 / FPS;
    let lastTime = performance.now();

    const step = (now: number) => {
      const delta = now - lastTime;

      if (delta >= frameInterval) {
        lastTime = now - (delta % frameInterval);

        if (currentFrameRef.current < targetFrame) {
          currentFrameRef.current += 1;
        } else if (currentFrameRef.current > targetFrame) {
          currentFrameRef.current -= 1;
        }

        const canvas = canvasRef.current;
        const img = imagesRef.current[currentFrameRef.current];
        if (canvas && img) {
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
        }
      }

      if (currentFrameRef.current !== targetFrame) {
        animationFrameId.current = requestAnimationFrame(step);
      } else if (onComplete) {
        onComplete();
      }
    };

    animationFrameId.current = requestAnimationFrame(step);
  };

  const handleNext = () => {
    if (currentStopIndex === KEYFRAMES.length - 1) {
      // At last view: seamlessly loop around to stop 2 (index 1)
      currentFrameRef.current = KEYFRAMES[0];
      setCurrentStopIndex(1);
      animateTo(KEYFRAMES[1]);
    } else {
      const nextIndex = currentStopIndex + 1;
      setCurrentStopIndex(nextIndex);
      animateTo(KEYFRAMES[nextIndex]);
    }
  };

  const handlePrev = () => {
    if (currentStopIndex === 0) {
      // At first view: loop back to the penultimate stop (second to last)
      const penultimateIndex = KEYFRAMES.length - 2;
      currentFrameRef.current = KEYFRAMES[KEYFRAMES.length - 1];
      setCurrentStopIndex(penultimateIndex);
      animateTo(KEYFRAMES[penultimateIndex]);
    } else {
      const prevIndex = currentStopIndex - 1;
      setCurrentStopIndex(prevIndex);
      animateTo(KEYFRAMES[prevIndex]);
    }
  };


  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert h-20 w-300"
          src="/dreptec_logo.png"
          alt="dreptec logo"
          width={300}
          height={150}
          priority
        />
        
  



        <main className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-neutral-950 shadow-2xl border border-neutral-800">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
            <span className="text-sm font-medium">Loading tour frames...</span>
            <span className="text-xs text-neutral-400">{loadProgress}%</span>
          </div>
        )}

        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {loaded && (
          <>
            {/* Viewpoint Indicator */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs">
              View {currentStopIndex + 1} of {KEYFRAMES.length}
            </div>

            {/* Navigation Buttons (Always active due to loop) */}
            <div className="absolute inset-x-0 bottom-4 flex justify-between px-6 z-10 pointer-events-none">
              <button
                onClick={handlePrev}
                className="pointer-events-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm font-medium transition active:scale-95 border border-white/10"
              >
                Previous View
              </button>
              <button
                onClick={handleNext}
                className="pointer-events-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm font-medium transition active:scale-95 border border-white/10"
              >
                Next View
              </button>
            </div>
          </>
        )}
      </div>
    </main>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href=""
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert h-[14px] w-4"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            Dreptec 
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href=""
            target="_blank"
            rel="noopener noreferrer"
          >
            Demo
          </a>
        </div>
      </main>
    </div>
  );
}
