import { useMemo, useState } from "react";

import { ServerSearchCombobox } from "@/components/server-search-combobox";
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

import { City, State } from "country-state-city";
import { Edit3, MapPin, Save, X } from "lucide-react";

interface AthleteLocationEducationProps {
	athlete: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function AthleteLocationEducation({
	athlete,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: AthleteLocationEducationProps) {
	// Get US states
	const usStates = useMemo(() => {
		return State.getStatesOfCountry("US").sort((a, b) =>
			a.name.localeCompare(b.name),
		);
	}, []);

	// Convert state name to ISO code for initial form data
	const initialStateCode = athlete.state
		? usStates.find((s) => s.name === athlete.state)?.isoCode || ""
		: "";

	const [formData, setFormData] = useState({
		high_school: athlete.high_school || "",
		city: athlete.city || "",
		state: initialStateCode,
		country: athlete.country || "United States",
		graduation_year: athlete.graduation_year || "",
		year_entering_university: athlete.year_entering_university || "",
		student_type: athlete.student_type || "",
		sat_score: athlete.sat_score || "",
		act_score: athlete.act_score || "",
	});

	const [stateSearch, setStateSearch] = useState("");
	const [citySearch, setCitySearch] = useState("");

	// Get filtered states based on search
	const filteredStates = useMemo(() => {
		return usStates.filter((state) =>
			state.name.toLowerCase().includes(stateSearch.toLowerCase()),
		);
	}, [usStates, stateSearch]);

	// Get filtered cities for selected state based on search
	const filteredCities = useMemo(() => {
		if (!formData.state) return [];
		const cities = City.getCitiesOfState("US", formData.state);
		return cities
			.filter((city) =>
				city.name.toLowerCase().includes(citySearch.toLowerCase()),
			)
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [formData.state, citySearch]);

	const handleSave = () => {
		// Convert state ISO code back to state name before saving
		const stateName = formData.state
			? usStates.find((s) => s.isoCode === formData.state)?.name ||
				formData.state
			: "";

		// Convert string values to numbers for numeric fields
		const saveData: any = {
			high_school: formData.high_school || undefined,
			city: formData.city || undefined,
			state: stateName || undefined,
			country: formData.country || undefined,
			graduation_year: formData.graduation_year
				? Number(formData.graduation_year)
				: undefined,
			year_entering_university: formData.year_entering_university
				? Number(formData.year_entering_university)
				: undefined,
			student_type: formData.student_type || undefined,
			sat_score: formData.sat_score ? Number(formData.sat_score) : undefined,
			act_score: formData.act_score ? Number(formData.act_score) : undefined,
		};

		onSave?.(saveData);
	};

	const handleCancel = () => {
		// Reset to initial state with state name converted to ISO code
		const resetStateCode = athlete.state
			? usStates.find((s) => s.name === athlete.state)?.isoCode || ""
			: "";

		setFormData({
			high_school: athlete.high_school || "",
			city: athlete.city || "",
			state: resetStateCode,
			country: athlete.country || "United States",
			graduation_year: athlete.graduation_year || "",
			year_entering_university: athlete.year_entering_university || "",
			student_type: athlete.student_type || "",
			sat_score: athlete.sat_score || "",
			act_score: athlete.act_score || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<MapPin className="h-5 w-5" />
						Location & Education
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
						High School
					</label>
					{isEditing ? (
						<Input
							value={formData.high_school}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									high_school: e.target.value,
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{athlete.high_school || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						State
					</label>
					{isEditing ? (
						<ServerSearchCombobox
							value={formData.state}
							onValueChange={(value) => {
								setFormData((prev) => ({
									...prev,
									state: value,
									city: "", // Clear city when state changes
								}));
								setCitySearch(""); // Reset city search
							}}
							searchTerm={stateSearch}
							onSearchChange={setStateSearch}
							options={filteredStates.map((state) => ({
								value: state.isoCode,
								label: state.name,
							}))}
							placeholder="Select state..."
							searchPlaceholder="Search states..."
							emptyText="No state found."
							className="mt-1"
							showInitialResults
						/>
					) : (
						<p className="text-sm">{athlete.state || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						City
					</label>
					{isEditing ? (
						<ServerSearchCombobox
							value={formData.city}
							onValueChange={(value) => {
								setFormData((prev) => ({
									...prev,
									city: value,
								}));
							}}
							searchTerm={citySearch}
							onSearchChange={setCitySearch}
							options={filteredCities.map((city) => ({
								value: city.name,
								label: city.name,
							}))}
							placeholder={
								formData.state ? "Select city..." : "Select state first..."
							}
							searchPlaceholder="Search cities..."
							emptyText="No city found."
							className="mt-1"
							disabled={!formData.state}
							showInitialResults
						/>
					) : (
						<p className="text-sm">{athlete.city || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Country
					</label>
					{isEditing ? (
						<Input
							value={formData.country}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, country: e.target.value }))
							}
							className="mt-1"
							disabled
						/>
					) : (
						<p className="text-sm">{athlete.country || "United States"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						HS Graduation Year
					</label>
					{isEditing ? (
						<Input
							type="number"
							min="2000"
							max="2050"
							value={formData.graduation_year}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									graduation_year: e.target.value,
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{athlete.graduation_year || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Year Entering University
					</label>
					{isEditing ? (
						<Input
							type="number"
							min="2000"
							max="2050"
							value={formData.year_entering_university}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									year_entering_university: e.target.value,
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{athlete.year_entering_university || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Student Type
					</label>
					{isEditing ? (
						<Select
							value={formData.student_type}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, student_type: value }))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="Select type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="high_school">High School</SelectItem>
								<SelectItem value="transfer">Transfer</SelectItem>
								<SelectItem value="international">International</SelectItem>
								<SelectItem value="gap_year">Gap Year</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm capitalize">
							{athlete.student_type?.replace("_", " ") || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						SAT Score
					</label>
					{isEditing ? (
						<Input
							type="number"
							min="400"
							max="1600"
							value={formData.sat_score}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, sat_score: e.target.value }))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{athlete.sat_score || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						ACT Score
					</label>
					{isEditing ? (
						<Input
							type="number"
							min="1"
							max="36"
							value={formData.act_score}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, act_score: e.target.value }))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{athlete.act_score || "Not provided"}</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
