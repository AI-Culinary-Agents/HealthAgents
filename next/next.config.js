import path from 'path';
import { fileURLToPath } from 'url';

/** @type {import('next').NextConfig} */

// Get the __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
	reactStrictMode: true,
	distDir: './dist',
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				pathname: '/**',
			},
		],
	},
	webpack: (config) => {
		config.resolve.alias['@'] = path.resolve(__dirname, '.');
		return config;
	},
};

export default nextConfig;
