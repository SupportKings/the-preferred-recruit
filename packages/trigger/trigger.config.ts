import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
	project: "proj_fwlmfzysfaxqxfycqxrd",
	runtime: "node",
	logLevel: "info",
	maxDuration: 3600, // 60 minutes (3600 seconds)
	retries: {
		enabledInDev: true,
		default: {
			maxAttempts: 3,
			minTimeoutInMs: 1000,
			maxTimeoutInMs: 10000,
			factor: 2,
		},
	},
	dirs: ["./src/tasks"],
});
