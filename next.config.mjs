/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "pub-6163bfa012dd4bb59df6fe3c087d1bd0.r2.dev",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/((?!maintenance|_next|favicon|icons|images|manifest).*)",
        destination: "/maintenance",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    // Proxy Firebase Auth's /__/auth/* routes through our own domain.
    return [
      {
        source: "/__/auth/:path*",
        destination: `https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}/__/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
