import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { formatLocalDate } from "@/lib/date-utils";
import { Edit3, Mail, Phone, Save, User, X } from "lucide-react";

interface AthleteIdentityContactProps {
	athlete: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function AthleteIdentityContact({
	athlete,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: AthleteIdentityContactProps) {
	const [formData, setFormData] = useState({
		full_name: athlete.full_name || "",
		contact_email: athlete.contact_email || "",
		phone: athlete.phone || "",
		instagram_handle: athlete.instagram_handle || "",
		gender: athlete.gender || "",
		date_of_birth: athlete.date_of_birth || "",
		gpa: athlete.gpa || "",
	});

	const handleSave = () => {
		// Helper function to ensure date is in YYYY-MM-DD format
		const formatDate = (dateString: string) => {
			if (!dateString) return undefined;
			// If already in YYYY-MM-DD format, return as-is
			if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
			// Otherwise extract just the date part from ISO string
			return dateString.split("T")[0];
		};

		// Convert GPA string to number and format date
		const saveData: any = {
			...formData,
			gpa: formData.gpa ? Number(formData.gpa) : undefined,
			date_of_birth: formatDate(formData.date_of_birth),
		};

		onSave?.(saveData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			full_name: athlete.full_name || "",
			contact_email: athlete.contact_email || "",
			phone: athlete.phone || "",
			instagram_handle: athlete.instagram_handle || "",
			gender: athlete.gender || "",
			date_of_birth: athlete.date_of_birth || "",
			gpa: athlete.gpa || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Identity & Contact
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
						Full Name
					</label>
					{isEditing ? (
						<Input
							value={formData.full_name}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, full_name: e.target.value }))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{athlete.full_name || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="flex items-center gap-1 font-medium text-muted-foreground text-sm">
						<Mail className="h-3 w-3" />
						Contact Email
					</label>
					{isEditing ? (
						<Input
							type="email"
							value={formData.contact_email}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									contact_email: e.target.value,
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{athlete.contact_email || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="flex items-center gap-1 font-medium text-muted-foreground text-sm">
						<Phone className="h-3 w-3" />
						Phone
					</label>
					{isEditing ? (
						<Input
							value={formData.phone}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, phone: e.target.value }))
							}
							placeholder="Enter phone number"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{athlete.phone || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Instagram Handle
					</label>
					{isEditing ? (
						<Input
							value={formData.instagram_handle}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									instagram_handle: e.target.value,
								}))
							}
							placeholder="@username"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{athlete.instagram_handle || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Gender
					</label>
					{isEditing ? (
						<Select
							value={formData.gender}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, gender: value }))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="Select gender" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="male">Male</SelectItem>
								<SelectItem value="female">Female</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm capitalize">
							{athlete.gender || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Date of Birth
					</label>
					{isEditing ? (
						<DatePicker
							value={formData.date_of_birth}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, date_of_birth: value }))
							}
							placeholder="Select date of birth"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{athlete.date_of_birth
								? formatLocalDate(athlete.date_of_birth)
								: "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						GPA
					</label>
					{isEditing ? (
						<Input
							type="number"
							step="0.01"
							min="0"
							max="5"
							value={formData.gpa}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, gpa: e.target.value }))
							}
							placeholder="4.00"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{athlete.gpa ? Number(athlete.gpa).toFixed(2) : "Not provided"}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
