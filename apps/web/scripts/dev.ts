import { spawn } from "child_process";

const asciiArt = `
  __  ____  ____  __ _  __  __ _   ___  ____ 
 /  \(  _ \/ ___)(  / )(  )(  ( \ / __)/ ___)
(  O )) __/\___ \ )  (  )( /    /( (_ \\___ \
 \__/(__)  (____/(__\_)(__)\_)__) \___/(____/
`;

// Colors for console output
const colors = {
	cyan: "\x1b[36m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	magenta: "\x1b[35m",
	blue: "\x1b[34m",
	red: "\x1b[31m",
} as const;

// Simple splash screen
function showSplash() {
	console.log(colors.cyan + asciiArt + colors.reset);
	console.log("");
	console.log(
		colors.bright +
			colors.yellow +
			'   "The details are not the details. They make the design."' +
			colors.reset,
	);
	console.log(
		colors.magenta +
			"                                        — Charles Eames" +
			colors.reset,
	);
	console.log("");
	console.log("");
}

// Show splash immediately
showSplash();

// Find available port for Next.js (Web apps use 3000+ range)
async function findAvailablePort(startPort = 3000): Promise<number> {
	const net = require('net');
	
	return new Promise((resolve) => {
		const server = net.createServer();
		
		server.listen(startPort, () => {
			server.close(() => resolve(startPort));
		});
		
		server.on('error', () => {
			// Port busy, try next one
			resolve(findAvailablePort(startPort + 1));
		});
	});
}

// Start Next.js dev server with dynamic port
const webPort = await findAvailablePort();
if (webPort !== 3000) {
	console.log(`${colors.yellow}⚡ Port 3000 was busy, using port ${webPort} instead${colors.reset}`);
}

const nextProcess = spawn("bun", ["run", "next", "dev", `--port=${webPort}`], {
	stdio: "inherit",
	shell: true,
});

nextProcess.on("error", (error) => {
	console.error("Failed to start Next.js dev server:", error);
	process.exit(1);
});

nextProcess.on("close", (code) => {
	process.exit(code ?? 0);
});
