"use client";

import type { Tables } from "@/utils/supabase/database.types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Lightbulb } from "lucide-react";

type BallKnowledge = Tables<"ball_knowledge"> & {
	coaches: {
		id: string;
		full_name: string | null;
		primary_specialty: string | null;
	} | null;
	programs: {
		id: string;
		gender: string | null;
	} | null;
	athletes: {
		id: string;
		full_name: string | null;
	} | null;
};

interface BallKnowledgeTabProps {
	knowledge: BallKnowledge[];
	universityId: string;
	onRefresh: () => void;
}

export function BallKnowledgeTab({ knowledge }: BallKnowledgeTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Lightbulb className="h-5 w-5" />
					Intel & Knowledge
				</CardTitle>
			</CardHeader>
			<CardContent>
				{knowledge.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Lightbulb className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No intel yet</p>
						<p className="mt-1 text-xs">
							Intel and notes about this university will appear here
						</p>
					</div>
				) : (
					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[300px]">Note</TableHead>
									<TableHead>Source Type</TableHead>
									<TableHead>About Coach</TableHead>
									<TableHead>About Program</TableHead>
									<TableHead>From Athlete</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{knowledge.map((item) => (
									<TableRow key={item.id}>
										<TableCell className="font-medium">
											<div className="line-clamp-2">{item.note || "-"}</div>
										</TableCell>
										<TableCell className="capitalize">
											{item.source_type || "-"}
										</TableCell>
										<TableCell>
											<div className="text-sm">
												<div>{item.coaches?.full_name || "-"}</div>
												{item.coaches?.primary_specialty && (
													<div className="text-muted-foreground text-xs capitalize">
														{item.coaches.primary_specialty}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell className="capitalize">
											{item.programs?.gender || "-"}
										</TableCell>
										<TableCell>{item.athletes?.full_name || "-"}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
