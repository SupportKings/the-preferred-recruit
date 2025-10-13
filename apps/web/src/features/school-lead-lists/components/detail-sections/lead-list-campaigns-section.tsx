"use client";

import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Megaphone } from "lucide-react";
import { ManageCampaignModal } from "../modals/manage-campaign-modal";
import { createCampaignColumns } from "../table-columns/campaign-columns";

interface LeadListCampaignsSectionProps {
	campaigns: any[];
	leadListId: string;
	athleteId?: string;
}

export function LeadListCampaignsSection({
	campaigns,
	leadListId,
	athleteId,
}: LeadListCampaignsSectionProps) {
	const router = useRouter();
	const campaignColumns = createCampaignColumns();

	const handleSuccess = () => {
		router.refresh();
	};

	const campaignTable = useReactTable({
		data: campaigns || [],
		columns: campaignColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!campaigns || campaigns.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Megaphone className="h-5 w-5" />
							Campaigns (Using This List)
						</div>
						<ManageCampaignModal
							leadListId={leadListId}
							athleteId={athleteId}
							onSuccess={handleSuccess}
						/>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center text-muted-foreground">
						<Megaphone className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No campaigns yet</p>
						<p className="mt-1 text-xs">
							Campaigns using this list will appear here
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Megaphone className="h-5 w-5" />
						Campaigns (Using This List)
					</div>
					<ManageCampaignModal
						leadListId={leadListId}
						athleteId={athleteId}
						onSuccess={handleSuccess}
					/>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={campaignTable}
					emptyStateMessage="No campaigns found for this lead list"
				/>
			</CardContent>
		</Card>
	);
}
