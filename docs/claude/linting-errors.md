# Linting Errors & Solutions

This document provides quick solutions for common Biome linting errors in this codebase.

## 🔴 Critical Errors (Must Fix)

### lint/suspicious/noExplicitAny
**Error:** `Unexpected any. Specify a different type.`

**Solution:**
```typescript
// ❌ Wrong
let body: any;
const [items, setItems] = useState<any[]>([]);

// ✅ Correct
let body: { field?: string };
const [items, setItems] = useState<{ id: number; title: string | null }[]>([]);
```

### lint/correctness/noUnusedVariables
**Error:** `This variable is unused.`

**Solution for catch blocks:**
```typescript
// ❌ Wrong
} catch (error) {

// ✅ Correct - Prefix with underscore
} catch (_error) {
```

**Solution for function parameters:**
```typescript
// ❌ Wrong
function Component({ unused, used }: Props) {

// ✅ Correct - Remove from interface and parameters
function Component({ used }: Props) {
```

### lint/suspicious/noArrayIndexKey
**Error:** `Avoid using the index of an array as key property in an element.`

**Solution:**
```typescript
// ❌ Wrong - Using array index as key is flagged by lint/suspicious/noArrayIndexKey
{items.map((item, index) => (
  <div key={index}>

// ✅ Correct for truly static, non-reorderable lists ONLY
// Note: Still flagged by Biome, use suppression comment for legitimate static cases
{/* biome-ignore lint/suspicious/noArrayIndexKey: Static list that never changes order */}
{[...Array(5)].map((_, index) => (
  <div key={index}>

// ✅ Correct for dynamic lists (preferred approach)
{items.map((item) => (
  <div key={item.id}>
```

## ⚠️ React Hook Errors

### lint/correctness/useExhaustiveDependencies
**Error:** `This hook does not specify its dependency` or `specifies more dependencies than necessary`

**Solutions:**

1. **Function declared after useEffect:**
```typescript
// ❌ Wrong - Function used before declaration
useEffect(() => {
  loadData();
  // biome-ignore lint/correctness/useExhaustiveDependencies: Function declared after useEffect
}, [userId]);

const loadData = async () => { 
  // uses userId
};

// ✅ Correct - Biome-friendly pattern with useCallback
const loadData = useCallback(async () => {
  // Function logic that uses userId
  const response = await fetch(`/api/users/${userId}`);
  // ... rest of logic
}, [userId]); // Include real dependencies

useEffect(() => {
  loadData();
}, [loadData]); // Include the memoized callback
```

2. **Using useCallback for stable references:**
```typescript
// ✅ Correct - Declare callback before useEffect
const loadData = useCallback(async () => {
  // ... function logic with dependencies
}, [dependency1, dependency2]);

useEffect(() => {
  loadData();
}, [loadData]); // Clean dependency array
```

### lint/correctness/noInvalidUseBeforeDeclaration
**Error:** `This variable is used before its declaration.`

**Solution 1: Move function declaration above useEffect (preferred)**
```typescript
// ✅ Correct - Function declared before useEffect
const loadData = useCallback(async () => {
  const response = await fetch('/api/data');
  const data = await response.json();
  setData(data);
}, []);

useEffect(() => {
  void loadData();
}, [loadData]);
```

**Solution 2: Use Biome ignore comment for legitimate cases**
```tsx
{/* biome-ignore lint/correctness/noInvalidUseBeforeDeclaration: Function needs to be defined after hooks for readability */}
useEffect(() => {
  void loadData();
}, [loadData]);

const loadData = useCallback(async () => {
  const response = await fetch('/api/data');
  const data = await response.json();
  setData(data);
}, []);

## 📝 Format Errors

### Format issues with Biome
**Error:** `Formatter would have printed the following content`

**Solution:**
```bash
# Auto-fix formatting
npx biome check --write "path/to/file.ts"

# Fix all files in a directory
npx biome check --write "apps/web/**/*.{ts,tsx}"
```

## 🛠️ Quick Fix Commands

### Check specific files
```bash
# Check multiple files
npx biome check "file1.ts" "file2.tsx" "file3.ts"

# With paths containing brackets (escape them)
npx biome check "apps/web/app/api/admin/users/[userId]/ban/route.ts"
```

### Auto-fix commands
```bash
# Safe fixes only
npx biome check --write "path/to/file.ts"

# Include unsafe fixes (like unused variables)
npx biome check --write --unsafe "path/to/file.ts"

# Fix all modified files (get list from git)
git diff --name-only | grep -E '\.(ts|tsx)$' | xargs npx biome check --write
```

### Type checking
```bash
# Check types in web app
cd apps/web && bun check-types

# Or from root
bun check-types
```

## 🎯 Common Patterns to Fix

### Unused imports
```typescript
// ❌ Wrong
import { useEffect, useState } from "react"; // useEffect unused

// ✅ Correct - Remove unused imports
import { useState } from "react";
```

### Type mismatches
```typescript
// ❌ Wrong - State type doesn't match data
const [items, setItems] = useState<{ id: string }[]>([]);
// But Supabase returns { id: number }

// ✅ Correct - Match the actual data type
const [items, setItems] = useState<{ id: number }[]>([]);
```

### Catch block patterns
```typescript
// ✅ Correct pattern for API routes
try {
  body = await request.json();
} catch (_jsonError) {  // Prefix with underscore
  return NextResponse.json(
    { error: "Invalid JSON" },
    { status: 400 }
  );
}
```

## 📋 Pre-lint Checklist

Before running lint checks:
1. Save all files
2. Check git status to know which files are modified
3. Run type check first: `bun check-types`
4. Then run lint: `npx biome check`

## 🔍 Finding Issues

```bash
# Find all any types
grep -r ": any" --include="*.ts" --include="*.tsx"

# Find array index keys
grep -r "key={index}" --include="*.tsx"

# Find unused catch variables
grep -r "} catch ([^_]" --include="*.ts" --include="*.tsx"

# Find Loading text (should be skeletons)
grep -r '"Loading\.\.\."' --include="*.tsx"
```

## 💡 Tips

1. **Always fix TypeScript errors first** - They often cause linting errors
2. **Use `--unsafe` flag carefully** - Review changes before committing
3. **Run build after fixes** - `NODE_OPTIONS="--max-old-space-size=8192" bun build`
4. **Commit frequently** - Easier to track what fixed what
5. **Use proper types from the start** - Prevents most linting issues

## 🚀 Full Fix Workflow

```bash
# 1. Check what's modified
git status

# 2. Run type check
cd apps/web && bun check-types

# 3. Fix type errors if any

# 4. Run lint check on modified files
npx biome check "file1.ts" "file2.tsx"

# 5. Auto-fix safe issues
npx biome check --write "file1.ts" "file2.tsx"

# 6. Auto-fix unsafe issues if needed
npx biome check --write --unsafe "file1.ts" "file2.tsx"

# 7. Verify build passes
NODE_OPTIONS="--max-old-space-size=8192" bun build

# 8. Review changes
git diff

# 9. Commit if all good
git add .
git commit -m "fix: resolve linting errors"
```