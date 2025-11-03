"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { siteConfig } from "@/siteConfig";

import { InviteEmail } from "@workspace/emails/emails/invite";
import { returnValidationErrors } from "next-safe-action";
import { Resend } from "resend";
import { splitFullName, teamMemberFormSchema } from "../types/team-member";

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

export const createTeamMemberAction = actionClient
	.inputSchema(teamMemberFormSchema)
	.action(async ({ parsedInput }) => {
		try {
			// Get current user (inviter)
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) {
				return returnValidationErrors(teamMemberFormSchema, {
					_errors: ["You must be logged in to invite users."],
				});
			}

			const inviterName = session.user.name;
			const inviterEmail = session.user.email;

			// Generate invite URL
			const inviteUrl = `${process.env.NEXT_PUBLIC_VERCEL_URL}`;

			// Split full name into first and last name
			const { first_name, last_name } = splitFullName(parsedInput.name);

			// 1. Create the user first
			const password = generateSecurePassword();
			const fullName = `${first_name} ${last_name}`;

			const newUser = await auth.api
				.createUser({
					body: {
						email: parsedInput.email,
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
						const apiError = createUserError as {
							status: string;
							body?: { message?: string };
						};

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
											searchValue: parsedInput.email,
											searchField: "email",
										},
										headers: await headers(),
									});

									const existingUser = searchResult.users?.find(
										(u) => u.email === parsedInput.email,
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

					throw new Error("CREATE_USER_FAILED");
				});

			// 2. Add record to team_members table
			const supabase = await createClient();

			// Handle different response structures from Better Auth
			const userId = "id" in newUser ? newUser.id : newUser.user.id;

			const { data: teamMember, error: teamMemberError } = await supabase
				.from("team_members")
				.insert({
					email: parsedInput.email,
					first_name,
					last_name,
					job_title: parsedInput.job_title || null,
					timezone: parsedInput.timezone || null,
					internal_notes: parsedInput.internal_notes || null,
					user_id: userId,
				})
				.select()
				.single();

			if (teamMemberError) {
				// Note: User was created successfully, but team member record failed
				return returnValidationErrors(teamMemberFormSchema, {
					_errors: [
						`User created but failed to add to team: ${teamMemberError.message}`,
					],
				});
			}

			// 3. Send invite email after successful user and team member creation
			try {
				const { error } = await resend.emails.send({
					from: `${siteConfig.name} <${siteConfig.email.from}>`,
					to: [parsedInput.email],
					subject: `You've been invited to join ${siteConfig.name}`,
					react: InviteEmail({
						inviteUrl,
						companyName: siteConfig.name,
						inviterName,
						inviterEmail,
					}),
				});

				if (error) {
					return returnValidationErrors(teamMemberFormSchema, {
						_errors: [
							"User created but failed to send invite email. Please try again.",
						],
					});
				}
			} catch (_emailError) {
				return returnValidationErrors(teamMemberFormSchema, {
					_errors: [
						"User created but failed to send invite email. Please try again.",
					],
				});
			}

			// Revalidate paths
			revalidatePath("/dashboard/team-members");
			revalidatePath("/dashboard/team-members/add");

			return {
				success: "Team member invited and added successfully",
				teamMember,
			};
		} catch (error) {
			// Handle specific error types
			if (error instanceof Error) {
				if (error.message === "USER_ALREADY_EXISTS") {
					return returnValidationErrors(teamMemberFormSchema, {
						_errors: ["A user with this email already exists."],
					});
				}
				if (error.message === "CREATE_USER_FAILED") {
					return returnValidationErrors(teamMemberFormSchema, {
						_errors: ["Failed to create user. Please try again."],
					});
				}
			}

			return returnValidationErrors(teamMemberFormSchema, {
				_errors: ["Failed to create team member. Please try again."],
			});
		}
	});
