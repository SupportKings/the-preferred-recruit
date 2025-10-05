# Code Quality Standards

## 🚨 CRITICAL TYPING AND LINTING REQUIREMENTS 🚨

### Mandatory Standards
- **ALWAYS add explicit types** to all function parameters, variables, and return types
- Fix all linter and TypeScript errors immediately - don't leave them for the user to fix
- When making changes to multiple files, check each one for type errors
- NEVER run global `bun check` (will timeout!) - Use `npx biome check --write <file>` and `bun check-types` after making changes

## TypeScript Best Practices

**NEVER use `any` or `unknown` types**. Always use proper, specific typing to maintain type safety:

- **Avoid `any`**: Completely disables type checking
- **Avoid `unknown`**: While safer than `any`, it still requires runtime checks and reduces type safety
- **Instead**: Define proper interfaces, types, or use specific built-in types

```typescript
// ❌ WRONG - Disables type checking
function process(data: any): any {
  return data.someProperty;
}

const items = data.map((item: any) => item.id);

// ✅ CORRECT - Use proper types
function process(data: Record<string, string | number | boolean>): string | number | boolean | undefined {
  return data.someProperty;
}

const items = data.map((item: { id: string }) => item.id);

// ✅ BETTER - Use specific interfaces when structure is known
interface DataItem {
  id: string;
  name: string;
}

function process(data: DataItem[]): string[] {
  return data.map(item => item.id);
}
```

**Error Handling**: Never use `any` in catch blocks:

```typescript
// ❌ WRONG
try {
  await operation();
} catch (error: any) {
  console.log(error.message); // Could fail if error is not Error instance
}

// ✅ CORRECT
try {
  await operation();
} catch (error) {
  // TypeScript infers error as 'any' in catch blocks, but we handle it safely
  const message = error instanceof Error ? error.message : String(error);
  console.log(message);
}
```

**Validation Functions**: Use specific types for input validation:

```typescript
// ❌ WRONG
function validateNumber(value: any): number {
  return Number(value);
}

// ✅ CORRECT - Use union types for expected inputs
function validateNumber(value: string | number | null | undefined): number {
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    throw new Error(`Invalid number value: ${value}`);
  }
  return num;
}
```

## Number Validation

Always use `Number.isNaN()` instead of `isNaN()`:

```typescript
// ❌ WRONG - Can give unexpected results
if (isNaN(value)) {
  throw new Error('Invalid number');
}

// ✅ CORRECT - More reliable
if (Number.isNaN(Number(value))) {
  throw new Error('Invalid number');
}
```

## Non-Null Assertions

Avoid non-null assertions (`!`) - use proper type checking instead:

```typescript
// ❌ WRONG - Could cause runtime errors
const result = data.find(item => item.id === targetId)!;
return result.name;

// ✅ CORRECT - Safe with type checking
const result = data.find(item => item.id === targetId);
if (!result) {
  throw new Error('Item not found');
}
return result.name;

// ✅ ALTERNATIVE - Use type assertion when you're certain
const result = data.find(item => item.id === targetId) as NonNullable<typeof result>;
```

## Accessibility Standards

Always use semantic HTML elements instead of generic `<div>` elements:

```typescript
// ❌ WRONG - Poor accessibility
<div className="card">
  <div className="header">Title</div>
  <div className="content">Content here</div>
  <div className="actions">
    <div onClick={handleClick}>Click me</div>
  </div>
</div>

// ✅ CORRECT - Semantic and accessible
<article className="card">
  <header className="header">
    <h2>Title</h2>
  </header>
  <section className="content">
    <p>Content here</p>
  </section>
  <footer className="actions">
    <button onClick={handleClick}>Click me</button>
  </footer>
</article>
```

**Common semantic elements to use:**
- `<article>` - Self-contained content
- `<section>` - Distinct sections of content  
- `<header>` - Page or section headers
- `<main>` - Main content area
- `<nav>` - Navigation sections
- `<aside>` - Sidebar content
- `<footer>` - Page or section footers
- `<button>` - Interactive buttons (never `<div>` with click handlers)

## Form Labels and Controls
Always associate labels with their form controls using `htmlFor` and `id` attributes:

```typescript
// ✅ CORRECT - Proper label association
<label htmlFor="category-filter" className="text-sm font-medium mb-1 block">
  Category
</label>
<Select value={filters.category} onValueChange={handleCategoryChange}>
  <SelectTrigger id="category-filter" className="w-full">
    <SelectValue placeholder="All Categories" />
  </SelectTrigger>
</Select>

// ✅ CORRECT - Input with label association
<label htmlFor="search-filter" className="text-sm font-medium mb-1 block">
  Search
</label>
<Input
  id="search-filter"
  placeholder="Search items..."
  value={filters.search}
  onChange={handleSearchChange}
/>
```

## Import Organization

Keep imports organized and separated:

```typescript
// ✅ CORRECT - Organized imports
import { createClient } from "@/utils/supabase/server";

import { NextResponse } from "next/server";
```

## Pre-commit Checklist

Before committing code, ensure:

