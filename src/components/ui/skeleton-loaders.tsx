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
    <Skeleton className="h-4 w-96" />
  </div>
);
