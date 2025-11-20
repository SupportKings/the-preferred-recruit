"use client";

import { AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface ErrorLog {
	row: number;
	error: string;
	uniqueId?: string;
	coachName?: string;
	school?: string;
}

interface ErrorLogsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	errors: ErrorLog[];
	filename: string;
}

export function ErrorLogsDialog({
	open,
	onOpenChange,
	errors,
	filename,
}: ErrorLogsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-destructive" />
						Import Errors
					</DialogTitle>
					<DialogDescription>
						{errors.length} error{errors.length !== 1 ? "s" : ""} occurred while
						importing {filename}
					</DialogDescription>
				</DialogHeader>

				<div className="max-h-[60vh] overflow-auto">
					{errors.length === 0 ? (
						<div className="py-8 text-center text-muted-foreground">
							No errors found
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Unique ID</TableHead>
									<TableHead>Coach</TableHead>
									<TableHead>School</TableHead>
									<TableHead>Error</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{errors.map((error, index) => (
									<TableRow key={index}>
										<TableCell className="font-mono text-sm">
											{error.uniqueId || (
												<span className="text-muted-foreground">-</span>
											)}
										</TableCell>
										<TableCell>
											{error.coachName || (
												<span className="text-muted-foreground">Unknown</span>
											)}
										</TableCell>
										<TableCell className="text-sm">
											{error.school || (
												<span className="text-muted-foreground">-</span>
											)}
										</TableCell>
										<TableCell>
											<div className="max-w-md">
												<Badge variant="destructive" className="mb-1">
													Row {error.row}
												</Badge>
												<p className="text-sm text-muted-foreground">
													{error.error}
												</p>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
