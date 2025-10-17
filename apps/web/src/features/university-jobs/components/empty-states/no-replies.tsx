import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { MessageSquare } from "lucide-react";

import { ManageReplyModal } from "../manage-reply-modal";

interface NoRepliesProps {
	universityJobId: string;
}

export function NoReplies({ universityJobId }: NoRepliesProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						Replies
					</CardTitle>
					<ManageReplyModal universityJobId={universityJobId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No replies yet</p>
					<p className="mt-1 text-xs">
						Replies will appear here once added to this position
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
