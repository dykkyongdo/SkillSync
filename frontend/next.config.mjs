/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8080/api/:path*',
            },

            { source: '/v3/:path*', destination: 'http://localhost:8080/v3/:path*' },
            { source: '/swagger-ui/:path*', destination: 'http://localhost:8080/swagger-ui/:path*'},
        ];
    },
};

export default nextConfig;