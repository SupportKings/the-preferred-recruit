# Data Fetching Guidelines

## Overview

The application uses a hybrid approach to data fetching with optimistic updates and targeted cache invalidation for exceptional performance.

## Core Principles

1. **Optimistic Updates First**: All mutations show immediate UI feedback
2. **Targeted Invalidation**: Only refetch affected data, never the whole page
3. **Smart Caching**: Use hierarchical query keys for surgical updates
4. **Smooth UX**: Refetch data before closing modals to prevent flashing

## Query Key Strategy

Use hierarchical keys that allow surgical cache invalidation:

```typescript
// Query key patterns for targeted updates
['feature', 'list']                    // All items list
['feature', 'list', { filter }]        // Filtered list
['feature', id]                         // Specific item
['feature', id, 'relation']            // Item's related data
['feature', 'stats']                   // Aggregate statistics
['feature', 'count']                   // Total count
['feature', 'count', status]           // Count by status
```

## Optimistic Updates Pattern

### Create Operation
```typescript
const { execute, isPending } = useServerAction(createClient, {
  onExecute: ({ input }) => {
    // 1. Optimistically add to UI immediately
    setOptimisticData(prevData => [...prevData, { 
      ...input, 
      id: 'temp-id', 
      pending: true 
    }]);
  },
  onSuccess: async ({ data }) => {
    toast.success("Client created successfully");
    
    // 2. Targeted invalidation - ONLY what changed
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['clients', 'list'] }),
      queryClient.invalidateQueries({ queryKey: ['clients', data.id] }),
      queryClient.invalidateQueries({ queryKey: ['clients', 'stats'] }),
      // DON'T invalidate unrelated features
    ]);
    
    // 3. Wait for data to load before closing modal
    await new Promise(resolve => setTimeout(resolve, 100));
    closeModal();
  },
  onError: ({ error }) => {
    // Revert optimistic update
    setOptimisticData(prevData => 
      prevData.filter(item => item.id !== 'temp-id')
    );
  }
});
```

### Update Operation
```typescript
const updateClientStatus = useServerAction(updateStatus, {
  onExecute: ({ input }) => {
    // Optimistically update the specific item
    queryClient.setQueryData(['clients', input.id], old => ({
      ...old,
      status: input.status
    }));
  },
  onSuccess: async ({ data }) => {
    // Only invalidate queries affected by status change
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['clients', data.clientId] }),
      // Lists filtered by status
      queryClient.invalidateQueries({ 
        queryKey: ['clients', 'list', { status: data.oldStatus }] 
      }),
      queryClient.invalidateQueries({ 
        queryKey: ['clients', 'list', { status: data.newStatus }] 
      }),
      // Dashboard stats if they show status counts
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'client-stats'] }),
    ]);
  },
  onError: ({ error, input }) => {
    // Revert the specific item
    queryClient.invalidateQueries({ queryKey: ['clients', input.id] });
  }
});
```

### Delete Operation
```typescript
const deleteItem = useServerAction(deleteAction, {
  onExecute: ({ input }) => {
    // Optimistically remove from list
    queryClient.setQueryData(['items', 'list'], (old) => 
      old?.filter(item => item.id !== input.id)
    );
  },
  onSuccess: async ({ data }) => {
    // Only invalidate affected counts and stats
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['items', 'count'] }),
      queryClient.invalidateQueries({ queryKey: ['items', 'stats'] }),
      queryClient.removeQueries({ queryKey: ['items', data.deletedId] }),
    ]);
  },
  onError: ({ error }) => {
    // Refetch the list to restore
    queryClient.invalidateQueries({ queryKey: ['items', 'list'] });
  }
});
```

## What NOT to Invalidate

When updating data, avoid invalidating:
- **Other features**: Don't refetch teams when updating clients
- **Navigation menus**: Unless count badges need updating
- **User profile**: Unless directly affected by the change
- **Unrelated lists**: Don't refetch all lists when updating filtered view
- **Static content**: Layout, configuration, etc.

## Modal Closing Pattern

Always refetch affected data BEFORE closing modals:

