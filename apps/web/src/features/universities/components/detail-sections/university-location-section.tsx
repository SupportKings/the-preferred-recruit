import { useMemo, useState } from "react";

import type { Tables } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { City, State } from "country-state-city";
import { Check, ChevronsUpDown, Edit3, MapPin, Save, X } from "lucide-react";
import { ConferenceLookup } from "../lookups/conference-lookup";
import { DivisionLookup } from "../lookups/division-lookup";

interface UniversityLocationSectionProps {
	university: Tables<"universities">;
	currentConferenceId?: string | null;
	currentConferenceName?: string | null;
	currentDivisionId?: string | null;
	currentDivisionName?: string | null;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: Record<string, unknown>) => void;
	onCancel?: () => void;
}

export function UniversityLocationSection({
	university,
	currentConferenceId,
	currentConferenceName,
	currentDivisionId,
	currentDivisionName,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: UniversityLocationSectionProps) {
	// Get US states
	const usStates = useMemo(() => {
		return State.getStatesOfCountry("US").sort((a, b) =>
			a.name.localeCompare(b.name),
		);
	}, []);

	// Convert state abbreviation to ISO code for initial form data
	const initialStateCode = university.state
		? usStates.find((s) => s.isoCode === university.state)?.isoCode || ""
		: "";

	const [formData, setFormData] = useState({
		city: university.city || "",
		state: initialStateCode,
		region: university.region || "",
		size_of_city: university.size_of_city || "",
		conferenceId: currentConferenceId || "",
		divisionId: currentDivisionId || "",
	});

	const [stateComboOpen, setStateComboOpen] = useState(false);
	const [cityComboOpen, setCityComboOpen] = useState(false);

	// Get cities for selected state
	const cities = useMemo(() => {
		if (!formData.state) return [];
		return City.getCitiesOfState("US", formData.state).sort((a, b) =>
			a.name.localeCompare(b.name),
		);
	}, [formData.state]);

	const handleSave = () => {
		// State is already stored as ISO code (abbreviation) in DB, so no conversion needed
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset to initial state with state abbreviation converted to ISO code
		const resetStateCode = university.state
			? usStates.find((s) => s.isoCode === university.state)?.isoCode || ""
			: "";

		setFormData({
			city: university.city || "",
			state: resetStateCode,
			region: university.region || "",
			size_of_city: university.size_of_city || "",
			conferenceId: currentConferenceId || "",
			divisionId: currentDivisionId || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<MapPin className="h-5 w-5" />
						Location & Context
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
						State
					</label>
					{isEditing ? (
						<Popover open={stateComboOpen} onOpenChange={setStateComboOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={stateComboOpen}
									className="mt-1 w-full justify-between"
									type="button"
								>
									{formData.state
										? usStates.find((s) => s.isoCode === formData.state)?.name
										: "Select state..."}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full p-0" align="start">
								<Command>
									<CommandInput placeholder="Search states..." />
									<CommandList>
										<CommandEmpty>No state found.</CommandEmpty>
										<CommandGroup>
											{usStates.map((state) => (
												<CommandItem
													key={state.isoCode}
													value={state.name}
													onSelect={() => {
														setFormData((prev) => ({
															...prev,
															state: state.isoCode,
															city: "", // Clear city when state changes
														}));
														setStateComboOpen(false);
													}}
												>
													<Check
														className={`mr-2 h-4 w-4 ${
															formData.state === state.isoCode
																? "opacity-100"
																: "opacity-0"
														}`}
													/>
													{state.name}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					) : (
						<p className="text-sm">
							{university.state
								? usStates.find((s) => s.isoCode === university.state)?.name ||
									university.state
								: "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						City
					</label>
					{isEditing ? (
						<Popover open={cityComboOpen} onOpenChange={setCityComboOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={cityComboOpen}
									className="mt-1 w-full justify-between"
									type="button"
									disabled={!formData.state}
								>
									{formData.city
										? formData.city
										: formData.state
											? "Select city..."
											: "Select state first..."}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full p-0" align="start">
								<Command>
									<CommandInput placeholder="Search cities..." />
									<CommandList>
										<CommandEmpty>No city found.</CommandEmpty>
										<CommandGroup>
											{cities.map((city) => (
												<CommandItem
													key={city.name}
													value={city.name}
													onSelect={() => {
														setFormData((prev) => ({
															...prev,
															city: city.name,
														}));
														setCityComboOpen(false);
													}}
												>
													<Check
														className={`mr-2 h-4 w-4 ${
															formData.city === city.name
																? "opacity-100"
																: "opacity-0"
														}`}
													/>
													{city.name}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					) : (
						<p className="text-sm">{university.city || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Region
					</label>
					{isEditing ? (
						<Input
							value={formData.region}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, region: e.target.value }))
							}
							placeholder="e.g., Midwest"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{university.region || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						City Size
					</label>
					{isEditing ? (
						<Select
							value={formData.size_of_city}
							onValueChange={(value) =>
								setFormData((prev) => ({
									...prev,
									size_of_city: value,
								}))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="Select size..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Small">Small ({"<"}50k)</SelectItem>
								<SelectItem value="Medium">Medium (50k-250k)</SelectItem>
								<SelectItem value="Large">Large (250k-1M)</SelectItem>
								<SelectItem value="Very Large">Very Large ({">"}1M)</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							{university.size_of_city || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<p className="font-medium text-muted-foreground text-sm">
						Conference
					</p>
					{isEditing ? (
						<div className="mt-1">
							<ConferenceLookup
								value={formData.conferenceId}
								onChange={(value) =>
									setFormData((prev) => ({ ...prev, conferenceId: value }))
								}
								label=""
							/>
						</div>
					) : (
						<p className="text-sm">{currentConferenceName || "Not assigned"}</p>
					)}
				</div>
				<div>
					<p className="font-medium text-muted-foreground text-sm">Division</p>
					{isEditing ? (
						<div className="mt-1">
							<DivisionLookup
								value={formData.divisionId}
								onChange={(value) =>
									setFormData((prev) => ({ ...prev, divisionId: value }))
								}
								label=""
							/>
						</div>
					) : (
						<p className="text-sm">{currentDivisionName || "Not assigned"}</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
