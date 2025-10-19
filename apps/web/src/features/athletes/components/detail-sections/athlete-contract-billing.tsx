import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DollarSign } from "lucide-react";

interface AthleteContractBillingProps {
	athlete: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function AthleteContractBilling({
	athlete,
}: AthleteContractBillingProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<DollarSign className="h-5 w-5" />
					Contract & Billing
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Contract Date
					</label>
					<p className="text-sm">
						{athlete.contract_date
							? new Date(athlete.contract_date).toLocaleDateString()
							: "Not signed"}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Go-Live Date
					</label>
					<p className="text-sm">
						{athlete.go_live_date
							? new Date(athlete.go_live_date).toLocaleDateString()
							: "Not set"}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Initial Contract Amount (USD)
					</label>
					<p className="text-sm">
						{athlete.initial_contract_amount_usd
							? `$${athlete.initial_contract_amount_usd.toLocaleString()}`
							: "Not set"}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Initial Cash Collected (USD)
					</label>
					<p className="text-sm">
						{athlete.initial_cash_collected_usd
							? `$${athlete.initial_cash_collected_usd.toLocaleString()}`
							: "Not collected"}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Initial Payment Type
					</label>
					<p className="text-sm capitalize">
						{athlete.initial_payment_type?.replace("_", " ") || "Not specified"}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Internal Notes
					</label>
					<p className="text-sm">{athlete.internal_notes || "No notes"}</p>
				</div>
			</CardContent>
		</Card>
	);
}
