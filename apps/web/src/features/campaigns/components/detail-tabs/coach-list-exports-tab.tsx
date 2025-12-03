"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { useQueryClient } from "@tanstack/react-query";
import {
	Download,
	FileSpreadsheet,
	Loader2,
	PlusIcon,
	XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { exportCoachListAction } from "../../actions/exportCoachList";
import { campaignQueries } from "../../queries/useCampaigns";
import type { CampaignCoachData } from "../../types/coach-export-types";
import { SelectCoachesForExportModal } from "../modals/select-coaches-for-export-modal";

interface CoachListExportsTabProps {
	campaignId: string;
	selectedCoaches: CampaignCoachData[];
	setSelectedCoaches: Dispatch<SetStateAction<CampaignCoachData[]>>;
}

export function CoachListExportsTab({
	campaignId,
	selectedCoaches,
	setSelectedCoaches,
}: CoachListExportsTabProps) {
	const queryClient = useQueryClient();
	const [isExporting, setIsExporting] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);

	const handleConfirmSelection = (coaches: CampaignCoachData[]) => {
		setSelectedCoaches(coaches);
		toast.success(`Added ${coaches.length} coaches to selection`);
	};

	const handleRemoveCoach = (coachId: string) => {
		setSelectedCoaches((prev) => prev.filter((c) => c.coachId !== coachId));
	};

	const handleClearAll = () => {
		setSelectedCoaches([]);
		toast.success("Selection cleared");
	};

	const handleExport = async () => {
		if (selectedCoaches.length === 0) {
			toast.error("Please select at least one coach to export");
			return;
		}

		try {
			setIsExporting(true);

			// Extract coach IDs from selected coaches
			const coachIds = selectedCoaches.map((coach) => coach.coachId);

			// Call the export action with coach IDs
			const result = await exportCoachListAction({
				campaignId,
				coachIds,
			});

			if (result?.validationErrors) {
				toast.error("Validation error");
				return;
			}

			if (result?.serverError) {
				toast.error(result.serverError);
				return;
			}

			const exportData = result?.data?.data;
			if (exportData?.csvContent) {
				// Create blob and download
				const blob = new Blob([exportData.csvContent], { type: "text/csv" });
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = exportData.fileName;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);

				// Invalidate campaign query to refresh sending tool files
				await queryClient.invalidateQueries({
					queryKey: campaignQueries.detail(campaignId),
				});

				toast.success(
					`Exported ${exportData.rowCount} coaches and saved to Sending Tool Files`,
				);
			} else {
				toast.error("Failed to export coaches");
			}
		} catch (error) {
			console.error("Error exporting coaches:", error);
			toast.error("Failed to export coaches");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<FileSpreadsheet className="h-5 w-5" />
						Coach List Exports
					</CardTitle>
					<Button onClick={() => setModalOpen(true)}>
						<PlusIcon className="mr-2 h-4 w-4" />
						Add Coaches
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Selected Coaches Section */}
				{selectedCoaches.length === 0 ? (
					<div className="py-12 text-center">
						<FileSpreadsheet className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
						<p className="text-muted-foreground text-sm">
							No coaches selected for export
						</p>
						<p className="mt-1 mb-4 text-muted-foreground text-xs">
							Click "Add Coaches" to select coaches from this campaign
						</p>
						<Button onClick={() => setModalOpen(true)} variant="outline">
							<PlusIcon className="mr-2 h-4 w-4" />
							Add Coaches
						</Button>
					</div>
				) : (
					<>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<h3 className="font-medium text-sm">Selected Coaches</h3>
									<Badge variant="secondary">{selectedCoaches.length}</Badge>
								</div>
								<Button
									size="sm"
									variant="ghost"
									onClick={handleClearAll}
									className="text-muted-foreground hover:text-destructive"
								>
									Clear All
								</Button>
							</div>

							<div className="h-[300px] overflow-hidden rounded-md border">
								<ScrollArea className="h-full">
									<div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-2 lg:grid-cols-3">
										{selectedCoaches.map((coach) => (
											<div
												key={coach.coachId}
												className="group flex items-center justify-between rounded-md border bg-card px-3 py-2 transition-colors hover:bg-muted/50"
											>
												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-1.5">
														<p className="truncate font-medium text-sm">
															{coach.coachName}
														</p>
														{coach.division && (
															<Badge
																variant="outline"
																className="shrink-0 px-1 py-0 text-[10px]"
															>
																{coach.division.replace("Division ", "D")}
															</Badge>
														)}
													</div>
													<p className="truncate text-muted-foreground text-xs">
														{coach.universityName}
													</p>
												</div>
												<Button
													size="sm"
													variant="ghost"
													onClick={() => handleRemoveCoach(coach.coachId)}
													className="ml-1 h-6 w-6 shrink-0 p-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
												>
													<XIcon className="h-3 w-3" />
												</Button>
											</div>
										))}
									</div>
								</ScrollArea>
							</div>
						</div>

						<Separator />

						{/* Export Button */}
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<div className="text-muted-foreground text-sm">
									Export {selectedCoaches.length} selected{" "}
									{selectedCoaches.length === 1 ? "coach" : "coaches"} to CSV
								</div>
								<p className="text-muted-foreground text-xs">
									File will be saved to Sending Tool Files
								</p>
							</div>
							<Button
								onClick={handleExport}
								disabled={isExporting || selectedCoaches.length === 0}
							>
								{isExporting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Exporting...
									</>
								) : (
									<>
										<Download className="mr-2 h-4 w-4" />
										Export & Save to Files
									</>
								)}
							</Button>
						</div>
					</>
				)}
			</CardContent>

			{/* Selection Modal */}
			<SelectCoachesForExportModal
				campaignId={campaignId}
				open={modalOpen}
				onOpenChange={setModalOpen}
				onConfirm={handleConfirmSelection}
				initialSelectedCoaches={selectedCoaches}
			/>
		</Card>
	);
}
