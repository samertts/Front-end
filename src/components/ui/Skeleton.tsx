import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-100 dark:bg-slate-800",
        variant === 'circular' && "rounded-full",
        variant === 'rounded' && "rounded-2xl",
        className
      )}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex justify-between items-end mb-12">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-64" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-12 w-40 rounded-2xl" />
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <Skeleton className="h-[200px] rounded-[3rem]" />
          <div className="grid grid-cols-2 gap-8">
            <Skeleton className="h-[300px] rounded-[3.5rem]" />
            <Skeleton className="h-[300px] rounded-[3.5rem]" />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <Skeleton className="h-full min-h-[600px] rounded-[3.5rem]" />
        </div>
      </div>
    </div>
  );
}

export function PatientProfileSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Skeleton className="h-14 w-full rounded-2xl" />
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900 rounded-[2.5rem] p-6">
        <div className="flex items-center gap-6">
          <Skeleton className="h-12 w-12 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 bg-white/10" />
            <Skeleton className="h-4 w-32 bg-white/5" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-14 w-32 rounded-2xl bg-white/10" />
          <Skeleton className="h-14 w-32 rounded-2xl bg-white/10" />
          <Skeleton className="h-14 w-40 rounded-2xl bg-indigo-500/20" />
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] space-y-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-[2rem]" />
        </div>
        <div className="col-span-9 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
          </div>
          <Skeleton className="h-96 rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );
}
