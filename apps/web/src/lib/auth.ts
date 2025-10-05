import { ac, admin, user } from "@/lib/permissions";

import { createClient } from "@/utils/supabase/server";

import { sendOTP } from "@/features/auth/actions/sendOtp";

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import {
	admin as adminPlugin,
	createAuthMiddleware,
	emailOTP,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { Pool } from "pg";

export const auth = betterAuth({
	database: new Pool({
		connectionString: process.env.BETTER_AUTH_DATABASE_URL,
	}),
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // Cache duration in seconds
		},
	},
	//needs for consistent ip tracking for sessions
	trustedOrigins: [
		"http://localhost:3000",
		"http://localhost:3001",
		process.env.NEXT_PUBLIC_APP_URL,
		process.env.NEXT_PUBLIC_VERCEL_URL,
	].filter(Boolean) as string[],

	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
	},
	plugins: [
		passkey(),

		adminPlugin({
			ac,
			roles: {
				admin,
				user,
			},
		}),
		// Email OTP Plugin
		emailOTP({
			disableSignUp: true,
			async sendVerificationOTP({ email, otp, type }) {
				switch (type) {
					case "sign-in":
						await sendOTP({ email, otp, type });
						break;
					case "email-verification":
						/* 						await sendOTP({ email, otp, type });
						 */ break;
					default:
					/* 						await sendOTP({ email, otp, type });
					 */
				}
			},
		}),
		nextCookies(), // nextcookies has to be the last plugin in the array
	],
});
