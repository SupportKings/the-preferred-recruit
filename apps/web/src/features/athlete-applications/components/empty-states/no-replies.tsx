import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { ManageReplyModal } from "../manage-reply-modal";

interface NoRepliesProps {
	applicationId: string;
	campaigns?: Array<{ id: string; name: string; type: string }>;
	coaches?: Array<{
		id: string;
		full_name: string;
		university_jobs: Array<{ id: string; job_title: string }>;
	}>;
}

export function NoReplies({
	applicationId,
	campaigns,
	coaches,
}: NoRepliesProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						Replies
					</CardTitle>
					<ManageReplyModal
						applicationId={applicationId}
						mode="add"
						campaigns={campaigns}
						coaches={coaches}
					/>
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No replies yet</p>
					<p className="mt-1 text-xs">
						Replies will appear here once logged for this application
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
