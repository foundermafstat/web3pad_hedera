'use client';

import { useEffect, useState } from 'react';

export interface PWAStatus {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  swActive: boolean;
}

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isOnline: true,
    isInstalled: false,
    canInstall: false,
    swActive: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check online status
    const updateOnlineStatus = () => {
      setStatus(prev => ({ ...prev, isOnline: navigator.onLine }));
    };

    // Check if installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;

    // Check Service Worker
    const checkSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          setStatus(prev => ({ 
            ...prev, 
            swActive: !!registration.active,
            isInstalled 
          }));
        } catch (err) {
          console.error('[PWA] SW check failed:', err);
        }
      }
    };

    updateOnlineStatus();
    checkSW();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Preload resources
  const preloadResource = async (url: string) => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('dynamic-v1');
        
        // Check if already cached
        const cached = await cache.match(url);
        if (cached) {
          console.log('[PWA] Already cached:', url);
          return;
        }
        
        console.log('[PWA] Attempting to fetch:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          credentials: 'same-origin',
        });
        
        console.log('[PWA] Fetch response for', url, ':', response.status, response.statusText);
        
        if (response.ok) {
          await cache.put(url, response.clone());
          console.log('[PWA] Successfully preloaded:', url);
        } else {
          console.warn('[PWA] Failed to preload (not ok):', url, response.status, response.statusText);
        }
      } catch (err) {
        console.warn('[PWA] Preload failed for:', url, err);
        // Don't throw the error, just log it
      }
    }
  };

  // Clear specific cache
  const clearCache = async (cacheName?: string) => {
    if ('caches' in window) {
      try {
        if (cacheName) {
          await caches.delete(cacheName);
        } else {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
        }
        console.log('[PWA] Cache cleared:', cacheName || 'all');
      } catch (err) {
        console.error('[PWA] Clear cache failed:', err);
      }
    }
  };

  // Get cache size estimate
  const getCacheSize = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
          percentage: estimate.quota 
            ? ((estimate.usage || 0) / estimate.quota * 100).toFixed(2)
            : '0'
        };
      } catch (err) {
        console.error('[PWA] Storage estimate failed:', err);
      }
    }
    return null;
  };

  return {
    status,
    preloadResource,
    clearCache,
    getCacheSize,
  };
}