1. ✅ No `any` types used - use specific types matching your data source
2. ✅ Proper error handling in catch blocks - prefix unused error variables with underscore
3. ✅ `Number.isNaN()` used instead of `isNaN()`
4. ✅ No non-null assertions (`!`) without proper justification
5. ✅ Semantic HTML elements used for accessibility
6. ✅ All imports properly organized
7. ✅ Run `npx biome check` and fix reported issues
8. ✅ No array indices as React keys - use stable identifiers
9. ✅ useEffect dependencies are correct - avoid functions as deps unless memoized
10. ✅ Database types match state types (e.g., `number` not `string` for IDs)
11. ✅ Skeleton components used instead of "Loading..." text
12. ✅ Run `NODE_OPTIONS="--max-old-space-size=8192" bun build` to verify

## Common Type Patterns

**For Request Body in API Routes:**
```typescript
// ✅ CORRECT - Type the expected body structure
export async function POST(request: NextRequest) {
  let body: { action?: string; reason?: string };
  try {
    body = await request.json();
  } catch (_jsonError) {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }
  
  // Validate and normalize
  const action = String(body.action || "").trim();
  const reason = String(body.reason || "").trim();
}
```

**For Database Query Results:**
```typescript
// ✅ CORRECT - Match Supabase return types
const { data: items } = await supabase
  .from("items")
  .select("id, name")
  .order("name");

// Type should match what Supabase returns
const [availableItems, setAvailableItems] = useState<
  { id: number; name: string | null }[]
>([]);

setAvailableItems(items || []);
```

**For API responses:**
```typescript
// Use generic types for flexible, type-safe responses
interface ApiResponse<TData> {
  success: boolean;
  data: TData;
  error?: string;
}

// For database records with constrained types
type DatabaseRecord = Record<string, string | number | boolean | null>;
```

**For complex objects with known structure:**
```typescript
// ✅ Use explicit interfaces for known structures
interface ItemRow {
  id: string;
  name: string;
}

const processData = (items: ItemRow[]) => {
  return items.map(item => ({
    id: item.id,
    name: item.name,
  }));
};
```

## Advanced Type Safety Patterns

**Use explicit interfaces and type guards** - avoid `any` and `unknown` annotations:

```typescript
// Define explicit interfaces for known structures
interface HasProperty {
  property: string;
}

// Generic type guard for safe property access
function hasStringProp<K extends string>(
  value: object | null,
  key: K
): value is Record<K, string> {
  return value !== null && key in value && typeof (value as any)[key] === 'string';
}

// Process data with safe narrowing
function processData(data: object | null): string | undefined {
  if (hasStringProp(data, 'property')) {
    return data.property; // TypeScript knows this is safe
  }
  return undefined;
}

// Generic typed API response
interface TypedApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Concrete payload type
interface Payload {
  id: string;
  name: string;
  value: number;
}

function processApiResponse(response: TypedApiResponse<Payload>) {
  return response.data; // No type errors
}
```

**Request Body Validation Pattern**:
```typescript
import { z } from 'zod';

// ✅ CORRECT pattern for API routes with Zod validation
const requestBodySchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive()
});

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate and parse with Zod
  const parsed = requestBodySchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Use the correctly-typed result
  const { name, quantity } = parsed.data;
  // name is string, quantity is number - fully typed!
}
```

**Error Response Handling**:
```typescript
// ✅ CORRECT pattern for error responses
try {
  const response = await fetch('/api/endpoint');
  const data = await response.json();
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Define expected error structure types
  type ErrorWithCause = {
    cause: {
      responseData?: Record<string, string | number | boolean | null>;
      [key: string]: string | number | boolean | null | undefined;
    };
    message?: string;
    stack?: string;
  };
  
  // Helper type guard for safe type narrowing
  const isErrorWithCause = (err: object | null): err is ErrorWithCause => {
    return (
      err !== null &&
      typeof err === 'object' &&
      'cause' in err &&
      typeof (err as { cause?: unknown }).cause === 'object' &&
      (err as { cause?: unknown }).cause !== null
    );
  };
  
  // For complex error objects, use type guards
  if (isErrorWithCause(error)) {
    const { cause } = error;
    if (cause.responseData && typeof cause.responseData === 'object') {
      // Safe to access nested properties with known types
      const responseData = cause.responseData;
      // responseData is now typed as Record<string, string | number | boolean | null>
    }
  }
}
```

**Type-Safe Array Operations**:
```typescript
// ✅ CORRECT - Use Zod for validation and type safety
import { z } from 'zod';

// Define the item interface
interface Item {
  id: string;
  name: string;
  quantity: number;
}

// Create Zod schema for validation
const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number()
});

const itemsArraySchema = z.array(itemSchema);

// Parse and validate the data
const parseResult = itemsArraySchema.safeParse(data.items);
if (parseResult.success) {
  const validItems: Item[] = parseResult.data;
  // Use validItems with full type safety
  const processed = validItems.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity
  }));
} else {
  // Handle validation errors
  console.error('Invalid items data:', parseResult.error);
}
```

Following these standards will prevent linting errors, build failures, and maintain high code quality throughout the project.