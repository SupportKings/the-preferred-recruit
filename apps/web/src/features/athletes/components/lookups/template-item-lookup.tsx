"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { createClient } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { Check, ChevronsUpDown } from "lucide-react";

interface TemplateItemLookupProps {
	checklistTemplateId?: string;
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
}

interface TemplateItem {
	id: string;
	title: string;
	description?: string;
	sort_order?: number;
}

export function TemplateItemLookup({
	checklistTemplateId,
	value,
	onChange,
	label = "Template Item",
	required = false,
	disabled = false,
}: TemplateItemLookupProps) {
	const [open, setOpen] = useState(false);
	const [templateItems, setTemplateItems] = useState<TemplateItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const fetchTemplateItems = async () => {
			setLoading(true);
			const supabase = createClient();

			let query = supabase
				.from("checklist_template_items")
				.select("id, title, description, sort_order")
				.order("sort_order");

			// Filter by checklist template if provided
			if (checklistTemplateId) {
				query = query.eq("checklist_template_id", checklistTemplateId);
			}

			const { data, error } = await query;

			if (error) {
				console.error("Error fetching data:", error);
				setLoading(false);
				return;
			}
			if (data) {
				setTemplateItems(data as TemplateItem[]);
			}
			setLoading(false);
		};

		fetchTemplateItems();
	}, [checklistTemplateId]);

	const selectedTemplateItem = templateItems.find((item) => item.id === value);

	const filteredTemplateItems = templateItems.filter((item) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			item.title.toLowerCase().includes(searchLower) ||
			item.description?.toLowerCase().includes(searchLower)
		);
	});

	return (
		<div className="space-y-2">
			{label && (
				<Label>
					{label}
					{required && <span className="text-destructive"> *</span>}
				</Label>
			)}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-full justify-between"
						disabled={disabled || loading}
					>
						{loading
							? "Loading template items..."
							: selectedTemplateItem
								? selectedTemplateItem.title
								: "Select template item..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command>
						<CommandInput
							placeholder="Search template items..."
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<CommandList>
							<CommandEmpty>No template item found.</CommandEmpty>
							<CommandGroup>
								{filteredTemplateItems.map((item) => (
									<CommandItem
										key={item.id}
										value={`${item.title} ${item.description || ""}`}
										onSelect={() => {
											onChange(item.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === item.id ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span>{item.title}</span>
											{item.description && (
												<span className="text-muted-foreground text-xs">
													{item.description}
												</span>
											)}
										</div>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
