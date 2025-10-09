import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface AthleteRepliesSectionProps {
	athleteId: string;
	replies: any[];
}

export function AthleteRepliesSection({
	athleteId,
	replies,
}: AthleteRepliesSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MessageCircle className="h-5 w-5" />
					Replies
				</CardTitle>
			</CardHeader>
			<CardContent>
				{replies.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<p className="text-sm">No replies yet</p>
					</div>
				) : (
					<div className="space-y-2">
						{replies.map((reply) => (
							<div key={reply.id} className="rounded border p-3">
								<p className="font-medium text-sm">
									{reply.type || "Unknown Type"} Reply
								</p>
								<p className="text-muted-foreground text-xs">
									{reply.summary || "No summary"}
								</p>
								<p className="text-muted-foreground text-xs">
									{reply.occurred_at
										? new Date(reply.occurred_at).toLocaleString()
										: "No date"}
								</p>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
