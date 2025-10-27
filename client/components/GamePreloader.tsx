'use client';

import { useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';

interface GamePreloaderProps {
  videoUrls?: string[];
  imageUrls?: string[];
  priority?: 'high' | 'low';
}

// Component to preload game resources in the background
export function GamePreloader({ 
  videoUrls = [], 
  imageUrls = [],
  priority = 'low' 
}: GamePreloaderProps) {
  const { preloadResource, status } = usePWA();

  useEffect(() => {
    // Only preload when online and SW is active
    if (!status.isOnline || !status.swActive) {
      return;
    }

    // Preload images first (smaller)
    const preloadImages = async () => {
      for (const url of imageUrls) {
        try {
          await preloadResource(url);
        } catch (error) {
          console.warn(`Failed to preload image: ${url}`, error);
        }
      }
    };

    // Preload videos (larger, do it later)
    const preloadVideos = async () => {
      for (const url of videoUrls) {
        try {
          // For large files, only preload if user is on WiFi or has good connection
          if ('connection' in navigator) {
            const conn = (navigator as any).connection;
            // Skip video preload on slow connections
            if (conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') {
              console.log('[Preloader] Skipping video preload on slow connection');
              continue;
            }
          }
          await preloadResource(url);
        } catch (error) {
          console.warn(`Failed to preload video: ${url}`, error);
        }
      }
    };

    // Start preloading based on priority
    if (priority === 'high') {
      // Preload immediately
      preloadImages();
      preloadVideos();
    } else {
      // Preload after idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          preloadImages();
          preloadVideos();
        });
      } else {
        // Fallback: preload after 2 seconds
        setTimeout(() => {
          preloadImages();
          preloadVideos();
        }, 2000);
      }
    }
  }, [videoUrls, imageUrls, priority, status.isOnline, status.swActive, preloadResource]);

  return null; // This component doesn't render anything
}

// Predefined preloader for all game videos
export function AllGamesPreloader() {
  // Only preload files that we know exist
  const gameVideos = [
    '/videos/game01.mp4',
    '/videos/game02.mp4',
    '/videos/game03.mp4',
    '/videos/game04.mp4',
    '/videos/game05.mp4',
    '/videos/game06.mp4',
    '/videos/game07.mp4',
    '/videos/game08.mp4',
  ];

  const gameImages = [
    '/images/games/race.jpg',
    '/images/games/quiz.jpg',
    '/images/games/shooter.jpg',
    '/images/games/tower-defence.jpg',
  ];

  return (
    <GamePreloader 
      videoUrls={gameVideos} 
      imageUrls={gameImages}
      priority="low"
    />
  );
}

