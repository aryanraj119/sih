import { Database } from 'lucide-react';

interface DataModeBadgeProps {
  isDemoMode?: boolean;
  className?: string;
}

export const DataModeBadge = ({ isDemoMode = true, className = '' }: DataModeBadgeProps) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border font-semibold ${
        isDemoMode
          ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
          : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
      } ${className}`}
    >
      <Database className="w-3 h-3" />
      <span>{isDemoMode ? 'DEMO MODE (SYNTHETIC DATA)' : 'LIVE SLDC DATA'}</span>
    </div>
  );
};