```typescript
const handleModalSuccess = async (data) => {
  // 1. Show success feedback
  toast.success("Changes saved");
  
  // 2. Targeted refetch - ONLY affected data
  await Promise.all([
    // The specific table/list
    queryClient.invalidateQueries({ queryKey: ['clients', 'list'] }),
    
    // Conditional invalidations
    data.statusChanged && queryClient.invalidateQueries({ 
      queryKey: ['clients', 'count', data.status] 
    }),
    
    data.teamId && queryClient.invalidateQueries({ 
      queryKey: ['teams', data.teamId, 'members'] 
    }),
  ].filter(Boolean)); // Remove falsy values
  
  // 3. Small delay for data to load
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // 4. Close modal - background data is fresh
  setModalOpen(false);
};
```

## React Query with Supabase Realtime

### When to Use Realtime
Use React Query with Supabase Realtime when the data:
- Is shared across multiple pages/components
- Changes frequently
- Requires immediate synchronization across users
- Involves collaborative features

### Realtime Implementation
```typescript
export function TaskList() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  // Query for tasks
  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  })

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          // Targeted cache update based on event type
          if (payload.eventType === 'INSERT') {
            queryClient.setQueryData(['tasks'], (old: Task[]) => 
              [...old, payload.new]
            )
          } else if (payload.eventType === 'UPDATE') {
            // Only update the specific item
            queryClient.setQueryData(['tasks'], (old: Task[]) =>
              old.map(task => task.id === payload.new.id ? payload.new : task)
            )
          } else if (payload.eventType === 'DELETE') {
            // Remove the specific item
            queryClient.setQueryData(['tasks'], (old: Task[]) =>
              old.filter(task => task.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, supabase])
}
```

## Performance Best Practices

### 1. Use Exact Matching
```typescript
// Prevent parent query invalidation
await queryClient.invalidateQueries({ 
  queryKey: ['items', id],
  exact: true  // Only this specific query
});
```

### 2. Batch Related Updates
```typescript
// Group related invalidations
await Promise.all([
  queryClient.invalidateQueries({ queryKey: ['items', 'list'] }),
  queryClient.invalidateQueries({ queryKey: ['items', 'count'] }),
  queryClient.invalidateQueries({ queryKey: ['items', 'stats'] }),
]);
```

### 3. Use setQueryData for Immediate Updates
```typescript
// Instantly update cache without refetch
queryClient.setQueryData(['items', id], newData);
```

### 4. Conditional Invalidation
```typescript
// Only invalidate if condition is met
const invalidations = [
  queryClient.invalidateQueries({ queryKey: ['items', 'list'] }),
  hasStatusChange && queryClient.invalidateQueries({ queryKey: ['items', 'stats'] }),
  affectsTeam && queryClient.invalidateQueries({ queryKey: ['teams', teamId] }),
].filter(Boolean);

await Promise.all(invalidations);
```

## Server Actions Best Practices

```typescript
'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const UpdateSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'completed', 'cancelled'])
})

export async function updateItemStatus(data: unknown) {
  const validated = UpdateSchema.parse(data)
  const supabase = await createClient()
  
  const { data: item, error } = await supabase
    .from('items')
    .update({ status: validated.status })
    .eq('id', validated.id)
    .single()
    
  if (error) {
    throw new Error('Failed to update item')
  }
  
  // Return data that helps with cache invalidation
  return {
    ...item,
    oldStatus: validated.status, // For targeted invalidation
  }
}
```

## Common Patterns

### List with Filters
```typescript
// Query keys for filtered lists
const filters = { status: 'active', team: teamId }
const queryKey = ['clients', 'list', filters]

// Invalidate only affected filters
onSuccess: async ({ data }) => {
  if (data.statusChanged) {
    await Promise.all([
      queryClient.invalidateQueries({ 
        queryKey: ['clients', 'list', { status: data.oldStatus }] 
      }),
      queryClient.invalidateQueries({ 
        queryKey: ['clients', 'list', { status: data.newStatus }] 
      }),
    ])
  }
}
```

### Related Data Updates
```typescript
// When updating a client, also update related data
onSuccess: async ({ data }) => {
  await Promise.all([
    // The client itself
    queryClient.invalidateQueries({ queryKey: ['clients', data.id] }),
    
    // Related projects
    queryClient.invalidateQueries({ 
      queryKey: ['projects', { clientId: data.id }] 
    }),
    
    // Team members if client assignment changed
    data.teamChanged && queryClient.invalidateQueries({ 
      queryKey: ['teams', data.teamId, 'members'] 
    }),
  ])
}
```

## Testing Considerations

- Test optimistic updates with network delays
- Verify cache invalidation is targeted correctly
- Test error recovery and rollback
- Ensure no unnecessary refetches occur
- Verify modal closing behavior with slow connections