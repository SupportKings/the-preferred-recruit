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
					is_deleted,
					campaign:campaigns(id, name, type, status),
					university_job:university_jobs(
						id,
						job_title,
						work_email,
						program_scope,
						coach:coaches(id, full_name, email),
						university:universities(id, name, city, state),
						program:programs(id, gender)
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
					internal_notes,
					campaign:campaigns(id, name, type, status),
					generated_by_user:team_members!generated_by(id, first_name, last_name, email)
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

		// Filter out soft-deleted campaign leads
		if (campaign?.campaign_leads) {
			campaign.campaign_leads = campaign.campaign_leads.filter(
				(lead: any) => !lead.is_deleted,
			);
		}

		// Separately fetch seed campaign if it exists
		let seedCampaign = null;
		if (campaign.seed_campaign_id) {
			const { data: seedData } = await (supabase as any)
				.from("campaigns")
				.select("id, name, type, status")
				.eq("id", campaign.seed_campaign_id)
				.eq("is_deleted", false)
				.single();
			seedCampaign = seedData;
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

		// Add seed campaign and derived campaigns to the campaign object
		return {
			...campaign,
			seed_campaign: seedCampaign,
			derived_campaigns: derivedCampaigns || [],
		};
	} catch (error) {
		console.error("Unexpected error in getCampaign:", error);
		return null;
	}
}
