## Overview
This prompt allows you to generate a complete feature-based page structure similar to the one shown in the navigation screenshot. The system follows a specific architectural pattern with proper loading states, hydration boundaries, suspense boundaries, and feature organization.


## Instructions for Claude Code


Given a screenshot showing a navigation table with main categories and sub-items (like Clients → Clients, Activity Periods, Call Feedback, Testimonials), create a complete feature implementation following this exact pattern:


### Prerequisites
- This is a Next.js 15 App Router application with TypeScript
- Uses Bun as package manager
- Uses TanStack Query for data fetching with prefetching pattern
- Uses Better Auth for authentication
- Uses TailwindCSS v4 and shadcn/ui components
- Uses Biome for formatting (tab indentation, double quotes)
- All server actions use next-safe-action with Zod validation


### Step 1: Feature Folder Structure
Create the following folder structure for each main category (e.g., "Clients"):


```
/apps/web/src/features/[feature-name]/
├── actions/                    # Server actions (if needed)
│   └── .gitkeep
├── components/                 # Feature-specific React components
│   ├── [feature-name]-content.tsx
│   └── [sub-item]-content.tsx  # For each sub-item
├── layout/                     # Header components
│   ├── [feature-name]-header.tsx
│   └── [sub-item]-header.tsx   # For each sub-item
├── queries/                    # Data fetching hooks and server queries
│   └── .gitkeep
└── types/                      # TypeScript types
   └── .gitkeep
```


### Step 2: Create Header Components


#### Main Feature Header (`/features/[feature-name]/layout/[feature-name]-header.tsx`)
```tsx
import { SidebarTrigger } from "@/components/ui/sidebar";


export default function [FeatureName]Header() {
   return (
       <div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
           <div className="flex items-center gap-2">
               <SidebarTrigger />
               <h1 className="font-medium text-[13px]">[Feature Display Name]</h1>
           </div>
       </div>
   );
}
```


#### Sub-item Headers (`/features/[feature-name]/layout/[sub-item]-header.tsx`)
```tsx
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserRoundPlusIcon } from "lucide-react";
import Link from "next/link";


export default function [SubItem]Header() {
  return (
    <div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
       <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="font-medium text-[13px] ">Coaches </h1>
      </div>
        <Button asChild>
          <Link href="/[SubItem]/add" className="flex items-center gap-2">
            <UserRoundPlusIcon className="mr-[6px] h-4 w-4" />
            Add [SubItem]
          </Link>
        </Button>
    </div>


  );
}


```


### Step 3: Create Content Components


#### Main Feature Content (`/features/[feature-name]/components/[feature-name]-content.tsx`)
```tsx
export default function [FeatureName]Content() {
   return (
       <div className="p-6">
           <div className="space-y-6">
               <div className="space-y-2">
                   <h2 className="font-bold text-2xl">[Feature Display Name]</h2>
                   <p className="text-muted-foreground">[Feature description based on context].</p>
               </div>
              
               <div className="rounded-lg border border-border bg-card p-6">
                   <p className="text-muted-foreground">[Feature name] content will be implemented here.</p>
               </div>
           </div>
       </div>
   );
}
```


#### Sub-item Content Components (`/features/[feature-name]/components/[sub-item]-content.tsx`)
```tsx
export default function [SubItem]Content() {
   return (
       <div className="p-6">
           <div className="space-y-6">
               <div className="space-y-2">
                   <h2 className="font-bold text-2xl">[Sub-item Display Name]</h2>
                   <p className="text-muted-foreground">[Sub-item description based on context].</p>
               </div>
              
               <div className="rounded-lg border border-border bg-card p-6">
                   <p className="text-muted-foreground">[Sub-item name] content will be implemented here.</p>
               </div>
           </div>
       </div>
   );
}
```


### Step 4: Create Loading Components


