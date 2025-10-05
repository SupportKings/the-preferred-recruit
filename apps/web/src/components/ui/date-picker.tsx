"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

interface DatePickerProps {
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	id?: string;
}

export function DatePicker({
	value,
	onChange,
	placeholder = "Pick a date",
	disabled = false,
	className,
	id,
}: DatePickerProps) {
	const [date, setDate] = React.useState<Date | undefined>(
		value ? new Date(value) : undefined,
	);

	const handleDateSelect = (newDate: Date | undefined) => {
		setDate(newDate);
		if (onChange && newDate) {
			// Create UTC date at midnight to represent the selected date
			const year = newDate.getFullYear();
			const month = newDate.getMonth();
			const day = newDate.getDate();
			const utcDate = new Date(Date.UTC(year, month, day));
			onChange(utcDate.toISOString().split("T")[0]);
		} else if (onChange && !newDate) {
			onChange("");
		}
	};

	React.useEffect(() => {
		if (value) {
			// Parse date string as local date to avoid timezone issues
			const [year, month, day] = value.split("-");
			setDate(
				new Date(
					Number.parseInt(year),
					Number.parseInt(month) - 1,
					Number.parseInt(day),
				),
			);
		} else {
			setDate(undefined);
		}
	}, [value]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant={"outline"}
					className={cn(
						"h-10 w-full justify-start text-left font-normal",
						!date && "text-muted-foreground",
						className,
					)}
					disabled={disabled}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, "PPP") : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					onSelect={handleDateSelect}
					autoFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
