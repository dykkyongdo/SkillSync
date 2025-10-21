/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        // Only use rewrites in development
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    source: '/api/:path*',
                    destination: 'http://localhost:8080/api/:path*',
                },
                { source: '/v3/:path*', destination: 'http://localhost:8080/v3/:path*' },
                { source: '/swagger-ui/:path*', destination: 'http://localhost:8080/swagger-ui/:path*'},
            ];
        }
        // In production, don't rewrite - let the environment variable handle the API base URL
        return [];
    },
};

export default nextConfig;