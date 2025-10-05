# Common Mistakes & Fixes

This document contains frequently occurring issues and their solutions based on actual development patterns in this codebase.

## 🚨 Most Critical Issues to Avoid

### 1. NEVER Use Array Index as React Key
**❌ Wrong:**
```tsx
{[...Array(5)].map((_, index) => (
  <TableRow key={index}>
```

**✅ Correct:**
```tsx
{[...Array(5)].map((_, index) => (
  <TableRow key={`skeleton-row-${index}`}>
```

**Why:** Using array indices as keys causes React rendering issues when list order changes.

### 2. NEVER Use `any` Type
**❌ Wrong:**
```typescript
let body: any;
let updatePayload: any = {};
const [items, setItems] = useState<any[]>([]);
```

**✅ Correct:**
```typescript
let body: { action?: string; reason?: string };
let updatePayload: Record<string, unknown> = {};
const [items, setItems] = useState<{ id: string; title: string }[]>([]);
```

**Why:** `any` disables TypeScript's type checking and leads to runtime errors.

### 3. Unused Variables in Catch Blocks
**❌ Wrong:**
```typescript
} catch (error) {
  return NextResponse.json({ error: "Failed" });
}
```

**✅ Correct:**
```typescript
} catch (_error) {
  return NextResponse.json({ error: "Failed" });
}
```

**Why:** Biome linter requires unused variables to be prefixed with underscore.

## 📋 React & Component Patterns

### 4. useEffect Dependencies with Functions
**❌ Wrong:**
```typescript
useEffect(() => {
  loadData();
}, [loadData]); // Error if loadData is declared after useEffect

const loadData = async () => { ... };
```

**✅ Correct Option 1 - Move function before useEffect:**
```typescript
const loadData = async () => { ... };

useEffect(() => {
  loadData();
}, [loadData]);
```

**✅ Correct Option 2 - Use stable dependencies:**
```typescript
useEffect(() => {
  loadData();
  // biome-ignore lint/correctness/useExhaustiveDependencies: Function declared after useEffect
}, [userId]); // Use stable deps like props/params instead

const loadData = async () => { ... };
```

**✅ Correct Option 3 - Use useCallback:**
```typescript
const loadData = useCallback(async () => { ... }, [dependency]);

useEffect(() => {
  loadData();
}, [loadData]);
```

### 5. Skeleton Loading States
**❌ Wrong:**
```tsx
{loading && <div>Loading...</div>}
```

**✅ Correct:**
```tsx
{loading && <DataTableSkeleton />}
// Always create proper skeleton components with Skeleton UI
```

### 6. Database Type Mismatches
**❌ Wrong:**
```typescript
// Supabase returns { id: number, name: string | null }
const [items, setItems] = useState<{ id: string; name: string }[]>([]);
```

**✅ Correct:**
```typescript
const [items, setItems] = useState<{ id: number; name: string | null }[]>([]);
```

## 🛠️ API Route Patterns

### 7. Request Body Parsing
**✅ Correct Pattern:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // Type the body properly
    let body: { fieldA?: string; fieldB?: number };
    try {
      body = await request.json();
    } catch (_parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate and normalize
    const fieldA = String(body.fieldA || "").trim();
    const fieldB = Number(body.fieldB || 0);

    // Validate required fields
    if (!fieldA) {
      return NextResponse.json(
        { error: "fieldA is required" },
        { status: 400 }
      );
    }
    
    // ... rest of logic
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## 🔧 Linting & Build Fixes

### 8. Common Biome Fixes
```bash
# Fix most issues automatically
npx biome check --write "path/to/file.ts"

# Fix unsafe issues (like unused params)
npx biome check --write --unsafe "path/to/file.ts"

# Check specific modified files
npx biome check "file1.ts" "file2.tsx" "file3.ts"
```

### 9. Build Memory Issues
```bash
# Always use increased memory for builds
NODE_OPTIONS="--max-old-space-size=8192" bun build

# For web app specifically
NODE_OPTIONS="--max-old-space-size=8192" bun build
```

### 10. Component Props Changes
When removing props from a component:
1. Update the interface/type definition
2. Remove from destructuring in function parameters
3. Search for ALL usages and remove the prop
4. Check build to catch TypeScript errors

**Example:**
```typescript
// Step 1: Update interface
interface ModalProps {
  // unusedProp: number[]; // REMOVE
  items: Item[];
  onClose: () => void;
}

// Step 2: Update component
export function Modal({
  // unusedProp, // REMOVE
  items,
  onClose,
}: ModalProps) { ... }

// Step 3: Find and fix all usages
// Search: unusedProp=
// Remove from: <Modal unusedProp={...} items={...} />
```

## 🎯 Quick Reference Checklist

Before committing, always check:
- [ ] No `any` types used
- [ ] No array indices as React keys
- [ ] Unused variables prefixed with underscore
- [ ] useEffect dependencies are correct
- [ ] Types match database schemas
- [ ] Skeleton components used (not "Loading..." text)
- [ ] Run `bun check` passes
- [ ] Run `NODE_OPTIONS="--max-old-space-size=8192" bun build` passes

## 📝 Auto-fix Commands

```bash
# Full lint check and fix
# NEVER run global bun check - will timeout!
# Use: npx biome check --write <specific-file>

# Manual biome fix for specific files
npx biome check --write --unsafe "apps/web/**/*.{ts,tsx}"

# Type check
cd apps/web && bun check-types

# Full build check
NODE_OPTIONS="--max-old-space-size=8192" bun build
```

## 🏗️ HTML Structure Issues

### 11. Invalid HTML Nesting in React Components
**❌ Wrong - Lists inside paragraph elements:**
```tsx
<AlertDialogDescription>
  <p>Warning: This will delete:</p>
  <ul>  {/* ❌ ul cannot be inside p */}
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
</AlertDialogDescription>
```

**✅ Correct - Use asChild prop for complex content:**
```tsx
<AlertDialogDescription asChild>
  <div>
    <p>Warning: This will delete:</p>
    <ul>  {/* ✅ ul inside div is valid */}
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>
  </div>
</AlertDialogDescription>
```

**Error Message:** `In HTML, <ul> cannot be a descendant of <p>. This will cause a hydration error.`

**Why:** Radix UI components like AlertDialogDescription render as `<p>` by default. Using `asChild` lets you provide a custom container element.

## 🔍 Common Search Patterns

When fixing issues, use these grep patterns:
```bash
# Find any types
grep -r "any" --include="*.ts" --include="*.tsx"

# Find array index keys
grep -r "key={index}" --include="*.tsx"

# Find Loading text
grep -r "Loading\.\.\." --include="*.tsx"

# Find catch blocks
grep -r "catch (" --include="*.ts" --include="*.tsx"

# Find AlertDialogDescription with lists (potential HTML nesting issues)
grep -r -A 5 "AlertDialogDescription.*>" --include="*.tsx" | grep -B 3 -A 3 "<ul\|<ol\|<div"
```