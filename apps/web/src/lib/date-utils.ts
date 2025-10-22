/**
 * Date Utilities
 *
 * This module provides timezone-safe date handling functions.
 * All dates are treated as local dates without timezone conversions.
 *
 * Key principle: Date strings from the database (YYYY-MM-DD) represent
 * calendar dates, not timestamps, and should not shift based on timezone.
 */

import { format, parseISO } from "date-fns";

/**
 * Parse a date string (YYYY-MM-DD) as a local date without timezone conversion
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object representing the local date
 */
export function parseLocalDate(
	dateString: string | null | undefined,
): Date | null {
	if (!dateString) return null;

	// Parse as local date to avoid timezone shifts
	const [year, month, day] = dateString.split("-");
	if (!year || !month || !day) return null;

	return new Date(
		Number.parseInt(year, 10),
		Number.parseInt(month, 10) - 1, // Month is 0-indexed
		Number.parseInt(day, 10),
	);
}

/**
 * Format a date string (YYYY-MM-DD) for display without timezone conversion
 * @param dateString - Date string in YYYY-MM-DD format
 * @param formatString - date-fns format string (default: "MMM d, yyyy")
 * @returns Formatted date string or fallback text
 */
export function formatLocalDate(
	dateString: string | null | undefined,
	formatString = "MMM d, yyyy",
	fallback = "Not set",
): string {
	const date = parseLocalDate(dateString);
	if (!date) return fallback;

	return format(date, formatString);
}

/**
 * Convert a Date object to YYYY-MM-DD string for database storage
 * Uses the local date components to avoid timezone conversion
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function toDateString(date: Date | null | undefined): string {
	if (!date) return "";

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

/**
 * Get today's date as YYYY-MM-DD string (local timezone)
 * @returns Today's date string
 */
export function getTodayDateString(): string {
	return toDateString(new Date());
}

/**
 * Format a timestamp for display (includes time)
 * @param timestamp - ISO timestamp or date string
 * @param formatString - date-fns format string (default: "MMM d, yyyy h:mm a")
 * @returns Formatted timestamp string
 */
export function formatTimestamp(
	timestamp: string | null | undefined,
	formatString = "MMM d, yyyy h:mm a",
	fallback = "Never",
): string {
	if (!timestamp) return fallback;

	try {
		const date = parseISO(timestamp);
		return format(date, formatString);
	} catch {
		return fallback;
	}
}

/**
 * Format a relative time (e.g., "2 days ago", "in 3 hours")
 * @param timestamp - ISO timestamp or date string
 * @returns Relative time string
 */
export function formatRelativeTime(
	timestamp: string | null | undefined,
): string {
	if (!timestamp) return "Never";

	try {
		const date = parseISO(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHour = Math.floor(diffMin / 60);
		const diffDay = Math.floor(diffHour / 24);
		const diffWeek = Math.floor(diffDay / 7);
		const diffMonth = Math.floor(diffDay / 30);
		const diffYear = Math.floor(diffDay / 365);

		if (diffSec < 60) return "just now";
		if (diffMin < 60) return `${diffMin} min${diffMin !== 1 ? "s" : ""} ago`;
		if (diffHour < 24)
			return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
		if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
		if (diffWeek < 4) return `${diffWeek} week${diffWeek !== 1 ? "s" : ""} ago`;
		if (diffMonth < 12)
			return `${diffMonth} month${diffMonth !== 1 ? "s" : ""} ago`;
		return `${diffYear} year${diffYear !== 1 ? "s" : ""} ago`;
	} catch {
		return "Unknown";
	}
}

/**
 * Check if a date string is in the past
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns true if the date is in the past
 */
export function isDateInPast(dateString: string | null | undefined): boolean {
	const date = parseLocalDate(dateString);
	if (!date) return false;

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return date < today;
}

/**
 * Check if a date string is in the future
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns true if the date is in the future
 */
export function isDateInFuture(dateString: string | null | undefined): boolean {
	const date = parseLocalDate(dateString);
	if (!date) return false;

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return date > today;
}

/**
 * Calculate the number of days between two dates
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 * @returns Number of days between dates (positive if endDate is after startDate)
 */
export function daysBetween(
	startDate: string | null | undefined,
	endDate: string | null | undefined,
): number | null {
	const start = parseLocalDate(startDate);
	const end = parseLocalDate(endDate);

	if (!start || !end) return null;

	const diffMs = end.getTime() - start.getTime();
	return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
