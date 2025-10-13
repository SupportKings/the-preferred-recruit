import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ListTree } from "lucide-react";

import { ManageEntryModal } from "../manage-entry-modal";

interface NoEntriesProps {
	leadListId: string;
}

export function NoEntries({ leadListId }: NoEntriesProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<ListTree className="h-5 w-5" />
						Entries (Universities/Programs)
					</CardTitle>
					<ManageEntryModal leadListId={leadListId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<ListTree className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No entries yet</p>
					<p className="mt-1 text-xs">
						Universities and programs will appear here once added to this lead
						list
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
