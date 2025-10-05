# Recent Changes & Implementation Patterns

## Row-Level Security (RLS) Implementation
When querying related tables that need RLS enforcement:
- Use `!inner` joins to ensure RLS policies are respected
- Example: Related data queries must join with parent tables to inherit access control
- Table names with spaces need quotes: `"Table Name With Spaces"`

## Data Filtering Feature Pattern
Located in `/apps/web/features/[feature-name]/`:
- **Client-side filtering pattern** for optimal UX with small-to-moderate datasets (< 10,000 items)
- Fetches all data once with longer stale time (5 minutes) for reference data
- Real-time filtering without debouncing for immediate feedback
- Clear filters functionality with visual feedback for active filters
- Shared type definitions with feature-specific extensions
- Note: For larger datasets (> 10,000 items), use server-side filtering with pagination

### Filtering Strategy Decision Matrix
**Use Client-side Filtering When:**
- Dataset size is manageable (< 10,000 items)
- Reference data that changes infrequently
- Users need immediate filter feedback
- Multiple filter combinations are common

**Use Server-side Filtering When:**
- Large datasets (> 10,000 items)
- Dynamic data that changes frequently
- Complex search operations
- Pagination with server-side sorting required

### Filter UI Patterns
```typescript
// Clear filters button appears when any filters are active
const hasActiveFilters = () => {
  return filters.status !== "all" || filters.search !== "";
};

// Client-side filtering with useMemo for performance
const filteredData = React.useMemo(() => {
  return allData.filter(item => {
    if (filters.status !== "all" && item.status !== filters.status) 
      return false;
    // Additional filters...
    return true;
  });
}, [allData, filters]);
```

## Common Feature Patterns
- Implements filtering by status, search terms, and categories
- Uses React Query for data fetching with server actions
- Toast notifications via Sonner for user feedback
- Tracks timestamps for state changes
- Table styling matches project patterns with sticky headers and hover effects

## Common Patterns

### Server Actions with Supabase
```typescript
"use server";
import { createClient } from "@/utils/supabase/server";

export async function actionName() {
  const supabase = await createClient();
  // Always includes proper error handling
}
```

### React Query Hooks
- Custom hooks in `hooks/` directory use TanStack Query
- Query keys follow consistent pattern: `[feature, subfeature, filters]`
- Mutations include optimistic updates and cache invalidation

### Type Safety
- Always generate types after database changes
- Use generated types from `packages/supabase/src/types/supabase.ts`
- Cast array operations when TypeScript can't infer: `as string[]`

## Important Notes

1. **Biome Configuration**: Project uses tabs for indentation and double quotes for strings
2. **Toast Notifications**: Use `import { toast } from "sonner"` for user feedback
3. **Table Filtering**: Implement client-side filtering for better UX with small datasets
4. **Build Memory**: Use `NODE_OPTIONS="--max-old-space-size=8192"` when build fails with memory errors
5. **MCP Usage**: Available for database queries and migrations via Supabase integration
6. **React 19**: Project uses React 19 - ensure compatibility when adding new libraries