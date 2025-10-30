# New Global Components

This document tracks newly created global/reusable components that should be used across the application.

## UniversityJobLookup

**Location**: `apps/web/src/features/athletes/components/lookups/university-job-lookup.tsx`

**Purpose**: A unified, searchable dropdown component for selecting university jobs (coach positions) with infinite scroll support.

**Features**:
- **Server-side search** with client-side filtering for nested fields (coach name, university, etc.)
- **Infinite scroll** pagination - loads 50 records at a time
- **Real-time search** across multiple fields:
  - Coach name
  - Job title
  - Work email
  - University name, city, and state
  - Program gender
- **University filtering** - optionally filter jobs by specific university
- **Smart display format**: Shows "Coach Name - Job Title • Gender • University Name"
- **Email subtitle**: Displays work email below the main label for context

**Technical Details**:
- Built on top of `ServerSearchCombobox` component
- Uses `searchUniversityJobs` server action for data fetching
- Handles both browsing mode (server-side pagination) and search mode (client-side filtering)
- Prevents duplicate keys when appending results during infinite scroll
- Fetches up to 500 records when searching to enable comprehensive client-side filtering

**Usage**:
```tsx
import { UniversityJobLookup } from "@/features/athletes/components/lookups/university-job-lookup";

<UniversityJobLookup
  label="Coach/Job (Optional)"
  value={formData.university_job_id || ""}
  onChange={(value) => setFormData({ ...formData, university_job_id: value || null })}
  universityId={selectedUniversityId} // Optional: filter by university
  required={false}
  disabled={false}
/>
```

**Used In**:
- Athlete Applications → Add Reply Modal
- Athlete Applications → Add Campaign Lead Modal

**Migration Note**: This component replaces the old custom Popover + Command + Input implementations that were previously used in the campaign lead modal. Both modals now use this unified component for consistency.

**Related Files**:
- Action: `apps/web/src/features/university-jobs/actions/searchUniversityJobs.ts`
- Base Component: `apps/web/src/components/server-search-combobox.tsx`

---

## UniversityLookup

**Location**: `apps/web/src/components/lookups/university-lookup.tsx`

**Purpose**: A global, searchable dropdown component for selecting universities with infinite scroll support.

**Features**:
- **Server-side search** with pagination
- **Infinite scroll** - loads 50 universities at a time
- **Real-time search** across multiple fields:
  - University name
  - City
  - State
- **Smart display format**: Shows "University Name • City, State" or fallback variations
- **Fully integrated** with `ServerSearchCombobox` for consistent UX

**Technical Details**:
- Built on top of `ServerSearchCombobox` component
- Uses `searchUniversities` server action for data fetching
- Server-side pagination with proper `hasMore` flag calculation
- Prevents duplicate keys when appending results during infinite scroll
- Sorted alphabetically by university name

**Usage**:
```tsx
import { UniversityLookup } from "@/components/lookups/university-lookup";

<UniversityLookup
  label="University (Optional)"
  value={formData.university_id || ""}
  onChange={(value) => setFormData({
    ...formData,
    university_id: value || null,
    program_id: null // Reset dependent fields
  })}
  placeholder="Search for a university..."
  required={false}
  disabled={false}
/>
```

**Used In**:
- Athlete Applications → Add Campaign Lead Modal

**Migration Note**: This component replaces the old static `Select` dropdown that required pre-fetching all universities from the server. The new implementation uses server-side search and pagination, reducing initial load time and improving scalability.

**Related Files**:
- Action: `apps/web/src/features/universities/actions/searchUniversities.ts`
- Base Component: `apps/web/src/components/server-search-combobox.tsx`

---

*Last Updated: 2025-01-30*
