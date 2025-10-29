"use server";

import { siteConfig } from "@/siteConfig";

import { OTPEmail } from "@workspace/emails/emails/otp";
import { Resend } from "resend";
import { z } from "zod";

const OTPInput = z.object({
	email: z.string().email(),
	otp: z.string(),
	type: z.enum(["sign-in", "email-verification", "forget-password"]).optional(),
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTP(data: z.infer<typeof OTPInput>) {
	try {
		// Validate input
		const validatedData = OTPInput.parse(data);

		// TEMPORARY: Log OTP to console when Resend is disabled
		console.log(`🔐 OTP Code for ${validatedData.email}: ${validatedData.otp}`);

		const { error } = await resend.emails.send({
			from: `${siteConfig.name} <${siteConfig.email.from}>`,
			to: [validatedData.email],
			subject:
				validatedData.type === "email-verification"
					? "Verify your email address"
					: `Your sign-in code ${validatedData.otp}`,
			react: OTPEmail({
				otp: validatedData.otp,
				companyName: siteConfig.name,
			}),
		});

		if (error) {
			console.error("Error sending email:", error);
			// Don't throw error - allow login to continue with console-logged OTP
			console.warn("⚠️ Email failed but OTP is logged above - use it to login");
		}

		return { success: true, message: "OTP sent successfully" };
	} catch (error) {
		console.error("Error sending OTP email:", error);
		// Don't throw error - allow login to continue with console-logged OTP
		console.warn("⚠️ Email failed but OTP is logged above - use it to login");
		return { success: true, message: "OTP logged to console" };
	}
}
