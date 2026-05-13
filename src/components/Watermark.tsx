import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Watermark() {
  const { profile } = useAuth();
  if (!profile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] select-none overflow-hidden">
      <div className="flex flex-wrap gap-x-20 gap-y-32 rotate-[-25deg] scale-150 transform-gpu">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="text-xl font-black uppercase tracking-[0.5em] whitespace-nowrap">
            {profile.name} • {profile.uid} • {new Date().toLocaleDateString()} • CONFIDENTIAL • GULA SECURE
          </div>
        ))}
      </div>
    </div>
  );
}
