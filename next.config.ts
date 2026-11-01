import type { NextConfig } from 'next';
import { backendOrigin } from './src/lib/backend-origin';

const config: NextConfig = {
  output: 'standalone',
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  poweredByHeader: false,
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendOrigin()}/api/v1/:path*`,
      },
    ];
  },
};
export default config;
