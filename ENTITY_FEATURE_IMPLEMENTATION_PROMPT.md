# Entity Feature Implementation Prompt

Use this prompt when implementing new entity features that require full CRUD operations and data table functionality.

## Implementation Requirements

I need you to implement a complete entity management feature following the established patterns in this codebase. Here are the specific requirements:

### 1. Database Analysis
- Analyze the entity's database schema from `@apps/web/src/utils/supabase/database.types.ts`
- Identify all fields, relationships, and constraints
- Document foreign key relationships and reverse relationships
- Understand the entity's lifecycle and status fields

### 2. Feature Structure Implementation
Create the complete feature folder structure in `/apps/web/src/features/[entity-name]/`:

```
/features/[entity-name]/
├── actions/           # Server actions using next-safe-action
│   ├── create[Entity].ts
│   ├── update[Entity].ts  
│   ├── delete[Entity].ts
│   └── get[Entity].ts (if needed)
├── components/        # React components
│   ├── [entity]-form.tsx           # Universal form for create/edit
│   ├── [entity]-table.tsx          # Data table implementation
│   ├── [entity]-content.tsx        # Main content wrapper
│   └── [additional components]
├── layout/            # Header components
│   ├── [entity]-header.tsx         # List page header
│   ├── [entity]-add-header.tsx     # Add page header
│   ├── [entity]-detail-header.tsx  # Detail page header
│   └── [entity]-edit-header.tsx    # Edit page header
├── queries/           # React Query hooks
│   └── use[Entities].ts            # All query hooks
└── types/             # TypeScript types & validation
    └── [entity].ts                 # Zod schemas and types
```

### 3. Universal Data Table Integration
Implement the data table using the `UniversalDataTable` component:

- Create TanStack table columns with proper cell renderers
- Use `universalColumnHelper` for filter configuration
- Implement server-side filtering, pagination, and sorting
- Create optimized query that combines table data with faceted filter counts
- Support row actions (view, edit, delete) and bulk operations
- Handle loading states and empty states properly

**Required Filter Types:**
- Text filters: `first_name`, `last_name`, `email` (contains, does not contain, is, is not)
- Option filters: Foreign key relationships (is any of, is none of, is empty, is not empty)
- Date filters: Date fields (is, is before, is after, is between)
- Boolean filters: Boolean fields (is true, is false)

### 4. CRUD Operations Implementation

#### Server Actions Pattern
All server actions must follow this pattern:
- Use `next-safe-action` with `actionClient`
- Include comprehensive Zod input validation
- Authenticate user session
- Implement proper error handling
- Revalidate relevant cache paths
- Return structured responses with success/error states

#### Required Actions:
- **Create**: Validate uniqueness constraints, handle optional fields as null
- **Update**: Check entity exists, validate constraints excluding current record
- **Delete**: Soft delete if supported, otherwise hard delete with confirmation
- **Get**: Fetch with proper joins for related data

### 5. Type Safety & Validation
Create comprehensive Zod schemas in `types/[entity].ts`:

- Reusable validation utilities for common field types
- Separate schemas for create, update, and form operations
- Proper field validation (lengths, patterns, formats)
- Handle optional vs required fields correctly
- Export TypeScript types using `z.infer`

### 6. Query Management
Implement React Query hooks with proper patterns:

- Hierarchical query keys for cache management
- Optimized queries combining table data + faceted counts
- Proper cache invalidation on mutations
- Server-side prefetching helpers
- Configure appropriate staleTime values
- Handle loading and error states

### 7. Form Implementation
Create a universal form component that:

- Uses TanStack Form for client-side form management
- Supports both create and edit modes
- Integrates with Zod validation schemas
- Provides real-time field validation
- Handles conditional fields based on mode
- Manages form state and submissions properly

### 8. Routing & Pages
Implement these page routes following the prefetch pattern:

- `/dashboard/[entities]/` - List view with data table
- `/dashboard/[entities]/add/` - Create new entity
- `/dashboard/[entities]/[id]/` - Entity detail view  
- `/dashboard/[entities]/[id]/edit/` - Edit entity

**Required Page Pattern:**
```typescript
export default async function Page() {
  const queryClient = new QueryClient();
  const session = await getUser(); // Get session once at top level
  
  await Promise.all([
    // Prefetch all required queries in parallel
    queryClient.prefetchQuery(queries.mainData()),
    queryClient.prefetchQuery(queries.filterOptions()),
  ]);
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout headers={[<EntityHeader />]}>
        <EntityContent />
      </MainLayout>
    </HydrationBoundary>
  );
}
```

### 9. Advanced Features to Include

#### Filtering System
- Implement comprehensive server-side filtering
- Support all filter operators per field type
- Combine multiple filters with proper SQL logic
- Handle faceted data for option filters

#### Performance Optimizations  
- Single optimized query for table data + faceted counts
- Proper React Query cache management
- Server-side prefetching for initial loads
- Debounced search inputs where applicable

#### User Experience
- Loading skeletons for all async states
- Error boundaries and fallbacks  
- Confirmation dialogs for destructive actions
- Toast notifications for action feedback
- Responsive design for mobile compatibility

### 10. Integration Requirements

#### Authentication & Permissions
- Check user session in all server actions
- Validate user permissions for operations
- Pass session data down from page level
- Handle unauthorized access gracefully

#### Database Operations
- Use Supabase client with proper type safety
- Implement proper error handling for DB operations
- Handle unique constraint violations
- Use transactions for related operations

#### UI Consistency
- Follow existing component patterns in `src/components/`
- Use `cn()` utility for className composition
- Implement proper loading and error states
- Match existing styling and spacing patterns

## Success Criteria

The implementation should provide:

1. **Complete CRUD functionality** with proper validation and error handling
2. **Advanced data table** with filtering, sorting, and pagination
3. **Type-safe operations** throughout the entire feature
4. **Optimized performance** with proper caching and prefetching
5. **Consistent UI/UX** matching existing patterns
6. **Proper error handling** and loading states
7. **Responsive design** that works on all devices
8. **Comprehensive validation** on both client and server
9. **Cache management** with proper invalidation strategies
10. **Authentication integration** with session management

Follow the patterns established in the existing codebase exactly, using the same file structures, naming conventions, and implementation approaches. Do not deviate from the established patterns unless absolutely necessary for the specific entity requirements.