import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Edit3, Save, Trophy, X } from "lucide-react";
import { ConferenceLookup } from "../lookups/conference-lookup";
import { DivisionLookup } from "../lookups/division-lookup";

interface UniversityAthleticsSectionProps {
	currentConferenceId?: string | null;
	currentConferenceName?: string | null;
	currentDivisionId?: string | null;
	currentDivisionName?: string | null;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: {
		conferenceId?: string | null;
		divisionId?: string | null;
	}) => void;
	onCancel?: () => void;
}

export function UniversityAthleticsSection({
	currentConferenceId,
	currentConferenceName,
	currentDivisionId,
	currentDivisionName,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: UniversityAthleticsSectionProps) {
	const [formData, setFormData] = useState({
		conferenceId: currentConferenceId || "",
		divisionId: currentDivisionId || "",
	});

	const handleSave = () => {
		onSave?.({
			conferenceId: formData.conferenceId || null,
			divisionId: formData.divisionId || null,
		});
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			conferenceId: currentConferenceId || "",
			divisionId: currentDivisionId || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Trophy className="h-5 w-5" />
						Athletics
					</div>
					{!isEditing ? (
						<Button
							variant="ghost"
							size="sm"
							onClick={onEditToggle}
							className="h-8 w-8 p-0"
						>
							<Edit3 className="h-4 w-4" />
						</Button>
					) : (
						<div className="flex gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleSave}
								className="h-8 w-8 p-0"
							>
								<Save className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleCancel}
								className="h-8 w-8 p-0"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<p className="font-medium text-muted-foreground text-sm">
						Conference
					</p>
					{isEditing ? (
						<div className="mt-1">
							<ConferenceLookup
								value={formData.conferenceId}
								onChange={(value) =>
									setFormData((prev) => ({ ...prev, conferenceId: value }))
								}
								label=""
							/>
						</div>
					) : (
						<p className="text-sm">{currentConferenceName || "Not assigned"}</p>
					)}
				</div>
				<div>
					<p className="font-medium text-muted-foreground text-sm">Division</p>
					{isEditing ? (
						<div className="mt-1">
							<DivisionLookup
								value={formData.divisionId}
								onChange={(value) =>
									setFormData((prev) => ({ ...prev, divisionId: value }))
								}
								label=""
							/>
						</div>
					) : (
						<p className="text-sm">{currentDivisionName || "Not assigned"}</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
