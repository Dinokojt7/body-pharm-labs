/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Proxy Firebase Auth's /__/auth/* routes through our own domain.
    // This lets signInWithRedirect work without adding every deployment URL
    // to the Google Cloud Console Authorized Redirect URIs — only your
    // primary domain (or Vercel deployment URL) needs to be listed.
    return [
      {
        source: "/__/auth/:path*",
        destination: `https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}/__/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
