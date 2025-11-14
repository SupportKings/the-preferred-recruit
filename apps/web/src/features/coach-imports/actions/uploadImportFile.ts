"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@/utils/supabase/serviceRole";

import { getUser } from "@/queries/getUser";

import { zfd } from "zod-form-data";

const inputSchema = zfd.formData({
	file: zfd.file(),
});

export const uploadImportFileAction = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			// Authentication check
			const session = await getUser();
			if (!session?.user) {
				return {
					success: false,
					error: "You must be logged in to upload files",
				};
			}

			const supabase = await createClient();

			// Get team member ID for the current user
			const { data: teamMember } = await supabase
				.from("team_members")
				.select("id")
				.eq("user_id", session.user.id)
				.eq("is_deleted", false)
				.maybeSingle();

			if (!teamMember) {
				return {
					success: false,
					error: "Team member not found",
				};
			}

			const file = parsedInput.file;
			const originalFilename = file.name;
			const fileSize = file.size;

			// Validate file type
			const allowedExtensions = [".xlsx", ".xls", ".csv"];
			const fileExtension = originalFilename
				.substring(originalFilename.lastIndexOf("."))
				.toLowerCase();

			if (!allowedExtensions.includes(fileExtension)) {
				return {
					success: false,
					error: `Invalid file type. Only ${allowedExtensions.join(", ")} files are allowed.`,
				};
			}

			// Validate file size (50MB limit)
			const maxSize = 50 * 1024 * 1024; // 50MB in bytes
			if (fileSize > maxSize) {
				return {
					success: false,
					error: "File size exceeds 50MB limit",
				};
			}

			const serviceClient = await createServiceClient();

			// Generate unique storage path
			const timestamp = Date.now();
			const sanitizedName = originalFilename.replace(/[^a-zA-Z0-9.-]/g, "_");
			const storagePath = `${teamMember.id}/${timestamp}-${sanitizedName}`;

			// Upload to Supabase storage
			const { data: uploadData, error: uploadError } =
				await serviceClient.storage
					.from("coach-imports")
					.upload(storagePath, file, {
						cacheControl: "3600",
						upsert: false,
					});

			if (uploadError) {
				console.error("Upload error:", uploadError);
				return {
					success: false,
					error: `Failed to upload file: ${uploadError.message}`,
				};
			}

			// Get signed URL for Trigger.dev access (24 hour expiry)
			const { data: urlData, error: urlError } =
				await serviceClient.storage
					.from("coach-imports")
					.createSignedUrl(storagePath, 86400); // 24 hours

			if (urlError || !urlData.signedUrl) {
				console.error("URL generation error:", urlError);
				return {
					success: false,
					error: "Failed to generate file URL",
				};
			}

			// Create import job record
			const { data: jobData, error: jobError } = await supabase
				.from("coach_import_jobs")
				.insert({
					uploaded_by: teamMember.id,
					file_url: urlData.signedUrl,
					original_filename: originalFilename,
					file_size_bytes: fileSize,
					status: "pending",
				})
				.select()
				.single();

			if (jobError) {
				console.error("Error creating import job:", jobError);
				return {
					success: false,
					error: `Failed to create import job: ${jobError.message}`,
				};
			}

			// Revalidate paths
			revalidatePath("/dashboard/coach-imports");

			return {
				success: true,
				data: {
					jobId: jobData.id,
					fileUrl: urlData.signedUrl,
					filename: originalFilename,
				},
			};
		} catch (error) {
			console.error("Unexpected error in uploadImportFileAction:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			};
		}
	});
