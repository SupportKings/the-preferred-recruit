import { useState } from "react";

import type { Tables } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import { BookOpen, Edit3, Save, X } from "lucide-react";

interface UniversityAcademicsSectionProps {
	university: Tables<"universities">;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: Record<string, unknown>) => void;
	onCancel?: () => void;
}

export function UniversityAcademicsSection({
	university,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: UniversityAcademicsSectionProps) {
	const [formData, setFormData] = useState({
		average_gpa: university.average_gpa?.toString() || "",
		sat_ebrw_25th: university.sat_ebrw_25th?.toString() || "",
		sat_ebrw_75th: university.sat_ebrw_75th?.toString() || "",
		sat_math_25th: university.sat_math_25th?.toString() || "",
		sat_math_75th: university.sat_math_75th?.toString() || "",
		act_composite_25th: university.act_composite_25th?.toString() || "",
		act_composite_75th: university.act_composite_75th?.toString() || "",
		acceptance_rate_pct: university.acceptance_rate_pct?.toString() || "",
		undergraduate_enrollment:
			university.undergraduate_enrollment?.toString() || "",
		total_yearly_cost: university.total_yearly_cost?.toString() || "",
		majors_offered_url: university.majors_offered_url || "",
		us_news_ranking_national_2018:
			university.us_news_ranking_national_2018?.toString() || "",
		us_news_ranking_liberal_arts_2018:
			university.us_news_ranking_liberal_arts_2018?.toString() || "",
		email_blocked: university.email_blocked || false,
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			average_gpa: university.average_gpa?.toString() || "",
			sat_ebrw_25th: university.sat_ebrw_25th?.toString() || "",
			sat_ebrw_75th: university.sat_ebrw_75th?.toString() || "",
			sat_math_25th: university.sat_math_25th?.toString() || "",
			sat_math_75th: university.sat_math_75th?.toString() || "",
			act_composite_25th: university.act_composite_25th?.toString() || "",
			act_composite_75th: university.act_composite_75th?.toString() || "",
			acceptance_rate_pct: university.acceptance_rate_pct?.toString() || "",
			undergraduate_enrollment:
				university.undergraduate_enrollment?.toString() || "",
			total_yearly_cost: university.total_yearly_cost?.toString() || "",
			majors_offered_url: university.majors_offered_url || "",
			us_news_ranking_national_2018:
				university.us_news_ranking_national_2018?.toString() || "",
			us_news_ranking_liberal_arts_2018:
				university.us_news_ranking_liberal_arts_2018?.toString() || "",
			email_blocked: university.email_blocked || false,
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<BookOpen className="h-5 w-5" />
						Academics & Admissions
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
						Average GPA
					</label>
					{isEditing ? (
						<Input
							type="number"
							step="0.01"
							value={formData.average_gpa}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									average_gpa: e.target.value,
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{university.average_gpa || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						SAT EBRW (25th-75th)
					</label>
					{isEditing ? (
						<div className="mt-1 flex gap-2">
							<Input
								type="number"
								placeholder="25th %"
								value={formData.sat_ebrw_25th}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										sat_ebrw_25th: e.target.value,
									}))
								}
							/>
							<Input
								type="number"
								placeholder="75th %"
								value={formData.sat_ebrw_75th}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										sat_ebrw_75th: e.target.value,
									}))
								}
							/>
						</div>
					) : (
						<p className="text-sm">
							{university.sat_ebrw_25th && university.sat_ebrw_75th
								? `${university.sat_ebrw_25th} - ${university.sat_ebrw_75th}`
								: "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						SAT Math (25th-75th)
					</label>
					{isEditing ? (
						<div className="mt-1 flex gap-2">
							<Input
								type="number"
								placeholder="25th %"
								value={formData.sat_math_25th}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										sat_math_25th: e.target.value,
									}))
								}
							/>
							<Input
								type="number"
								placeholder="75th %"
								value={formData.sat_math_75th}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										sat_math_75th: e.target.value,
									}))
								}
							/>
						</div>
					) : (
						<p className="text-sm">
							{university.sat_math_25th && university.sat_math_75th
								? `${university.sat_math_25th} - ${university.sat_math_75th}`
								: "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						ACT Composite (25th-75th)
					</label>
					{isEditing ? (
						<div className="mt-1 flex gap-2">
							<Input
								type="number"
								placeholder="25th %"
								value={formData.act_composite_25th}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										act_composite_25th: e.target.value,
									}))
								}
							/>
							<Input
								type="number"
								placeholder="75th %"
								value={formData.act_composite_75th}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										act_composite_75th: e.target.value,
									}))
								}
							/>
						</div>
					) : (
						<p className="text-sm">
							{university.act_composite_25th && university.act_composite_75th
								? `${university.act_composite_25th} - ${university.act_composite_75th}`
								: "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Acceptance Rate (%)
					</label>
					{isEditing ? (
						<Input
							type="number"
							step="0.1"
							value={formData.acceptance_rate_pct}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									acceptance_rate_pct: e.target.value,
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{university.acceptance_rate_pct
								? `${university.acceptance_rate_pct}%`
								: "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Undergrad Enrollment
					</label>
					{isEditing ? (
						<Input
							type="number"
							value={formData.undergraduate_enrollment}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									undergraduate_enrollment: e.target.value,
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{university.undergraduate_enrollment?.toLocaleString() ||
								"Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Total Yearly Cost (USD)
					</label>
					{isEditing ? (
						<Input
							type="number"
							value={formData.total_yearly_cost}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									total_yearly_cost: e.target.value,
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{university.total_yearly_cost
								? `$${university.total_yearly_cost.toLocaleString()}`
								: "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Majors Offered URL
					</label>
					{isEditing ? (
						<Input
							type="url"
							value={formData.majors_offered_url}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									majors_offered_url: e.target.value,
								}))
							}
							placeholder="https://..."
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{university.majors_offered_url ? (
								<a
									href={university.majors_offered_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline"
								>
									View Majors
								</a>
							) : (
								"Not provided"
							)}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						US News National (2018)
					</label>
					{isEditing ? (
						<Input
							type="number"
							value={formData.us_news_ranking_national_2018}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									us_news_ranking_national_2018: e.target.value,
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{university.us_news_ranking_national_2018
								? `#${university.us_news_ranking_national_2018}`
								: "Not ranked"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						US News Liberal Arts (2018)
					</label>
					{isEditing ? (
						<Input
							type="number"
							value={formData.us_news_ranking_liberal_arts_2018}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									us_news_ranking_liberal_arts_2018: e.target.value,
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{university.us_news_ranking_liberal_arts_2018
								? `#${university.us_news_ranking_liberal_arts_2018}`
								: "Not ranked"}
						</p>
					)}
				</div>
				<div className="flex items-center space-x-2">
					{isEditing ? (
						<>
							<Checkbox
								id="email_blocked"
								checked={formData.email_blocked}
								onCheckedChange={(checked) =>
									setFormData((prev) => ({
										...prev,
										email_blocked: !!checked,
									}))
								}
							/>
							<label
								htmlFor="email_blocked"
								className="font-medium text-muted-foreground text-sm"
							>
								Email Blocked?
							</label>
						</>
					) : (
						<div>
							<label className="font-medium text-muted-foreground text-sm">
								Email Blocked?
							</label>
							<p className="text-sm">
								{university.email_blocked ? "Yes" : "No"}
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
