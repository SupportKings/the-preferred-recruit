import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Target } from "lucide-react";
import { createCampaignLeadColumns } from "../table-columns/campaign-lead-columns";

interface LeadListCampaignLeadsSectionProps {
	campaignLeads: any[];
}

export function LeadListCampaignLeadsSection({
	campaignLeads,
}: LeadListCampaignLeadsSectionProps) {
	const campaignLeadColumns = createCampaignLeadColumns();

	const campaignLeadTable = useReactTable({
		data: campaignLeads || [],
		columns: campaignLeadColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!campaignLeads || campaignLeads.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Campaign Leads (Sourced From This List)
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center text-muted-foreground">
						<Target className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No campaign leads yet</p>
						<p className="mt-1 text-xs">
							Campaign leads sourced from this list will appear here
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Target className="h-5 w-5" />
					Campaign Leads (Sourced From This List)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={campaignLeadTable}
					emptyStateMessage="No campaign leads found for this lead list"
				/>
			</CardContent>
		</Card>
	);
}
