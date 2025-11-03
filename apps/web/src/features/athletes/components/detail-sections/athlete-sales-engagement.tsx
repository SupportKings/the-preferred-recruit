import { useMemo, useState } from "react";

import { ServerSearchCombobox } from "@/components/server-search-combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UrlActions } from "@/components/url-actions";

import { useTeamMembers } from "@/features/athletes/queries/useAthletes";

import { Edit3, Save, Users, X } from "lucide-react";

interface AthleteSalesEngagementProps {
	athlete: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function AthleteSalesEngagement({
	athlete,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: AthleteSalesEngagementProps) {
	const { data: teamMembers = [] } = useTeamMembers();
	const [salesSetterSearch, setSalesSetterSearch] = useState("");
	const [salesCloserSearch, setSalesCloserSearch] = useState("");

	const [formData, setFormData] = useState({
		lead_source: athlete.lead_source || "",
		sales_setter_id: athlete.sales_setter_id || "",
		sales_closer_id: athlete.sales_closer_id || "",
		last_sales_call_at: athlete.last_sales_call_at || "",
		sales_call_note: athlete.sales_call_note || "",
		sales_call_recording_url: athlete.sales_call_recording_url || "",
	});

	// Get filtered team members for sales setter based on search
	const filteredSalesSetters = useMemo(() => {
		return teamMembers.filter((member: any) => {
			const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
			return fullName.includes(salesSetterSearch.toLowerCase());
		});
	}, [teamMembers, salesSetterSearch]);

	// Get filtered team members for sales closer based on search
	const filteredSalesClosers = useMemo(() => {
		return teamMembers.filter((member: any) => {
			const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
			return fullName.includes(salesCloserSearch.toLowerCase());
		});
	}, [teamMembers, salesCloserSearch]);

	const handleSave = () => {
		// Helper function to ensure date is in YYYY-MM-DD format
		const formatDate = (dateString: string) => {
			if (!dateString) return undefined;
			// If already in YYYY-MM-DD format, return as-is
			if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
			// Otherwise extract just the date part from ISO string
			return dateString.split("T")[0];
		};

		const saveData: any = {
			lead_source: formData.lead_source || undefined,
			sales_setter_id: formData.sales_setter_id || undefined,
			sales_closer_id: formData.sales_closer_id || undefined,
			last_sales_call_at: formatDate(formData.last_sales_call_at),
			sales_call_note: formData.sales_call_note || undefined,
			sales_call_recording_url: formData.sales_call_recording_url || undefined,
		};

		onSave?.(saveData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			lead_source: athlete.lead_source || "",
			sales_setter_id: athlete.sales_setter_id || "",
			sales_closer_id: athlete.sales_closer_id || "",
			last_sales_call_at: athlete.last_sales_call_at || "",
			sales_call_note: athlete.sales_call_note || "",
			sales_call_recording_url: athlete.sales_call_recording_url || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Sales & Engagement
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
					<label className="font-medium text-muted-foreground text-sm">
						Lead Source
					</label>
					{isEditing ? (
						<Input
							value={formData.lead_source}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									lead_source: e.target.value,
								}))
							}
							placeholder="Instagram, Referral, etc."
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{athlete.lead_source || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Sales Setter
					</label>
					{isEditing ? (
						<ServerSearchCombobox
							value={formData.sales_setter_id}
							onValueChange={(value) => {
								setFormData((prev) => ({
									...prev,
									sales_setter_id: value,
								}));
							}}
							searchTerm={salesSetterSearch}
							onSearchChange={setSalesSetterSearch}
							options={filteredSalesSetters.map((member: any) => ({
								value: member.id,
								label: `${member.first_name} ${member.last_name}`,
								subtitle: member.job_title,
							}))}
							placeholder="Select team member..."
							searchPlaceholder="Search team members..."
							emptyText="No team member found."
							className="mt-1"
							showInitialResults
						/>
					) : (
						<p className="text-sm">
							{athlete.sales_setter
								? `${athlete.sales_setter.first_name} ${athlete.sales_setter.last_name}${athlete.sales_setter.job_title ? ` - ${athlete.sales_setter.job_title}` : ""}`
								: "Not assigned"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Sales Closer
					</label>
					{isEditing ? (
						<ServerSearchCombobox
							value={formData.sales_closer_id}
							onValueChange={(value) => {
								setFormData((prev) => ({
									...prev,
									sales_closer_id: value,
								}));
							}}
							searchTerm={salesCloserSearch}
							onSearchChange={setSalesCloserSearch}
							options={filteredSalesClosers.map((member: any) => ({
								value: member.id,
								label: `${member.first_name} ${member.last_name}`,
								subtitle: member.job_title,
							}))}
							placeholder="Select team member..."
							searchPlaceholder="Search team members..."
							emptyText="No team member found."
							className="mt-1"
							showInitialResults
						/>
					) : (
						<p className="text-sm">
							{athlete.sales_closer
								? `${athlete.sales_closer.first_name} ${athlete.sales_closer.last_name}${athlete.sales_closer.job_title ? ` - ${athlete.sales_closer.job_title}` : ""}`
								: "Not assigned"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Last Sales Call
					</label>
					{isEditing ? (
						<DatePicker
							value={formData.last_sales_call_at}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, last_sales_call_at: value }))
							}
							placeholder="Select last sales call date"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{athlete.last_sales_call_at
								? new Date(athlete.last_sales_call_at).toLocaleDateString()
								: "No calls yet"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Sales Call Note
					</label>
					{isEditing ? (
						<Textarea
							value={formData.sales_call_note}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									sales_call_note: e.target.value,
								}))
							}
							placeholder="Notes from the sales call..."
							rows={4}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{athlete.sales_call_note || "No notes"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Sales Call Recording
					</label>
					{isEditing ? (
						<Input
							type="url"
							value={formData.sales_call_recording_url}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									sales_call_recording_url: e.target.value,
								}))
							}
							placeholder="https://..."
							className="mt-1"
						/>
					) : athlete.sales_call_recording_url ? (
						<UrlActions
							url={athlete.sales_call_recording_url}
							className="mt-1"
						/>
					) : (
						<p className="mt-1 text-sm">No recording</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
