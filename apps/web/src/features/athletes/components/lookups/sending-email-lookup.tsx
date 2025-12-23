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

interface SendingEmailLookupProps {
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
	allowClear?: boolean;
}

interface SendingEmailAccount {
	id: string;
	username: string | null;
	name: string | null;
	domain: {
		domain_url: string | null;
	} | null;
}

export function SendingEmailLookup({
	value,
	onChange,
	label = "Sending Email Account",
	required = false,
	disabled = false,
	allowClear = true,
}: SendingEmailLookupProps) {
	const [open, setOpen] = useState(false);
	const [accounts, setAccounts] = useState<SendingEmailAccount[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const fetchAccounts = async () => {
			setLoading(true);
			const supabase = createClient();

			const { data, error } = await supabase
				.from("email_sending_accounts")
				.select("id, username, name, domain:domains(domain_url)")
				.is("is_deleted", false)
				.order("username");

			if (error) {
				console.error("Error fetching sending email accounts:", error);
				setLoading(false);
				return;
			}
			if (data) {
				setAccounts(data as unknown as SendingEmailAccount[]);
			}
			setLoading(false);
		};

		fetchAccounts();
	}, []);

	const selectedAccount = accounts.find((account) => account.id === value);

	const getDisplayText = (account: SendingEmailAccount) => {
		const email =
			account.username && account.domain?.domain_url
				? `${account.username}@${account.domain.domain_url}`
				: account.username || "Unknown";
		const name = account.name ? ` (${account.name})` : "";
		return `${email}${name}`;
	};

	const filteredAccounts = accounts.filter((account) => {
		const searchLower = searchQuery.toLowerCase();
		const displayText = getDisplayText(account).toLowerCase();
		return displayText.includes(searchLower);
	});

	const handleSelect = (accountId: string) => {
		if (allowClear && value === accountId) {
			onChange("");
		} else {
			onChange(accountId);
		}
		setOpen(false);
	};

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
							? "Loading accounts..."
							: selectedAccount
								? getDisplayText(selectedAccount)
								: "Select sending email account..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command>
						<CommandInput
							placeholder="Search accounts..."
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<CommandList>
							<CommandEmpty>No account found.</CommandEmpty>
							<CommandGroup>
								{allowClear && value && (
									<CommandItem
										value="clear-selection"
										onSelect={() => handleSelect("")}
										className="text-muted-foreground"
									>
										<Check className="mr-2 h-4 w-4 opacity-0" />
										Clear selection
									</CommandItem>
								)}
								{filteredAccounts.map((account) => (
									<CommandItem
										key={account.id}
										value={getDisplayText(account)}
										onSelect={() => handleSelect(account.id)}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === account.id ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span>
												{account.username && account.domain?.domain_url
													? `${account.username}@${account.domain.domain_url}`
													: account.username || "Unknown"}
											</span>
											{account.name && (
												<span className="text-muted-foreground text-xs">
													{account.name}
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
