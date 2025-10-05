export const siteConfig = {
	name: "The Preferred Recruit Management Portal",
	logo: {
		// Path to your logo files (relative to public folder)
		light: "/logo.png", // Light mode logo
		dark: "/logo_dark.png", // Dark mode logo
		src: "/logo.png", // Fallback for backward compatibility
	},
	email: {
		// Sender email for notifications and auth emails
		// RESEND_EMAIL_FROM must be set in your .env file
		// For development: use "onboarding@resend.dev"
		// For production: use your verified domain email (e.g., "notifications@yourdomain.com")
		from: process.env.RESEND_EMAIL_FROM!, // Required environment variable
	},
	contact: {
		businessAnalyst: {
			name: "Steven Da Silva",
			email: "steven@opskings.com"
		},
		slackChannel: {
			id: "C05PW0FSW0M",
			name: "recruitment-team"
		}

	}
};

export type siteConfig = typeof siteConfig;
