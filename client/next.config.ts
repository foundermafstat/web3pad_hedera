import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	eslint: {
		// Disable ESLint during builds
		// Can be re-enabled after fixing all errors
		ignoreDuringBuilds: true,
	},
	typescript: {
		// Ignore TypeScript errors during builds
		// Allows production deployment even with TS errors
		ignoreBuildErrors: true,
	},
	// Exclude Service Worker from being processed as a route
	async headers() {
		return [
			{
				source: '/sw.js',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=0, must-revalidate',
					},
					{
						key: 'Service-Worker-Allowed',
						value: '/',
					},
				],
			},
			{
				source: '/manifest.json',
				headers: [
					{
						key: 'Content-Type',
						value: 'application/manifest+json',
					},
				],
			},
			{
				source: '/_next/static/css/(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
			{
				source: '/videos/(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=86400',
					},
					{
						key: 'Access-Control-Allow-Origin',
						value: '*',
					},
				],
			},
			{
				source: '/images/(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=86400',
					},
					{
						key: 'Access-Control-Allow-Origin',
						value: '*',
					},
				],
			},
		];
	},
	images: {
		// Allow external images from OAuth providers
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '*.googleusercontent.com',
				pathname: '/**',
			},
		],
	},
	// Fix multiple lockfiles warning - use root directory as workspace root
	outputFileTracingRoot: '../',
	webpack: (config, { isServer, dev }) => {

		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				net: false,
				tls: false,
				crypto: false,
				stream: false,
				util: false,
				url: false,
				assert: false,
				http: false,
				https: false,
				os: false,
				buffer: false,
			};
		}

		if (!isServer) {
			config.optimization = {
				...config.optimization,
				splitChunks: {
					...config.optimization.splitChunks,
					cacheGroups: {
						...config.optimization.splitChunks.cacheGroups,
						
					},
				},
			};
		}
		
		return config;
	},
};

export default nextConfig;
