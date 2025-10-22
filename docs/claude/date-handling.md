# Date Handling Guide

## Overview

This guide explains how to handle dates consistently across the application to avoid timezone-related bugs. **Dates should not shift based on the user's timezone.**

## Core Principle

**Calendar dates (e.g., "Start Date: January 15, 2024") are NOT timestamps.** They represent a specific day on the calendar, not a moment in time. A person's birth date, a job start date, or an event date should be the same regardless of which timezone you view it from.

## The Problem

When you use JavaScript's `new Date("2024-01-15")` or `.toLocaleDateString()`, JavaScript treats the date as UTC midnight and converts it to the user's timezone, which can shift the date by +/- 1 day:

```typescript
// ❌ BAD - Date shifts based on timezone
const date = new Date("2024-01-15"); // Might become Jan 14 or Jan 16!
date.toLocaleDateString(); // Might show "1/14/2024" in some timezones

// ❌ BAD - Storing dates
const dateString = new Date().toISOString().split("T")[0]; // Can shift dates!
```

## The Solution

Use the date utility functions in `/apps/web/src/lib/date-utils.ts`:

### 1. Parsing Dates (String → Date Object)

```typescript
import { parseLocalDate } from "@/lib/date-utils";

// ✅ GOOD - Parse date string as local date (no timezone conversion)
const date = parseLocalDate("2024-01-15"); // Always Jan 15, 2024
```

### 2. Formatting Dates for Display

```typescript
import { formatLocalDate } from "@/lib/date-utils";

// ✅ GOOD - Format for display
formatLocalDate("2024-01-15"); // "Jan 15, 2024"
formatLocalDate("2024-01-15", "MMM d, yyyy"); // "Jan 15, 2024"
formatLocalDate("2024-01-15", "yyyy-MM-dd"); // "2024-01-15"
formatLocalDate(null); // "Not set" (default fallback)
formatLocalDate(null, "MMM d, yyyy", "N/A"); // "N/A" (custom fallback)

// Display example
<p>{formatLocalDate(universityJob.start_date)}</p>
```

### 3. Converting Date Object to String (for Database)

```typescript
import { toDateString } from "@/lib/date-utils";

// ✅ GOOD - Convert Date object to YYYY-MM-DD string
const dateString = toDateString(new Date(2024, 0, 15)); // "2024-01-15"

// In form handlers
const handleSubmit = (date: Date) => {
	const dateString = toDateString(date); // Safe for database storage
	// Save to database...
};
```

### 4. Working with Timestamps (includes time)

For data that includes time (e.g., `created_at`, `updated_at`, `last_interaction_at`):

```typescript
import { formatTimestamp, formatRelativeTime } from "@/lib/date-utils";

// Format with date and time
formatTimestamp("2024-01-15T14:30:00Z"); // "Jan 15, 2024 2:30 PM"
formatTimestamp("2024-01-15T14:30:00Z", "MMM d, yyyy 'at' h:mm a"); // "Jan 15, 2024 at 2:30 PM"

// Relative time
formatRelativeTime("2024-01-15T14:30:00Z"); // "2 hours ago"
```

### 5. Date Comparisons

```typescript
import { isDateInPast, isDateInFuture, daysBetween } from "@/lib/date-utils";

// Check if date is in past/future
isDateInPast("2024-01-15"); // true/false
isDateInFuture("2024-12-31"); // true/false

// Calculate days between dates
daysBetween("2024-01-15", "2024-01-20"); // 5
```

## Using the DatePicker Component

The `DatePicker` component automatically handles timezone-safe date conversions:

```typescript
import { DatePicker } from "@/components/ui/date-picker";

<DatePicker
	value={formData.start_date} // YYYY-MM-DD string
	onChange={(value) => setFormData({ ...formData, start_date: value })} // Returns YYYY-MM-DD
	placeholder="Select start date"
/>
```

## Migration Checklist

When updating existing code to use the date utilities:

### ❌ Replace these patterns:

```typescript
// Pattern 1: Parsing dates
new Date(dateString) → parseLocalDate(dateString)

// Pattern 2: Formatting dates
new Date(dateString).toLocaleDateString() → formatLocalDate(dateString)

// Pattern 3: Converting to string
new Date().toISOString().split("T")[0] → toDateString(new Date())
date.toISOString().split("T")[0] → toDateString(date)

// Pattern 4: Format with time
new Date(timestamp).toLocaleString() → formatTimestamp(timestamp)
```

### ✅ Good Patterns:

```typescript
// Display dates
<p>{formatLocalDate(athlete.birth_date)}</p>
<p>{formatLocalDate(job.start_date, "MMM yyyy")}</p>

// Display timestamps
<p>{formatTimestamp(coach.created_at)}</p>
<p>Last seen {formatRelativeTime(athlete.last_active_at)}</p>

// Date input
<DatePicker
	value={formData.start_date}
	onChange={(value) => setFormData({ ...formData, start_date: value })}
/>

// Get today's date
const today = getTodayDateString(); // "2024-01-15"
```

## Database Schema

All date columns should use:
- **DATE type** for calendar dates (birth_date, start_date, end_date)
- **TIMESTAMP type** for moments in time (created_at, updated_at, last_interaction_at)

## Testing Dates

To test that dates work correctly across timezones:

1. **In Chrome DevTools**:
   - Open Console
   - Go to Settings (⚙️) → Sensors
   - Change "Location" to different timezones (e.g., Tokyo, London, New York)
   - Verify dates don't shift

2. **Check these scenarios**:
   - View a record with `start_date = "2024-01-15"`
   - Edit the date (should show Jan 15, 2024)
   - Save the date (should save as "2024-01-15")
   - View again (should still show Jan 15, 2024)

## Common Mistakes to Avoid

1. **❌ Don't use `new Date(dateString)` directly**
   ```typescript
   const date = new Date("2024-01-15"); // ❌ Can shift by timezone
   ```

2. **❌ Don't use `.toLocaleDateString()`**
   ```typescript
   const display = new Date(dateString).toLocaleDateString(); // ❌ Inconsistent format
   ```

3. **❌ Don't use HTML input type="date" without proper handling**
   ```typescript
   <input type="date" value={date} /> // ❌ Use DatePicker instead
   ```

4. **❌ Don't mix Date objects and strings carelessly**
   ```typescript
   // ❌ Bad - Can cause timezone issues
   const dateObj = new Date(dateString);
   const display = dateObj.toLocaleDateString();

   // ✅ Good - Use utilities
   const display = formatLocalDate(dateString);
   ```

## Summary

**Golden Rules:**
1. Always use `parseLocalDate()` to parse date strings
2. Always use `formatLocalDate()` to display dates
3. Always use `toDateString()` to convert Date objects to strings
4. Use `DatePicker` component for date inputs
5. Never use `new Date(dateString)` or `.toLocaleDateString()` directly for calendar dates

**When in doubt:** Check `/apps/web/src/lib/date-utils.ts` for examples and documentation.
