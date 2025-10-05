# UX/UI Standards

## Loading States

### Use Skeleton Loading by Default

**MANDATORY: Always use skeleton loading states on ALL page loads. Never use generic "Loading..." text unless explicitly instructed otherwise.**

#### Implementation Requirements
- **Every route must have a `loading.tsx` file** that shows skeleton placeholders matching the page layout
- **All async data fetching** must show skeletons while loading
- **Component-level loading** must use skeleton patterns, not spinners or text

#### When to Use Skeletons
- **Default for all pages**: Every page that loads data MUST show skeleton placeholders
- **Lists and tables**: Show skeleton rows that match the expected data structure
- **Cards and content blocks**: Display skeleton shapes that match the actual content layout
- **Forms**: Show skeleton inputs/labels while form structure loads
- **Navigation**: Show skeleton menu items while loading user-specific navigation

#### Benefits of Skeleton Loading
- Prevents layout shift when content loads
- Provides better perceived performance
- Shows users what to expect
- Maintains visual hierarchy during loading
- Creates a smoother, more professional experience

## Form Labels and Required Fields

### Required Field Indicators
When adding required field asterisks to labels, use a single space between the label text and the asterisk, and remove `ml-1` class to avoid extra spacing:

```typescript
// ✅ CORRECT - Single space, no margin class
<Label htmlFor="field">
  Field Name <span className="text-red-500">*</span>
</Label>

// ❌ WRONG - Extra spacing looks bad
<Label htmlFor="field">
  Field Name
  <span className="text-red-500 ml-1">*</span>
</Label>

// ❌ WRONG - No space looks cramped  
<Label htmlFor="field">
  Field Name<span className="text-red-500">*</span>
</Label>
```

#### Implementation Pattern
```typescript
// ✅ CORRECT - Use skeleton loading
if (loading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" /> {/* Title */}
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-24 w-full" /> {/* Card 1 */}
        <Skeleton className="h-24 w-full" /> {/* Card 2 */}
        <Skeleton className="h-24 w-full" /> {/* Card 3 */}
      </div>
    </div>
  );
}

// ❌ WRONG - Generic loading text
if (loading) {
  return <div>Loading...</div>;
}
```

#### Exception Cases
Only use descriptive loading text when:
- The operation has distinct phases that need explanation
- There's a long-running process that benefits from status updates
- The user explicitly needs reassurance about what's happening
- You're specifically instructed to use loading text

Example of acceptable loading text:
```typescript
// OK for multi-step operations with status updates
if (loading) {
  return (
    <div className="text-center space-y-2">
      <Spinner />
      <p>Connecting to server...</p>
      <p className="text-sm text-muted-foreground">
        This may take up to 30 seconds
      </p>
    </div>
  );
}
```

## Modal and Dialog Behavior

When implementing actions in modals or dialogs, follow these standards for optimal user experience:

### Modal Positioning
- **All modals must have `ml-20` class** to account for the left navigation sidebar
- This ensures modals don't overlap with or get hidden behind the navigation
- Apply to the DialogContent component: `<DialogContent className="... ml-20">`

### 1. No animations or transitions on modals
- Always add `!duration-0 !transition-none` to remove all timing effects
- Add `data-[state=open]:animate-none data-[state=closed]:animate-none` to disable open/close animations
- Never use ease-in, ease-out, or any transition effects on modals
- Modals should appear and disappear instantly for better UX
- Example: `className="... !duration-0 !transition-none data-[state=open]:animate-none data-[state=closed]:animate-none"`

### 2. Keep dialogs open during operations
- Never close the dialog until the action is complete AND data has been refetched
- This prevents confusion and ensures users see the result of their action
- **IMPORTANT**: Do NOT use `AlertDialogAction` from Radix UI for async operations - it automatically closes the dialog when clicked
- Use regular `Button` component instead to maintain control over when the dialog closes

### 3. Show loading states on buttons
- Display a spinner icon and "Loading..." or action-specific text (e.g., "Saving...", "Swapping...")
- Disable all interactive elements during the operation
- Example: `<div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />`

### 4. Handle errors within the dialog
- Show error messages inside the dialog, not as toasts
- Provide a "Try Again" button for retryable operations
- Keep the dialog open so users can read the error and decide what to do

### 5. Success handling
- Only close the dialog after successful completion AND data refresh
- Avoid success toasts if the dialog closing itself indicates success
- If showing success state, make it brief before closing

