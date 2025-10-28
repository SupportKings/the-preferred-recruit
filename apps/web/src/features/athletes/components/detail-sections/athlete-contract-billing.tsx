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
import { Textarea } from "@/components/ui/textarea";

import { PAYMENT_TYPES } from "@/features/athletes/types/athlete";

import { DollarSign, Edit3, Save, X } from "lucide-react";

interface AthleteContractBillingProps {
	athlete: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function AthleteContractBilling({
	athlete,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: AthleteContractBillingProps) {
	const [formData, setFormData] = useState({
		contract_date: athlete.contract_date || "",
		go_live_date: athlete.go_live_date || "",
		initial_contract_amount_usd: athlete.initial_contract_amount_usd || "",
		initial_cash_collected_usd: athlete.initial_cash_collected_usd || "",
		initial_payment_type: athlete.initial_payment_type || "",
		internal_notes: athlete.internal_notes || "",
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

		// Convert string values to numbers for numeric fields
		const saveData: any = {
			contract_date: formatDate(formData.contract_date),
			go_live_date: formatDate(formData.go_live_date),
			initial_contract_amount_usd: formData.initial_contract_amount_usd
				? Number(formData.initial_contract_amount_usd)
				: undefined,
			initial_cash_collected_usd: formData.initial_cash_collected_usd
				? Number(formData.initial_cash_collected_usd)
				: undefined,
			initial_payment_type: formData.initial_payment_type || undefined,
			internal_notes: formData.internal_notes || undefined,
		};

		onSave?.(saveData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			contract_date: athlete.contract_date || "",
			go_live_date: athlete.go_live_date || "",
			initial_contract_amount_usd: athlete.initial_contract_amount_usd || "",
			initial_cash_collected_usd: athlete.initial_cash_collected_usd || "",
			initial_payment_type: athlete.initial_payment_type || "",
			internal_notes: athlete.internal_notes || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<DollarSign className="h-5 w-5" />
						Contract & Billing
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
						Contract Date
					</label>
					{isEditing ? (
						<DatePicker
							value={formData.contract_date}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, contract_date: value }))
							}
							placeholder="Select contract date"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{athlete.contract_date
								? new Date(athlete.contract_date).toLocaleDateString()
								: "Not signed"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Go-Live Date
					</label>
					{isEditing ? (
						<DatePicker
							value={formData.go_live_date}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, go_live_date: value }))
							}
							placeholder="Select go-live date"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{athlete.go_live_date
								? new Date(athlete.go_live_date).toLocaleDateString()
								: "Not set"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Initial Contract Amount (USD)
					</label>
					{isEditing ? (
						<Input
							type="number"
							step="0.01"
							min="0"
							value={formData.initial_contract_amount_usd}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									initial_contract_amount_usd: e.target.value,
								}))
							}
							placeholder="5000.00"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{athlete.initial_contract_amount_usd
								? `$${Number(athlete.initial_contract_amount_usd).toLocaleString()}`
								: "Not set"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Initial Cash Collected (USD)
					</label>
					{isEditing ? (
						<Input
							type="number"
							step="0.01"
							min="0"
							value={formData.initial_cash_collected_usd}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									initial_cash_collected_usd: e.target.value,
								}))
							}
							placeholder="2500.00"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{athlete.initial_cash_collected_usd
								? `$${Number(athlete.initial_cash_collected_usd).toLocaleString()}`
								: "Not collected"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Initial Payment Type
					</label>
					{isEditing ? (
						<Select
							value={formData.initial_payment_type}
							onValueChange={(value) =>
								setFormData((prev) => ({
									...prev,
									initial_payment_type: value,
								}))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="Select payment type" />
							</SelectTrigger>
							<SelectContent>
								{PAYMENT_TYPES.map((type) => (
									<SelectItem key={type} value={type}>
										{type
											.split("_")
											.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
											.join(" ")}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm capitalize">
							{athlete.initial_payment_type?.replace(/_/g, " ") ||
								"Not specified"}
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
							placeholder="Private notes for internal use..."
							rows={6}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{athlete.internal_notes || "No notes"}</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
