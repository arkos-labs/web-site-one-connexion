import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

// ============================================
// SKELETON POUR CARTE DE COMMANDE
// ============================================

export function OrderCardSkeleton() {
    return (
        <div className="border rounded-lg p-4 space-y-3 bg-white shadow-sm border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Addresses */}
            <div className="space-y-2">
                <div className="flex items-start gap-2">
                    <Skeleton className="h-2 w-2 rounded-full mt-1 bg-slate-300" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex items-start gap-2">
                    <Skeleton className="h-2 w-2 rounded-full mt-1 bg-[#ed5518]/30" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
        </div>
    );
}

// ============================================
// SKELETON POUR CARTE DE CHAUFFEUR
// ============================================

export function DriverCardSkeleton() {
    return (
        <div className="border rounded-2xl p-4 space-y-3 bg-white shadow-sm border-slate-100">
            {/* Avatar + Name */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-6 rounded-full" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-12" />
                </div>
                <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-12" />
                </div>
            </div>

            {/* Action */}
            <Skeleton className="h-10 w-full rounded-xl" />
        </div>
    );
}

// ============================================
// SKELETON POUR TABLEAU
// ============================================

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4 pb-3 border-b border-slate-100">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 py-3 border-b border-slate-50 last:border-0">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 flex-1 opacity-60" />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ============================================
// SKELETON POUR STATISTIQUES
// ============================================

export function StatCardSkeleton() {
    return (
        <div className="border rounded-2xl p-6 space-y-3 bg-white shadow-sm border-slate-100">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
        </div>
    );
}

// ============================================
// SKELETON POUR LISTE
// ============================================

interface ListSkeletonProps {
    items?: number;
}

export function ListSkeleton({ items = 3 }: ListSkeletonProps) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 border rounded-2xl bg-white border-slate-100 shadow-sm">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-xl" />
                </div>
            ))}
        </div>
    );
}

// ============================================
// SKELETON POUR GRILLE DE CARTES
// ============================================

interface CardGridSkeletonProps {
    cards?: number;
    columns?: number;
    className?: string;
}

export function CardGridSkeleton({ cards = 6, columns = 3, className }: CardGridSkeletonProps) {
    return (
        <div className={cn(`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`, className)}>
            {Array.from({ length: cards }).map((_, i) => (
                <div key={i} className="border rounded-2xl p-4 space-y-3 bg-white border-slate-100 shadow-sm">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-9 flex-1 rounded-xl" />
                        <Skeleton className="h-9 w-20 rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================
// SKELETON POUR DISPATCH KANBAN
// ============================================

export function DispatchKanbanSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, colIndex) => (
                <div key={colIndex} className="border rounded-3xl overflow-hidden border-slate-100 bg-slate-50/30">
                    <div className="p-4 border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-6 w-8 rounded-full" />
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {Array.from({ length: 2 }).map((_, cardIndex) => (
                            <OrderCardSkeleton key={cardIndex} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================
// SKELETON POUR PROFIL
// ============================================

export function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                </div>
            </div>

            <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            </div>

            <div className="flex gap-3">
                <Skeleton className="h-11 w-32 rounded-xl" />
                <Skeleton className="h-11 w-24 rounded-xl" />
            </div>
        </div>
    );
}

// ============================================
// VARIANTES GLOBALES (Ex-SkeletonVariants)
// ============================================

interface CardSkeletonProps {
    hasHeader?: boolean;
    hasIcon?: boolean;
    lines?: number;
}

export const CardSkeleton = ({ hasHeader = true, hasIcon = true, lines = 3 }: CardSkeletonProps) => {
    return (
        <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
            {hasHeader && (
                <div className="flex items-center gap-4 mb-4">
                    {hasIcon && <Skeleton className="w-12 h-12 rounded-xl" />}
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

export const StatsSkeleton = ({ count = 4 }: { count?: number }) => {
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
            <StatsSkeleton count={4} />
            <div className="grid gap-6 lg:grid-cols-2">
                <CardSkeleton lines={5} />
                <CardSkeleton lines={5} />
            </div>
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                <Skeleton className="h-6 w-40 mb-4" />
                <TableSkeleton rows={5} columns={6} />
            </div>
        </div>
    );
};

export const OrdersTableSkeleton = () => {
    return (
        <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="flex gap-4 mb-6">
                <Skeleton className="h-12 flex-1 max-w-xs rounded-xl" />
                <Skeleton className="h-12 w-40 rounded-xl" />
                <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
            <TableSkeleton rows={8} columns={8} />
        </div>
    );
};
