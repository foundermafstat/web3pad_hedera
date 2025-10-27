// IPFS Configuration for Filebase
export const IPFS_CONFIG = {
  // Filebase IPFS RPC endpoint
  endpoint: 'https://rpc.filebase.io',
  
  // API Key for authentication
  apiKey: 'MTJFQzBDOTZCQ0E1MTYxNzY1OTg6dlZaN2VXZGRsZ3k0eGhFcjk1d0VBYzc3QTZOVWtXWDhaNjF1dmh3bjp3ZWIzcGFk',
  
  // IPFS Gateway for accessing files
  gateway: 'https://ipfs.filebase.io/ipfs/',
  
  // Headers for API requests
  headers: {
    'Authorization': 'Bearer MTJFQzBDOTZCQ0E1MTYxNzY1OTg6dlZaN2VXZGRsZ3k0eGhFcjk1d0VBYzc3QTZOVWtXWDhaNjF1dmh3bjp3ZWIzcGFk',
  },
};

// Helper function to get IPFS URL
export function getIPFSUrl(hash: string): string {
  return `${IPFS_CONFIG.gateway}${hash}`;
}

// Helper function to get IPFS client configuration
export function getIPFSClientConfig() {
  return {
    host: 'rpc.filebase.io',
    port: 443,
    protocol: 'https',
    headers: IPFS_CONFIG.headers,
  };
}


