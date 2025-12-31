/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',

    // Proxy API requests to backend container to keep backend private
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://backend:8000/:path*', // Proxy to Backend Service
            },
        ]
    },
};

module.exports = nextConfig;