### 6. Example implementation pattern:
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    // Perform the action
    await performAction();
    // Wait for data to be refetched
    await queryClient.invalidateQueries(['query-key']);
    // Only close on complete success
    onClose();
  } catch (err) {
    // Show error in dialog, not as toast
    setError(err.message || 'Operation failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

// In the dialog JSX:
{error && (
  <div className="p-3 bg-red-50 border border-red-200 rounded">
    <p className="text-red-800">{error}</p>
  </div>
)}

// IMPORTANT: Use Button, not AlertDialogAction for async operations
<AlertDialogFooter>
  <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
  
  {/* Use regular Button to prevent automatic closing */}
  <Button 
    onClick={(e) => {
      e.preventDefault();
      handleAction();
    }}
    disabled={isLoading}
    type="button"
    className="bg-blue-600 text-white hover:bg-blue-700"
  >
    {isLoading ? (
      <>
        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        <span>Processing...</span>
      </>
    ) : error ? (
      "Try Again"
    ) : (
      "Confirm"
    )}
  </Button>
</AlertDialogFooter>
```

This pattern ensures:
- Users always know what's happening (loading states)
- Errors are clearly communicated with retry options
- No premature dialog closing that could lose user context
- Consistent, predictable behavior across all modals

## Common Pitfall: AlertDialogAction Auto-Close

**Problem**: `AlertDialogAction` from Radix UI automatically closes the dialog when clicked, even if you have async operations that need to complete.

**Solution**: For any action button that triggers async operations (API calls, database operations, etc.), use a regular `Button` component instead:

```typescript
// ❌ WRONG - Dialog will close immediately
<AlertDialogAction onClick={async () => {
  await performAsyncOperation(); // Dialog already closed!
}}>
  Confirm
</AlertDialogAction>

// ✅ CORRECT - You control when dialog closes
<Button onClick={async (e) => {
  e.preventDefault();
  setIsLoading(true);
  await performAsyncOperation();
  await refetchData();
  onClose(); // Close only after everything completes
}}>
  Confirm
</Button>
```

Only use `AlertDialogAction` for simple, synchronous actions where you want the dialog to close immediately (like a simple confirmation that doesn't require any async work).

## Dialog and Popover Interactions

### Critical Edge Cases

#### 1. Dialog Opening from Popover
```typescript
// ❌ Incorrect: Dialog won't open properly
<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>
    <Dialog>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent>Content</DialogContent>
    </Dialog>
  </PopoverContent>
</Popover>

// ✅ Correct: Use setTimeout or modal={false}
<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>
    <Dialog>
      <DialogTrigger onClick={() => {
        setTimeout(() => {
          // Dialog open logic here
        }, 0)
      }}>
        Open Dialog
      </DialogTrigger>
      <DialogContent>Content</DialogContent>
    </Dialog>
  </PopoverContent>
</Popover>

// ✅ Alternative: Use modal={false}
<Dialog modal={false}>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>Content</DialogContent>
</Dialog>
```

#### 2. Nested Dialogs
```typescript
// ❌ Avoid: Nested dialogs
<Dialog>
  <DialogContent>
    <Dialog> {/* This will cause issues */}
      <DialogContent>
        ...
      </DialogContent>
    </Dialog>
  </DialogContent>
</Dialog>

// ✅ Correct: Use a single dialog with proper content organization
<Dialog>
  <DialogContent>
    <div className="space-y-4">
      {/* Your content here */}
    </div>
  </DialogContent>
</Dialog>
```

#### 3. Popovers in Dialogs
```typescript
// ❌ Avoid: Popover directly in dialog
<Dialog>
  <DialogContent>
    <Popover>
      <PopoverTrigger>Trigger</PopoverTrigger>
      <PopoverContent>Content</PopoverContent>
    </Popover>
  </DialogContent>
</Dialog>

// ✅ Correct: Use portal for popovers in dialogs
<Dialog>
  <DialogContent>
    <Popover>
      <PopoverTrigger>Trigger</PopoverTrigger>
      <PopoverContent portal>Content</PopoverContent>
    </Popover>
  </DialogContent>
</Dialog>
```

### Important Notes

#### 1. Top Layer Management
- Dialogs and popovers are the only elements that can exist in the top layer
- Be careful with z-index management when using multiple top-layer elements
- Always use portals for nested top-layer elements

#### 2. Modal Behavior
- Use `modal={false}` when you need non-modal behavior
- For complex interactions, consider using `setTimeout` to handle timing issues
- Always test dialog interactions on different screen sizes

## Button Icon Spacing

### Icon and Text Alignment

**NEVER add margin between icon and text in buttons. Icons and text should be adjacent without spacing.**

#### Correct Pattern
```typescript
// ✅ CORRECT - No margin between icon and text
<Button>
  <Save className="h-4 w-4" />
  Save Credentials
</Button>

// ✅ CORRECT - Icon only (no text)
<Button>
  <Save className="h-4 w-4" />
</Button>
```

#### Incorrect Pattern
```typescript
// ❌ WRONG - Don't add mr-2 or any margin class
<Button>
  <Save className="h-4 w-4 mr-2" />
  Save Credentials
</Button>
```

#### Why No Spacing?
- Cleaner, more compact button appearance
- Consistent with modern UI patterns
- Better visual balance
- Prevents excessive button width

## Form Label Styling

### Required Field Asterisks

When adding red asterisks to form labels to indicate required fields, **always set `gap-0`** to remove unwanted spacing:

```typescript
// ❌ WRONG - Creates unwanted gap between text and asterisk
<Label className="text-base font-medium">
  Connection Name<span className="text-red-500">*</span>
</Label>

// ✅ CORRECT - Override the default gap-2 with gap-0
<Label className="text-base font-medium gap-0">
  Connection Name<span className="text-red-500">*</span>
</Label>
```

**Why this is important:**
- The workspace's Label component has a default `gap-2` class
- This creates unwanted spacing between the text and the red asterisk
- Using `gap-0` overrides the default and makes the asterisk appear directly next to the text
- This creates a more professional and visually consistent appearance

**Always remember:** Red asterisks for required fields must be positioned directly adjacent to the field name with no gap.

## User Feedback System

### Two-Tier Feedback Hierarchy

The application uses a sophisticated two-tier feedback system with optimistic updates for exceptional user experience:

#### When to Use Each Pattern
- **Toast Notifications**: Quick saves, updates, non-critical operations, success confirmations
- **Error Modals**: Authentication failures, payment errors, data corruption, API failures, permission denials
- **Optimistic Updates**: All create/update/delete operations for instant UI feedback

### Toast Notifications (Minor Actions)

For non-critical actions that don't require user intervention:

```typescript
// Simple success/error toasts with optimistic updates
const { execute, isPending } = useServerAction(updateAction, {
  onExecute: ({ input }) => {
    // Optimistically update ONLY the specific item
    updateItemOptimistically(input.id, input.changes);
  },
  onSuccess: async ({ data }) => {
    toast.success("Changes saved successfully");
    // Surgical invalidation - only the specific item
    await queryClient.invalidateQueries({ 
      queryKey: ['items', input.id],
      exact: true  // Don't refetch parent queries
    });
  },
  onError: ({ error }) => {
    // Revert optimistic changes
    revertOptimisticUpdate();
    toast.error(error.serverError || "Failed to save changes");
  }
});
```

#### Toast Message Standards
- **Create**: "Item created successfully"
- **Update**: "Changes saved"
- **Delete**: "Item removed"
- **Copy**: "Copied to clipboard"
- **Validation**: "Please check the form for errors"
- **Network**: "Connection error. Please try again"

### Error Modal Pattern (Critical Failures)

For errors requiring user attention and potential retry:

```typescript
const { execute, isPending } = useServerAction(criticalAction, {
  onExecute: ({ input }) => {
    applyOptimisticUpdate(input);
  },
  onSuccess: async ({ data }) => {
    toast.success("Operation completed");
    // Targeted refetch - only affected data
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['affected-feature'] }),
    ]);
    closeModal();
  },
  onError: ({ error }) => {
    revertOptimisticUpdate();
    
    // Show detailed error modal
    showErrorModal({
      title: "Operation Failed",
      message: "The operation could not be completed. Please try again.",
      details: generateErrorReport(error, context),
      actions: [
        { label: "Retry", onClick: () => execute(params) },
        { label: "Copy Error Report", onClick: copyErrorReport }
      ],
      footer: "If this issue persists, contact your administrator."
    });
  }
});
```

#### Error Modal Requirements
1. **Clear Title**: Descriptive error heading
2. **User-Friendly Message**: Non-technical explanation
3. **Retry Action**: Button to retry the failed operation
4. **Copy Error Report**: Button to copy technical details
5. **Administrator Notice**: Instructions for escalation
6. **Non-Dismissible**: Requires user acknowledgment

### Optimistic Updates Pattern

Always apply optimistic updates for instant feedback:

```typescript
// Modal closing with targeted refetch
const handleModalSuccess = async (data) => {
  // 1. Show success feedback
  toast.success("Changes saved");
  
  // 2. Targeted refetch - ONLY what this modal affected
  await Promise.all([
    // The table/list this modal was opened from
    queryClient.invalidateQueries({ queryKey: ['clients', 'list'] }),
    
    // Any count badges that might have changed
    data.statusChanged && queryClient.invalidateQueries({ 
      queryKey: ['clients', 'count', data.status] 
    }),
  ].filter(Boolean));
  
  // 3. Small delay to ensure targeted data is loaded
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // 4. NOW safe to close modal - only relevant data refreshed
  setModalOpen(false);
};
```

### Feedback Best Practices

1. **Be Specific**: Error messages should clearly indicate what went wrong
2. **Be Actionable**: Always provide a way to recover (retry, contact support, etc.)
3. **Be Timely**: Show feedback immediately via optimistic updates
4. **Be Consistent**: Use the same patterns throughout the application
5. **Be Non-Intrusive**: Don't block the UI unnecessarily with toasts
6. **Target Cache Invalidation**: Only refetch specific affected data, never whole pages