/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// output: 'export',
	distDir: './dist',
	images: {
		domains: ['lh3.googleusercontent.com'],
	},
};

export default nextConfig;
