import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*",
				port: "",
				pathname: "/**",
			},
		],
	},
	experimental: {
		optimizePackageImports: ["lucide-react", "framer-motion"],
		useCache: true,
	},
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
				],
			},
			{
				source: "/((?!api/).*)",
				headers: [
					{
						key: "Strict-Transport-Security",
						value: "max-age=31536000; includeSubDomains; preload",
					},
				],
			},
		];
	},
};

export default nextConfig;
