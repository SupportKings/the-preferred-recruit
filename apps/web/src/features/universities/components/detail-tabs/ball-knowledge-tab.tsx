"use client";

import { BallKnowledgeSection } from "@/features/ball-knowledge/components/ball-knowledge-section";

interface BallKnowledgeTabProps {
	universityId: string;
}

export function BallKnowledgeTab({ universityId }: BallKnowledgeTabProps) {
	return (
		<BallKnowledgeSection
			entityType="university"
			entityId={universityId}
			defaultAboutUniversityId={universityId}
		/>
	);
}
