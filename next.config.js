/** @type {import('next').NextConfig} */
const repoName = 'attractor-lab';
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProd ? `/${repoName}` : '',
  images: { unoptimized: true },
  reactStrictMode: true,
};

module.exports = nextConfig;
