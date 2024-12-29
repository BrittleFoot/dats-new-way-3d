/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['three'],
    // we're never run in production, so lets experience the full power of react
    reactStrictMode: false,
}

export default nextConfig
