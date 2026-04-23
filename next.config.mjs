/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "(?<subdomain>.+).portalkit.app"
            }
          ],
          destination: "/:path*"
        }
      ]
    };
  }
};

export default nextConfig;
