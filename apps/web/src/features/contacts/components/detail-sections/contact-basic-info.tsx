import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Edit3, Save, User, X } from "lucide-react";

// Format contact method for display (e.g., "whatsapp" -> "WhatsApp")
const formatContactMethod = (method: string | null | undefined): string => {
	if (!method) return "Not provided";

	const methodMap: Record<string, string> = {
		email: "Email",
		phone: "Phone",
		text: "Text/SMS",
		whatsapp: "WhatsApp",
		other: "Other",
	};

	return methodMap[method.toLowerCase()] || method;
};

interface ContactBasicInfoProps {
	contact: {
		full_name: string;
		email: string;
		phone: string;
		preferred_contact_method: string;
		internal_notes: string;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function ContactBasicInfo({
	contact,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: ContactBasicInfoProps) {
	const [formData, setFormData] = useState({
		full_name: contact.full_name,
		email: contact.email,
		phone: contact.phone,
		preferred_contact_method: contact.preferred_contact_method,
		internal_notes: contact.internal_notes,
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			full_name: contact.full_name,
			email: contact.email,
			phone: contact.phone,
			preferred_contact_method: contact.preferred_contact_method,
			internal_notes: contact.internal_notes,
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Identity & Preferences
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
						<p className="text-sm">{contact.full_name || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Email
					</label>
					{isEditing ? (
						<Input
							type="email"
							value={formData.email}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, email: e.target.value }))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{contact.email || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Phone
					</label>
					{isEditing ? (
						<Input
							value={formData.phone}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, phone: e.target.value }))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{contact.phone || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Preferred Contact Method
					</label>
					{isEditing ? (
						<Select
							value={formData.preferred_contact_method || "none"}
							onValueChange={(value) =>
								setFormData((prev) => ({
									...prev,
									preferred_contact_method: value === "none" ? "" : value,
								}))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="Select a method" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none" disabled>
									Select a method
								</SelectItem>
								<SelectItem value="email">Email</SelectItem>
								<SelectItem value="phone">Phone</SelectItem>
								<SelectItem value="text">Text/SMS</SelectItem>
								<SelectItem value="whatsapp">WhatsApp</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							{formatContactMethod(contact.preferred_contact_method)}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Internal Notes
					</label>
					{isEditing ? (
						<Textarea
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									internal_notes: e.target.value,
								}))
							}
							placeholder="Private notes about this contact"
							className="mt-1"
							rows={3}
						/>
					) : (
						<p className="text-sm">
							{contact.internal_notes || "Not provided"}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
