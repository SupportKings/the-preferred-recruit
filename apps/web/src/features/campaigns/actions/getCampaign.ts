"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCampaign(id: string) {
	try {
		const supabase = await createClient();

		// Fetch the main campaign with all relations except derived campaigns
		const { data: campaign, error } = await (supabase as any)
			.from("campaigns")
			.select(
				`
				*,
				athlete:athletes!campaigns_athlete_id_fkey(id, full_name, graduation_year, contact_email),
				primary_lead_list:school_lead_lists!campaigns_primary_lead_list_id_fkey(id, name, priority, season_label),
				seed_campaign:campaigns!campaigns_seed_campaign_id_fkey(id, name, type, status),
				campaign_leads(
					id,
					campaign_id,
					university_job_id,
					source_lead_list_id,
					include_reason,
					status,
					first_reply_at,
					application_id,
					included_at,
					internal_notes,
					university_job:university_jobs(
						id,
						job_title,
						work_email,
						program_scope,
						coach:coaches(id, full_name, email),
						university:universities(id, name, city, state)
					),
					source_lead_list:school_lead_lists(id, name, priority),
					application:athlete_applications(id, stage, last_interaction_at, scholarship_percent)
				),
				sending_tool_lead_lists(
					id,
					campaign_id,
					format,
					row_count,
					file_url,
					generated_by,
					generated_at,
					internal_notes
				),
				replies(
					id,
					campaign_id,
					type,
					occurred_at,
					summary,
					university_job_id,
					application_id,
					athlete_id,
					internal_notes,
					university_job:university_jobs(
						id,
						job_title,
						work_email,
						coach:coaches(id, full_name, email)
					),
					application:athlete_applications(id, stage, last_interaction_at),
					athlete:athletes(id, full_name, contact_email)
				)
			`,
			)
			.eq("id", id)
			.eq("is_deleted", false)
			.single();

		if (error) {
			console.error("Error fetching campaign:", error);
			return null;
		}

		// Separately fetch derived campaigns (campaigns that have this campaign as their seed)
		const { data: derivedCampaigns } = await (supabase as any)
			.from("campaigns")
			.select(
				`
				id,
				name,
				type,
				status,
				start_date,
				end_date,
				primary_lead_list_id,
				primary_lead_list:school_lead_lists(id, name, priority)
			`,
			)
			.eq("seed_campaign_id", id)
			.eq("is_deleted", false);

		// Add derived campaigns to the campaign object
		return {
			...campaign,
			derived_campaigns: derivedCampaigns || [],
		};
	} catch (error) {
		console.error("Unexpected error in getCampaign:", error);
		return null;
	}
}
