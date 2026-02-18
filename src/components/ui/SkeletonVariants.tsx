import { Skeleton } from "@/components/ui/Skeleton";

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export const TableSkeleton = ({ rows = 5, columns = 6 }: TableSkeletonProps) => {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4 py-3 border-b">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 py-3">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
};

interface CardSkeletonProps {
    hasHeader?: boolean;
    hasIcon?: boolean;
    lines?: number;
}

export const CardSkeleton = ({ hasHeader = true, hasIcon = true, lines = 3 }: CardSkeletonProps) => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-soft border-0">
            {hasHeader && (
                <div className="flex items-center gap-4 mb-4">
                    {hasIcon && <Skeleton className="w-12 h-12 rounded-lg" />}
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                </div>
            )}
            <div className="space-y-2">
                {Array.from({ length: lines }).map((_, i) => (
                    <Skeleton key={i} className="h-4" style={{ width: `${100 - i * 15}%` }} />
                ))}
            </div>
        </div>
    );
};

interface StatsSkeletonProps {
    count?: number;
}

export const StatsSkeleton = ({ count = 4 }: StatsSkeletonProps) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} lines={1} />
            ))}
        </div>
    );
};

export const DashboardSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <StatsSkeleton count={4} />

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-2">
                <CardSkeleton lines={5} />
                <CardSkeleton lines={5} />
            </div>

            {/* Table */}
            <div className="p-6 bg-white rounded-lg shadow-soft">
                <Skeleton className="h-6 w-40 mb-4" />
                <TableSkeleton rows={5} columns={6} />
            </div>
        </div>
    );
};

export const OrdersTableSkeleton = () => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-soft">
            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <Skeleton className="h-10 flex-1 max-w-xs" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-40" />
            </div>
            {/* Table */}
            <TableSkeleton rows={8} columns={8} />
        </div>
    );
};
