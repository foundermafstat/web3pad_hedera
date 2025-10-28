/**
 * Get the socket server URL dynamically based on the current window location
 * This ensures WebSocket connections work when accessing from different IP addresses
 */
export function getSocketServerUrl(): string {
	if (typeof window === 'undefined') {
		return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
	}

	// If NEXT_PUBLIC_SOCKET_URL is set in env, use it
	const envSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
	if (envSocketUrl) {
		return envSocketUrl;
	}

	// Get the current host and port
	const { hostname, port, protocol } = window.location;

	// Determine if we're on a standard HTTP port
	const defaultPort = port === '3000' ? '3001' : port === '80' ? '' : port;
	const socketPort = defaultPort || '3001';

	// If protocol is https, use wss for socket connection
	const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
	const httpProtocol = protocol === 'https:' ? 'https:' : 'http:';

	// Construct the socket URL based on current location
	// For localhost, use ws://localhost:3001
	// For network IP, use ws://192.168.x.x:3001
	if (hostname === 'localhost' || hostname === '127.0.0.1') {
		return 'http://localhost:3001';
	}

	// For network connections, construct URL from current host
	const socketUrl = `${httpProtocol}//${hostname}:${socketPort}`;
	console.log('[SocketUtils] Dynamically determined socket URL:', socketUrl);
	return socketUrl;
}

/**
 * Get the base URL (origin) for API calls and links
 */
export function getBaseUrl(): string {
	if (typeof window === 'undefined') {
		return '';
	}
	return window.location.origin;
}