#### Main Feature Loading (`/apps/web/src/app/dashboard/[feature-name]/loading.tsx`)
```tsx
import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";


import [FeatureName]Header from "@/features/[feature-name]/layout/[feature-name]-header";


export default function [FeatureName]Loading() {
   return (
       <MainLayout
           headers={[<[FeatureName]Header key="[feature-name]-header" />]}
       >
           <div className="space-y-6 p-6">
               <div className="space-y-2">
                   <Skeleton className="h-10 w-64" />
                   <Skeleton className="h-4 w-96" />
               </div>


               <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                   <Skeleton className="h-32 w-full rounded-lg" />
                   <Skeleton className="h-32 w-full rounded-lg" />
                   <Skeleton className="h-32 w-full rounded-lg" />
                   <Skeleton className="h-32 w-full rounded-lg" />
               </div>


               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                   <Skeleton className="h-64 w-full rounded-lg" />
                   <Skeleton className="h-64 w-full rounded-lg" />
               </div>
           </div>
       </MainLayout>
   );
}
```


#### Sub-item Loading Components (`/apps/web/src/app/dashboard/[feature-name]/[sub-item]/loading.tsx`)
```tsx
import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";


import [SubItem]Header from "@/features/[feature-name]/layout/[sub-item]-header";


export default function [SubItem]Loading() {
   return (
       <MainLayout
           headers={[<[SubItem]Header key="[sub-item]-header" />]}
       >
           <div className="space-y-6 p-6">
               <div className="space-y-2">
                   <Skeleton className="h-10 w-64" />
                   <Skeleton className="h-4 w-96" />
               </div>


               <div className="rounded-lg border border-border bg-card p-6">
                   <div className="space-y-4">
                       <Skeleton className="h-6 w-48" />
                       <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                           <Skeleton className="h-20 w-full rounded" />
                           <Skeleton className="h-20 w-full rounded" />
                           <Skeleton className="h-20 w-full rounded" />
                       </div>
                       <Skeleton className="h-32 w-full rounded" />
                   </div>
               </div>
           </div>
       </MainLayout>
   );
}
```


### Step 5: Create Page Components


#### Main Feature Page (`/apps/web/src/app/dashboard/[feature-name]/page.tsx`)
```tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";


import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";


import {
   dehydrate,
   HydrationBoundary,
   QueryClient,
} from "@tanstack/react-query";


import [FeatureName]Header from "@/features/[feature-name]/layout/[feature-name]-header";
import [FeatureName]Content from "@/features/[feature-name]/components/[feature-name]-content";
import [FeatureName]Loading from "./loading";


export default function [FeatureName]Page() {
   return (
       <Suspense fallback={<[FeatureName]Loading />}>
           <[FeatureName]PageAsync />
       </Suspense>
   );
}


async function [FeatureName]PageAsync() {
   const queryClient = new QueryClient();
   const session = await getUser();


   if (!session) {
       redirect("/");
   }


   // TODO: Add data prefetching here when implementing actual queries
   // await Promise.all([
   //   queryClient.prefetchQuery([feature-name]Queries.query1()),
   //   queryClient.prefetchQuery([feature-name]Queries.query2()),
   // ]);


   return (
       <HydrationBoundary state={dehydrate(queryClient)}>
           <MainLayout
               headers={[
                   <[FeatureName]Header key="[feature-name]-header" />,
               ]}
           >
               <[FeatureName]Content />
           </MainLayout>
       </HydrationBoundary>
   );
}
```


#### Sub-item Pages (`/apps/web/src/app/dashboard/[feature-name]/[sub-item]/page.tsx`)
```tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";


import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";


import {
   dehydrate,
   HydrationBoundary,
   QueryClient,
} from "@tanstack/react-query";


import [SubItem]Header from "@/features/[feature-name]/layout/[sub-item]-header";
import [SubItem]Content from "@/features/[feature-name]/components/[sub-item]-content";
import [SubItem]Loading from "./loading";


export default function [SubItem]Page() {
   return (
       <Suspense fallback={<[SubItem]Loading />}>
           <[SubItem]PageAsync />
       </Suspense>
   );
}


async function [SubItem]PageAsync() {
   const queryClient = new QueryClient();
   const session = await getUser();


   if (!session) {
       redirect("/");
   }


   // TODO: Add data prefetching here when implementing actual queries
   // await Promise.all([
   //   queryClient.prefetchQuery([sub-item]Queries.query1()),
   //   queryClient.prefetchQuery([sub-item]Queries.query2()),
   // ]);


   return (
       <HydrationBoundary state={dehydrate(queryClient)}>
           <MainLayout
               headers={[
                   <[SubItem]Header key="[sub-item]-header" />,
               ]}
           >
               <[SubItem]Content />
           </MainLayout>
       </HydrationBoundary>
   );
}
```


