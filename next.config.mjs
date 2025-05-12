/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placeholder.com'],
    unoptimized: true,
  },
  experimental: {
    mdxRs: false, // Alterando para false para evitar problemas com o módulo astring
  },
  async rewrites() {
    return [
      {
        source: '/categoria/:category',
        destination: '/categoria/:category/page',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/calculadoras',
        destination: '/',
        permanent: true,
      },
    ];
  },
  // Configuração do Sentry removida para evitar avisos
};

export default nextConfig;
