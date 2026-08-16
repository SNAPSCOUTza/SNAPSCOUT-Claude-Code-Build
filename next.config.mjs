const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    // Custom loader points at R2 (free egress) instead of Vercel's paid
    // image-optimization pipeline. `unoptimized` must stay off, since it
    // takes precedence over `loader` and would skip it entirely.
    loader: 'custom',
    loaderFile: './lib/r2-image-loader.ts',
  },
}

export default nextConfig
