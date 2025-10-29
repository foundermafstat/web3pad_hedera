/**
 * HashPack Detection Test
 * Simple test to check if HashPack is available and working
 */

export function testHashPackDetection() {
  console.log('🧪 Testing HashPack detection...');
  
  if (typeof window === 'undefined') {
    console.log('❌ Window object not available (SSR)');
    return false;
  }
  
  console.log('✅ Window object available');
  
  const hashpack = (window as any).hashpack;
  console.log('HashPack object:', hashpack);
  
  if (!hashpack) {
    console.log('❌ HashPack not found on window object');
    console.log('Available window properties:', Object.keys(window).filter(key => 
      key.toLowerCase().includes('hash') || 
      key.toLowerCase().includes('hedera') ||
      key.toLowerCase().includes('wallet')
    ));
    return false;
  }
  
  console.log('✅ HashPack found on window object');
  
  try {
    const isConnected = hashpack.isConnected();
    console.log('HashPack connected:', isConnected);
    
    if (isConnected) {
      const account = hashpack.getAccount();
      console.log('HashPack account:', account);
    }
  } catch (error) {
    console.error('Error checking HashPack status:', error);
  }
  
  return true;
}

// Auto-run test when module loads
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testHashPackDetection();
  }, 1000);
}

