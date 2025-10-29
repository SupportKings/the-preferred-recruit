import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { FileText } from "lucide-react";
import { createApplicationColumns } from "../table-columns/application-columns";

interface LeadListApplicationsSectionProps {
	applications: any[];
}

export function LeadListApplicationsSection({
	applications,
}: LeadListApplicationsSectionProps) {
	const applicationColumns = createApplicationColumns();

	const applicationTable = useReactTable({
		data: applications || [],
		columns: applicationColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!applications || applications.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Applications (Originated From This List)
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center text-muted-foreground">
						<FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No applications yet</p>
						<p className="mt-1 text-xs">
							Applications originated from this list will appear here
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
					<FileText className="h-5 w-5" />
					Applications (Originated From This List)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={applicationTable}
					emptyStateMessage="No applications found for this lead list"
				/>
			</CardContent>
		</Card>
	);
}
