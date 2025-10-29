import { useState } from "react";

import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { Check, Pencil, X } from "lucide-react";

interface InlineEditCellProps {
	value: string | null;
	onSave: (value: string | null) => Promise<void>;
	type?: "text" | "email" | "tel" | "select";
	options?: Array<{ value: string; label: string }>;
	placeholder?: string;
}

export function InlineEditCell({
	value,
	onSave,
	type = "text",
	options,
	placeholder = "Not set",
}: InlineEditCellProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(value || "");
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await onSave(editValue || null);
			setIsEditing(false);
		} catch (error) {
			console.error("Error saving:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setEditValue(value || "");
		setIsEditing(false);
	};

	if (!isEditing) {
		return (
			<div className="group flex items-center gap-2">
				<span className={value ? "" : "text-muted-foreground"}>
					{type === "select" && options
						? options.find((opt) => opt.value === value)?.label || placeholder
						: value || placeholder}
				</span>
				<button
					type="button"
					onClick={() => setIsEditing(true)}
					className="invisible opacity-0 transition-all group-hover:visible group-hover:opacity-100"
				>
					<Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
				</button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-1">
			{type === "select" && options ? (
				<Select value={editValue} onValueChange={setEditValue}>
					<SelectTrigger className="h-8 w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{options.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			) : (
				<Input
					type={type}
					value={editValue}
					onChange={(e) => setEditValue(e.target.value)}
					className="h-8"
					placeholder={placeholder}
					autoFocus
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleSave();
						} else if (e.key === "Escape") {
							handleCancel();
						}
					}}
				/>
			)}
			<button
				type="button"
				onClick={handleSave}
				disabled={isSaving}
				className="text-green-600 hover:text-green-700"
			>
				<Check className="h-4 w-4" />
			</button>
			<button
				type="button"
				onClick={handleCancel}
				disabled={isSaving}
				className="text-red-600 hover:text-red-700"
			>
				<X className="h-4 w-4" />
			</button>
		</div>
	);
}
