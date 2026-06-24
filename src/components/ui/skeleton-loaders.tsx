import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Generic card skeleton for quotes, jobs, projects etc.
export const CardSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
      </div>
    </CardContent>
  </Card>
);

// Grid of card skeletons
export const CardGridSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// Project card skeleton
export const ProjectCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-48 w-full rounded-t-lg" />
    <CardContent className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </CardContent>
  </Card>
);

// Project grid skeleton
export const ProjectGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProjectCardSkeleton key={i} />
    ))}
  </div>
);

// Blog card skeleton
export const BlogCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-40 w-full" />
    <CardContent className="p-4 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </CardContent>
  </Card>
);

// Blog grid skeleton
export const BlogGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <BlogCardSkeleton key={i} />
    ))}
  </div>
);

// Table row skeleton
export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
  <div className="flex items-center gap-4 p-4 border-b">
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} className="h-4 flex-1" />
    ))}
  </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) => (
  <div className="border rounded-lg">
    <div className="flex items-center gap-4 p-4 border-b bg-muted/50">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRowSkeleton key={i} columns={columns} />
    ))}
  </div>
);

// Dashboard stats skeleton
export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i} className="p-4">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16" />
      </Card>
    ))}
  </div>
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Page header skeleton
export const PageHeaderSkeleton = () => (
  <div className="space-y-2 mb-6">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-96 max-w-full" />
  </div>
);

// Project detail page skeleton
export const ProjectDetailSkeleton = () => (
  <div className="container mx-auto px-4 max-w-4xl space-y-6">
    <Skeleton className="h-9 w-32" />
    <div className="flex flex-wrap gap-2">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-6 w-32 rounded-full" />
    </div>
    <Skeleton className="h-10 w-3/4" />
    <Skeleton className="aspect-video w-full rounded-lg" />
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

// Notifications list skeleton
export const NotificationListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </div>
    </div>
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Full dashboard shell skeleton (while auth/role loads)
export const DashboardShellSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="border-b border-border/60 bg-card">
      <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600" />
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="hidden md:block h-9 w-40 rounded-md" />
        </div>
      </div>
    </div>
    <div className="container mx-auto px-4 py-6 flex gap-8">
      <aside className="hidden md:block w-56 shrink-0 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </aside>
      <main className="flex-1 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="space-y-3 pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </main>
    </div>
  </div>
);

// Project detail skeleton — large image + title + 2 meta chips + 4 text lines
export const ProjectDetailSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-64 w-full rounded-lg" />
    <Skeleton className="h-8 w-2/3" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

// Notification list skeleton — header + count rows with icon + title + meta
export const NotificationListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-40" />
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Dashboard shell skeleton — gradient bar + header + sidebar (desktop) + main content
export const DashboardShellSkeleton = () => (
  <div className="min-h-screen bg-background">
    {/* Gradient accent bar matching the real dashboard */}
    <div className="h-px bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600" />

    {/* Header */}
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 md:h-10 w-28" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="hidden md:block h-9 w-36 rounded-lg" />
      </div>
    </header>

    <div className="flex">
      {/* Sidebar — desktop only, matches w-56 + bg-secondary rounded-xl */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="sticky top-24 p-3">
          <div className="bg-secondary rounded-xl p-3 space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2 px-2 py-1">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 px-4 py-4 md:py-8 space-y-6">
        <PageHeaderSkeleton />
        <StatsSkeleton />
        <CardGridSkeleton count={3} />
      </main>
    </div>
  </div>
);
