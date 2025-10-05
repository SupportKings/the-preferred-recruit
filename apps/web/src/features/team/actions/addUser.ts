"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";

import { siteConfig } from "@/siteConfig";

import { InviteEmail } from "@workspace/emails/emails/invite";
import { returnValidationErrors } from "next-safe-action";
import { Resend } from "resend";
import { z } from "zod";

const inputSchema = z.object({
	email: z.string().email("Invalid email address"),
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
});

// Generate a secure random password
function generateSecurePassword(): string {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
	let password = "";
	for (let i = 0; i < 12; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const addUser = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput: { email, first_name, last_name } }) => {
		try {
			// Get current user (inviter)
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) {
				return returnValidationErrors(inputSchema, {
					_errors: ["You must be logged in to invite users."],
				});
			}

			const inviterName = session.user.name;
			const inviterEmail = session.user.email;

			// Generate invite URL
			const inviteUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

			// 1. Create the user first
			const password = generateSecurePassword();
			const fullName = `${first_name} ${last_name}`;

			const newUser = await auth.api
				.createUser({
					body: {
						email,
						password,
						name: fullName,
					},
				})
				.catch(async (createUserError: unknown) => {
					// Check if user already exists - Better Auth throws APIError with status BAD_REQUEST
					if (
						createUserError &&
						typeof createUserError === "object" &&
						"status" in createUserError
					) {
						const apiError = createUserError as { status: string; body?: any };

						// Check if it's a BAD_REQUEST and contains "User already exists" message
						if (apiError.status === "BAD_REQUEST") {
							const errorMessage = apiError.body?.message || "";
							if (
								errorMessage.toLowerCase().includes("user already exists") ||
								errorMessage.toLowerCase().includes("already exists")
							) {
								// User exists - check if they're banned and unban them
								try {
									// Search for user by email
									const searchResult = await auth.api.listUsers({
										query: {
											searchValue: email,
											searchField: "email",
										},
										headers: await headers(),
									});

									const existingUser = searchResult.users?.find(
										(u) => u.email === email,
									);

									if (existingUser) {
										// If user is banned, unban them
										if (existingUser.banned) {
											await auth.api.unbanUser({
												body: {
													userId: existingUser.id,
												},
												headers: await headers(),
											});

											return existingUser;
										}
									}
								} catch (unbanError) {
									console.error("Error checking/unbanning user:", unbanError);
								}

								throw new Error("USER_ALREADY_EXISTS");
							}
						}
					}

					console.error("Error creating user:", createUserError);
					throw new Error("CREATE_USER_FAILED");
				});

			// 2. Add record to team_members table
			const supabase = await createClient();
			
			// Handle different response structures from Better Auth
			const userId = 'id' in newUser ? newUser.id : newUser.user.id;
			
			const { data: teamMember, error: teamMemberError } = await supabase
				.from("team_members")
				.insert({
					email,
					first_name,
					last_name,
					user_id: userId,
				})
				.select()
				.single();

			if (teamMemberError) {
				// Note: User was created successfully, but team member record failed
				return returnValidationErrors(inputSchema, {
					_errors: [
						`User created but failed to add to team: ${teamMemberError.message}`,
					],
				});
			}

			// 3. Send invite email after successful user and team member creation
			try {
				const { error } = await resend.emails.send({
					from: `${siteConfig.name} <${siteConfig.email.from}>`,
					to: [email],
					subject: `You've been invited to join ${siteConfig.name}`,
					react: InviteEmail({
						inviteUrl,
						companyName: siteConfig.name,
						inviterName,
						inviterEmail,
					}),
				});

				if (error) {
					console.error("Error sending invite email:", error);
					// Note: User was created successfully, but email failed
					// You might want to handle this differently (e.g., retry email later)
					return returnValidationErrors(inputSchema, {
						_errors: [
							"User created but failed to send invite email. Please try again.",
						],
					});
				}
			} catch (emailError) {
				console.error("Error sending invite email:", emailError);
				// Note: User was created successfully, but email failed
				return returnValidationErrors(inputSchema, {
					_errors: [
						"User created but failed to send invite email. Please try again.",
					],
				});
			}

			return {
				success: "User invited and added to team successfully",
				user: newUser,
				teamMember,
			};
		} catch (error) {
			console.error("Unexpected error in addUser:", error);

			// Handle specific error types
			if (error instanceof Error) {
				if (error.message === "USER_ALREADY_EXISTS") {
					return returnValidationErrors(inputSchema, {
						_errors: ["A user with this email already exists."],
					});
				}
				if (error.message === "CREATE_USER_FAILED") {
					return returnValidationErrors(inputSchema, {
						_errors: ["Failed to create user. Please try again."],
					});
				}
			}

			return returnValidationErrors(inputSchema, {
				_errors: ["Failed to create user. Please try again."],
			});
		}
	});
