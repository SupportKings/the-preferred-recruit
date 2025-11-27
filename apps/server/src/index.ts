import "dotenv/config";

import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: process.env.CORS_ORIGIN || "",
		allowMethods: ["GET", "POST", "OPTIONS"],
	}),
);

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.get("/", (c) => {
	return c.text("OK");
});

// Port detection for server with better error handling
async function findAvailablePort(startPort = 3000): Promise<number> {
	const net = require("net");

	return new Promise((resolve) => {
		const server = net.createServer();

		server.listen(startPort, () => {
			server.close(() => {
				console.log(`✅ Port ${startPort} is available for server`);
				resolve(startPort);
			});
		});

		server.on("error", (err: any) => {
			console.log(`❌ Port ${startPort} is busy, trying next...`);
			// Add small delay to avoid race conditions
			setTimeout(() => {
				resolve(findAvailablePort(startPort + 1));
			}, 100);
		});

		// Timeout fallback
		setTimeout(() => {
			server.destroy();
			resolve(findAvailablePort(startPort + 1));
		}, 2000);
	});
}

// Start server with retry logic (Servers use 4000+ range to avoid web app conflicts)
async function startServerWithRetry(
	startPort = 4000,
	maxRetries = 10,
): Promise<void> {
	for (let port = startPort; port < startPort + maxRetries; port++) {
		try {
			console.log(`🔍 Trying to start server on port ${port}...`);

			const server = Bun.serve({
				port: port,
				fetch: app.fetch,
			});

			if (port !== 4000) {
				console.log(`⚡ Server port 4000 was busy, using port ${port} instead`);
			}
			console.log(`🚀 Server successfully started on http://localhost:${port}`);
			return; // Success!
		} catch (error: any) {
			if (error.code === "EADDRINUSE") {
				console.log(`❌ Port ${port} is busy, trying next...`);
			} else {
				throw error; // Other error, rethrow
			}
		}
	}
	throw new Error(
		`Failed to start server after trying ports ${startPort}-${startPort + maxRetries - 1}`,
	);
}

if (import.meta.main) {
	console.log("🔍 Starting server with automatic port detection...");
	startServerWithRetry();
}

// Export as named export to avoid Bun auto-serving
export { app };
