# Critical Thinking & Common Sense Best Practices

## 🚨 CRITICAL RULES - DO NOT VIOLATE 🚨

### Absolute Development Requirements
- **NEVER create mock data or simplified components** unless explicitly told to do so
- **NEVER replace existing complex components with simplified versions** - always fix the actual problem
- **ALWAYS work with the existing codebase** - do not create new simplified alternatives
- **ALWAYS find and fix the root cause** of issues instead of creating workarounds
- When debugging issues, focus on fixing the existing implementation, not replacing it
- When something doesn't work, debug and fix it - don't start over with a simple version

## 🔴 STOP AND THINK BEFORE CODING! 🔴
**CRITICAL: Analyze the requirement logically BEFORE implementing**

### The Logical Analysis Process:
1. **Understand the WHY** - Why does the user want this feature?
2. **Question the implementation** - Is the proposed solution logical?
3. **Consider edge cases** - What happens when content is short? Long? Missing?
4. **Apply real-world logic** - Would this make sense in a physical equivalent?
5. **Check for contradictions** - Does this conflict with existing patterns?

### Example: Tooltip Logic
**Requirement**: "Add tooltip to show full text"
**Logical Analysis**:
- WHY: User wants to see full text when it's cut off
- WHEN: Text is truncated (too long for container)
- LOGICAL CONCLUSION: Only show tooltip if text is actually truncated
- ILLOGICAL: Showing tooltip for text that's fully visible
- IMPLEMENTATION: Check if scrollWidth > clientWidth before showing tooltip

## ALWAYS Apply Common Sense
Before implementing any feature, ask yourself:
1. **Does this make logical sense?** - Would a human user expect this behavior?
2. **Is this necessary?** - Don't add complexity without purpose
3. **Is this the simplest solution?** - Prefer simple, obvious solutions over clever ones
4. **Would this annoy users?** - Avoid repetitive, unnecessary, or intrusive behaviors
5. **Am I thinking critically?** - Have I questioned the requirement and my approach?

## UI/UX Common Sense Rules

### Tooltips - CRITICAL RULE
**ONLY show tooltips when text is ACTUALLY truncated!**
- **Always check if text overflows before showing tooltip**
- Use refs to compare `scrollWidth > clientWidth`
- If text fits completely, NO TOOLTIP should be shown
- Showing tooltips for non-truncated text is poor UX and makes no sense

```typescript
// ✅ CORRECT - Only show tooltip when truncated
const [isTruncated, setIsTruncated] = useState(false);
const textRef = useRef<HTMLElement>(null);

useEffect(() => {
  if (textRef.current) {
    setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
  }
}, [text]);

// In JSX:
{isTruncated ? (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <p ref={textRef} className="truncate cursor-help">{text}</p>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
) : (
  <p ref={textRef} className="truncate">{text}</p>
)}

// ❌ WRONG - Always showing tooltip regardless of truncation
<Tooltip>
  <TooltipTrigger>
    <p className="truncate">{text}</p>
  </TooltipTrigger>
  <TooltipContent>{text}</TooltipContent>
</Tooltip>
```

### Loading States
- Don't show loading states for instant operations
- Don't keep loading states longer than necessary
- Show specific loading messages, not generic "Loading..."

### Modal Behavior
- Clicking outside should close modal (with confirmation if unsaved changes)
- ESC key should close modal (with confirmation if unsaved changes)
- Don't trap users in modals unnecessarily

### Form Validation
- Validate on blur or submit, not on every keystroke
- Show clear, actionable error messages
- Don't disable submit buttons without explanation

### Confirmations
- Only ask for confirmation on destructive actions
- Don't ask for confirmation on reversible actions
- Use clear language: "Delete" not "Remove", "Cancel" not "Close"

## Code Quality Common Sense

### Don't Overcomplicate
- If a simple solution works, use it
- Don't add abstraction layers without clear benefit
- Don't create wrapper components for single-use cases

### Performance
- Don't fetch data you already have
- Don't re-render components unnecessarily
- Don't make multiple API calls when one would suffice

### Error Handling
- Always handle errors gracefully
- Show user-friendly error messages
- Provide actionable next steps when possible

## Common Implementation Mistakes to AVOID

### The "Always Show" Mistake
- **Wrong**: Always showing tooltips, confirmations, or helpers
- **Right**: Show only when contextually needed
- **Think**: Would you want a waiter explaining what a fork is every time?

### The "Over-Helper" Mistake  
- **Wrong**: Adding help text, tooltips, and guides everywhere
- **Right**: Trust users' intelligence, help only where truly needed
- **Think**: Do users really need to be told what a "Save" button does?

### The "Lazy Detection" Mistake
- **Wrong**: Assuming state without checking (e.g., text is truncated)
- **Right**: Actually verify the condition exists
- **Think**: Measure, don't assume

### The "Type Assumption" Mistake
- **Wrong**: Using `any` type or assuming types without checking
- **Right**: Always use proper TypeScript types matching your data source
- **Think**: Database returns `{ id: number, title: string | null }`, not `{ id: string, title: string }`

### The "Array Index Key" Anti-Pattern
- **Wrong**: Using array index as React key in dynamic lists
- **Right**: Use index only for immutable, fixed-order lists (items never reordered, added, or removed). For dynamic lists, use stable unique IDs to preserve component identity and state across renders
- **Think**: Unstable keys cause input focus loss, animation glitches, and state corruption when list changes

### The "Generic Loading" Mistake
- **Wrong**: Using "Loading..." text everywhere
- **Right**: Choose loading pattern by latency and content:
  - **Instant (<100ms)**: No loader needed
  - **Short (100-300ms)**: Inline spinner for buttons, subtle opacity change for cards
  - **Medium (300ms-3s)**: Skeletons matching exact layout (lists, cards), shimmer for images
  - **Long (>3s)**: Progress indicators with estimated time, cancelable operations
- **Accessibility**: Use `aria-live="polite"` for status updates, maintain focus position, ensure 3:1 contrast ratio for placeholders
- **Think**: Match user expectations - skeleton for article list, spinner for form submit, progress bar for file upload

## Before Every Implementation, Ask:
1. **Have I analyzed this logically?** Step through the user journey mentally
2. **Is this the most obvious solution?** Users should be able to predict behavior
3. **Am I adding unnecessary complexity?** Simpler is almost always better
4. **Would I want to use this?** If it would annoy you, it will annoy users
5. **Is this consistent?** Similar actions should have similar behaviors
6. **Does this respect the user's time?** Don't make users wait or work unnecessarily
7. **Have I considered ALL states?** Empty, loading, error, success, partial