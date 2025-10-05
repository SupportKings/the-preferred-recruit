"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { Check } from "lucide-react";
import { getAllIcons, searchIcons } from "../data/icon-registry";

interface IconPickerProps {
	value?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	triggerClassName?: string;
	children?: React.ReactNode;
}

export function IconPicker({
	value,
	onValueChange,
	placeholder = "Select icon...",
	triggerClassName,
	children,
}: IconPickerProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	const icons = search ? searchIcons(search) : getAllIcons();
	const selectedIcon = icons.find(([key]) => key === value)?.[1];

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				{children || (
					<button
						type="button"
						className={cn(
							"flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted",
							triggerClassName,
						)}
					>
						{selectedIcon ? (
							<>
								<selectedIcon.icon className="h-4 w-4" />
								<span>{selectedIcon.name}</span>
							</>
						) : (
							<span className="text-muted-foreground">{placeholder}</span>
						)}
					</button>
				)}
			</PopoverTrigger>
			<PopoverContent className="w-[600px] p-0" align="start">
				<Command>
					<CommandInput
						placeholder="Search icons..."
						value={search}
						onValueChange={setSearch}
					/>
					<CommandEmpty>No icons found.</CommandEmpty>
					<CommandGroup className="max-h-[400px] overflow-auto p-2">
						<div className="grid grid-cols-14 gap-1">
							{icons.map(([key, item]) => (
								<CommandItem
									key={key}
									value={key}
									onSelect={() => {
										onValueChange?.(key);
										setOpen(false);
									}}
									className="flex h-8 w-8 cursor-pointer items-center justify-center rounded p-0 data-[selected=true]:bg-accent"
								>
									<div className="relative flex h-full w-full items-center justify-center">
										<item.icon className="h-4 w-4" />
										{value === key && (
											<Check className="absolute right-0 bottom-0 h-2 w-2 text-primary" />
										)}
									</div>
									<span className="sr-only">{item.name}</span>
								</CommandItem>
							))}
						</div>
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
