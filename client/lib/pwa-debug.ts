// PWA Debug utilities for console
// Use in browser console: window.PWA.status(), window.PWA.clearCache(), etc.

export const PWADebug = {
  // Check Service Worker status
  async status() {
    console.log('=== PWA Status ===');
    
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        console.log('⚠️ No Service Worker registered');
        return;
      }

      console.log('✅ Service Worker registered');
      console.log('Scope:', registration.scope);
      console.log('Active:', !!registration.active);
      console.log('Installing:', !!registration.installing);
      console.log('Waiting:', !!registration.waiting);

      // Cache info
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log('\n=== Caches ===');
        console.log('Cache count:', cacheNames.length);
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          console.log(`📦 ${cacheName}: ${keys.length} items`);
        }
      }

      // Storage estimate
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usageMB = ((estimate.usage || 0) / 1024 / 1024).toFixed(2);
        const quotaMB = ((estimate.quota || 0) / 1024 / 1024).toFixed(2);
        const percentage = estimate.quota 
          ? ((estimate.usage || 0) / estimate.quota * 100).toFixed(2)
          : '0';

        console.log('\n=== Storage ===');
        console.log(`Used: ${usageMB} MB`);
        console.log(`Quota: ${quotaMB} MB`);
        console.log(`Usage: ${percentage}%`);
      }

      // Network status
      console.log('\n=== Network ===');
      console.log('Online:', navigator.onLine);
      
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        console.log('Type:', conn?.effectiveType || 'unknown');
        console.log('Downlink:', conn?.downlink + ' Mbps' || 'unknown');
        console.log('RTT:', conn?.rtt + ' ms' || 'unknown');
      }

    } catch (err) {
      console.error('Error getting SW status:', err);
    }
  },

  // List all cached items
  async listCache(cacheName?: string) {
    if (!('caches' in window)) {
      console.log('❌ Cache API not supported');
      return;
    }

    const cacheNames = await caches.keys();
    
    if (cacheName) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      console.log(`=== Cache: ${cacheName} ===`);
      keys.forEach((request, i) => {
        console.log(`${i + 1}. ${request.url}`);
      });
    } else {
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        console.log(`\n=== ${name} (${keys.length} items) ===`);
        keys.forEach((request, i) => {
          console.log(`${i + 1}. ${request.url}`);
        });
      }
    }
  },

  // Clear specific or all caches
  async clearCache(cacheName?: string) {
    if (!('caches' in window)) {
      console.log('❌ Cache API not supported');
      return;
    }

    if (cacheName) {
      const deleted = await caches.delete(cacheName);
      console.log(deleted ? `✅ Deleted cache: ${cacheName}` : `❌ Cache not found: ${cacheName}`);
    } else {
      const cacheNames = await caches.keys();
      let count = 0;
      
      for (const name of cacheNames) {
        await caches.delete(name);
        count++;
      }
      
      console.log(`✅ Deleted ${count} caches`);
    }
  },

  // Unregister Service Worker
  async unregister() {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported');
      return;
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    let count = 0;

    for (const registration of registrations) {
      await registration.unregister();
      count++;
    }

    console.log(`✅ Unregistered ${count} Service Worker(s)`);
    console.log('⚠️ Reload page to complete unregistration');
  },

  // Update Service Worker
  async update() {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported');
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      console.log('⚠️ No Service Worker registered');
      return;
    }

    await registration.update();
    console.log('✅ Service Worker update check triggered');
  },

  // Test offline mode
  testOffline() {
    console.log('🔌 Testing offline mode...');
    console.log('Open DevTools → Network → Check "Offline"');
    console.log('Then refresh the page to see cached content');
  },

  // Preload a URL
  async preload(url: string) {
    if (!('caches' in window)) {
      console.log('❌ Cache API not supported');
      return;
    }

    try {
      const cache = await caches.open('dynamic-v1');
      const response = await fetch(url);
      
      if (response.ok) {
        await cache.put(url, response);
        console.log(`✅ Preloaded: ${url}`);
      } else {
        console.log(`❌ Failed to preload: ${url} (${response.status})`);
      }
    } catch (err) {
      console.error('Preload error:', err);
    }
  },

  // Show help
  help() {
    console.log('=== PWA Debug Commands ===');
    console.log('window.PWA.status()           - Show PWA status');
    console.log('window.PWA.listCache()        - List all cached items');
    console.log('window.PWA.listCache(name)    - List items in specific cache');
    console.log('window.PWA.clearCache()       - Clear all caches');
    console.log('window.PWA.clearCache(name)   - Clear specific cache');
    console.log('window.PWA.unregister()       - Unregister Service Worker');
    console.log('window.PWA.update()           - Check for SW updates');
    console.log('window.PWA.testOffline()      - Instructions for offline testing');
    console.log('window.PWA.preload(url)       - Preload a URL into cache');
    console.log('window.PWA.help()             - Show this help');
  }
};

// Attach to window in browser
if (typeof window !== 'undefined') {
  (window as any).PWA = PWADebug;
  
  // Show hint in console (only in dev)
  if (process.env.NODE_ENV !== 'production') {
    console.log('💡 PWA debug tools available. Type: window.PWA.help()');
  }
}