### Step 6: Update Sidebar Navigation


Add the navigation structure to `/apps/web/src/components/sidebar/app-sidebar.tsx` in the `navMain` array:


```tsx
{
   title: "[Feature Display Name]",
   url: "#",
   icon: [AppropriateIcon], // Import from lucide-react
   items: [
       {
           title: "[Feature Display Name]",
           url: "/dashboard/[feature-name]",
       },
       {
           title: "[Sub-item 1 Display Name]",
           url: "/dashboard/[feature-name]/[sub-item-1]",
       },
       {
           title: "[Sub-item 2 Display Name]",
           url: "/dashboard/[feature-name]/[sub-item-2]",
       },
       // Add more sub-items as needed
   ],
},
```


### Step 7: Key Technical Requirements


#### Hydration Boundaries
- Always wrap page content in `<HydrationBoundary state={dehydrate(queryClient)}>`
- This ensures client-side hydration works correctly with prefetched data


#### Suspense Boundaries
- Use `<Suspense fallback={<LoadingComponent />}>` for each page
- Create separate async components for actual data fetching logic


#### Loading Skeletons
- Match the skeleton structure to the expected content layout
- Use responsive grid patterns that mirror the actual content
- Include title, description, and content area skeletons


#### Headers
- All headers are 45px height (configurable in MainLayout)
- Include SidebarTrigger for mobile menu functionality
- Use consistent padding: `px-4 py-2 lg:px-6`
- Headers are sticky with `sticky top-0 z-10`


#### Content Structure
- Consistent padding: `p-6`
- Use `space-y-6` for main content spacing
- Include title section with `space-y-2`
- Use semantic heading structure (h2 for main titles)
- Include descriptive text with `text-muted-foreground`


#### Authentication
- Always check for session in page components
- Redirect to "/" if no session exists
- Pass session data down to components that need it


### Step 8: File Naming Conventions


- Use kebab-case for file and folder names: `activity-periods`, `call-feedback`
- Use PascalCase for component names: `ActivityPeriodsContent`, `CallFeedbackHeader`
- Match folder names to URL segments exactly
- Keep component file names descriptive but concise


### Step 9: Folder Structure Verification


After creating all files, verify the structure matches:
```
apps/web/src/
├── features/[feature-name]/
│   ├── actions/
│   ├── components/
│   ├── data/
│   ├── layout/
│   ├── queries/
│   └── types/
└── app/dashboard/[feature-name]/
   ├── page.tsx
   ├── loading.tsx
   ├── [sub-item-1]/
   │   ├── page.tsx
   │   └── loading.tsx
   └── [sub-item-2]/
       ├── page.tsx
       └── loading.tsx
```


### Step 10: Implementation Notes


1. **Placeholder Content**: All content components include placeholder text indicating where real functionality will be implemented
2. **Future Data Integration**: Pages include commented TODO sections for adding actual data prefetching
3. **Responsive Design**: Loading skeletons and layouts use responsive Tailwind classes
4. **Accessibility**: Proper heading hierarchy and semantic HTML structure
5. **Performance**: Proper use of React Query prefetching pattern for optimal loading performance


### Step 11: Icon Selection Guide


Choose appropriate Lucide React icons for each feature:
- **Clients**: `Users`, `UserCheck`, `UserCircle`
- **Finance**: `CreditCard`, `DollarSign`, `Banknote`
- **System Config**: `Settings`, `Cog`, `Wrench`
- **Reports**: `BarChart3`, `TrendingUp`, `FileText`
- **Team**: `Users`, `UserPlus`, `Shield`


### Example Implementation


For a screenshot showing:
```
| Inventory    | Products         |
|              | Categories       | 
|              | Stock Management |
|              | Suppliers        |
```


You would create:
- Feature folder: `/features/inventory/`
- Main page: `/app/dashboard/inventory/page.tsx`
- Sub-pages: `/app/dashboard/inventory/products/`, `/categories/`, `/stock-management/`, `/suppliers/`
- All with corresponding headers, content, loading states, and proper hydration boundaries


This pattern ensures consistency, proper loading states, SEO-friendly structure, and optimal user experience across all features.

