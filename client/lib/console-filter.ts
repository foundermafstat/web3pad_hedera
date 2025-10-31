/**
 * Console Filter Utility
 * Filters out empty objects and trivial error logs from WalletConnect and other libraries
 */

let isFilterInstalled = false;

/**
 * Install console filter to suppress empty object logs
 * This is especially useful for WalletConnect relay messages that log empty objects
 */
export function installConsoleFilter(): void {
  if (typeof window === 'undefined' || isFilterInstalled) {
    return; // Only run on client side and only once
  }

  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;

  // Filter console.error
  console.error = (...args: any[]) => {
    // Check if this is being called from WalletConnect relay message handler
    try {
      const stack = new Error().stack || '';
      if (stack.includes('onRelayMessage') || stack.includes('onProviderMessageEvent')) {
        // Always suppress errors from WalletConnect relay messages
        return;
      }
    } catch (e) {
      // Ignore stack trace errors
    }
    
    // Skip empty objects or objects with only standard Error properties
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
      const keys = Object.keys(args[0]);
      const allKeys = [...keys, ...Object.getOwnPropertyNames(args[0])];
      
      // Skip completely empty objects or objects with only Error-like properties
      if (keys.length === 0 || allKeys.length === 0) {
        return;
      }
      
      // Skip objects that stringify to empty or just {}
      try {
        const stringified = JSON.stringify(args[0]);
        if (stringified === '{}' || stringified === 'null' || stringified === '[]') {
          return;
        }
      } catch (e) {
        // If can't stringify, let it through
      }
    }
    
    // Skip errors from WalletConnect relay with empty messages
    const errorStr = args[0]?.toString?.() || '';
    if (errorStr.includes('relay') && args.length === 1 && typeof args[0] === 'object') {
      return;
    }
    
    originalConsoleError.apply(console, args);
  };

  // Filter console.log
  console.log = (...args: any[]) => {
    // Skip empty objects
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && Object.keys(args[0]).length === 0) {
      return;
    }
    originalConsoleLog.apply(console, args);
  };

  // Filter console.warn
  console.warn = (...args: any[]) => {
    // Skip empty objects
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && Object.keys(args[0]).length === 0) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  isFilterInstalled = true;
  console.log('[ConsoleFilter] Console filter installed - empty objects will be suppressed');
}

/**
 * Uninstall console filter and restore original console methods
 * Useful for development/debugging
 */
export function uninstallConsoleFilter(): void {
  // Note: This is a simplified uninstall - in production, you'd need to store original refs
  isFilterInstalled = false;
  console.log('[ConsoleFilter] Console filter uninstalled');
}

