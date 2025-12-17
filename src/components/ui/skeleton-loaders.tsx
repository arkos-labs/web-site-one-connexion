// ============================================
// SKELETON LOADERS - COMPOSANTS RÉUTILISABLES
// ============================================
// Composants de chargement élégants pour améliorer l'UX
// Pendant le chargement des données

import { cn } from '@/lib/utils';

// ============================================
// SKELETON DE BASE
// ============================================

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-slate-200 dark:bg-slate-800',
                className
            )}
        />
    );
}

// ============================================
// SKELETON POUR CARTE DE COMMANDE
// ============================================

export function OrderCardSkeleton() {
    return (
        <div className="border rounded-lg p-4 space-y-3 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Addresses */}
            <div className="space-y-2">
                <div className="flex items-start gap-2">
                    <Skeleton className="h-2 w-2 rounded-full mt-1" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex items-start gap-2">
                    <Skeleton className="h-2 w-2 rounded-full mt-1" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-24 rounded" />
            </div>
        </div>
    );
}

// ============================================
// SKELETON POUR CARTE DE CHAUFFEUR
// ============================================

export function DriverCardSkeleton() {
    return (
        <div className="border rounded-lg p-4 space-y-3 bg-white">
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
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
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
            <Skeleton className="h-9 w-full rounded" />
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
            <div className="flex gap-4 pb-3 border-b">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 py-3 border-b">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 flex-1" />
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
        <div className="border rounded-lg p-6 space-y-3 bg-white">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded" />
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
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded" />
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
}

export function CardGridSkeleton({ cards = 6, columns = 3 }: CardGridSkeletonProps) {
    return (
        <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`}>
            {Array.from({ length: cards }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3 bg-white">
                    <Skeleton className="h-40 w-full rounded" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-8 flex-1 rounded" />
                        <Skeleton className="h-8 w-20 rounded" />
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
            {/* 4 colonnes */}
            {Array.from({ length: 4 }).map((_, colIndex) => (
                <div key={colIndex} className="border rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="p-3 border-b bg-slate-50">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-6 w-8 rounded-full" />
                        </div>
                    </div>

                    {/* Cards */}
                    <div className="p-3 space-y-3">
                        {Array.from({ length: 3 }).map((_, cardIndex) => (
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
            {/* Header */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Skeleton className="h-10 w-32 rounded" />
                <Skeleton className="h-10 w-24 rounded" />
            </div>
        </div>
    );
}

// ============================================
// EXEMPLES D'UTILISATION
// ============================================

/*
// Dans un composant avec chargement
function OrdersList() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <OrderCardSkeleton />
        <OrderCardSkeleton />
        <OrderCardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

// Avec grille
function Dashboard() {
  const { data, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return <StatsGrid data={data} />;
}

// Dispatch Kanban
function Dispatch() {
  const { isLoading } = useOrders();

  if (isLoading) {
    return <DispatchKanbanSkeleton />;
  }

  return <DispatchKanban />;
}
*/
