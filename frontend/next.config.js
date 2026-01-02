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
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                child_process: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
