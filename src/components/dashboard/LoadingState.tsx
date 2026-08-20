import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState = ({ message = 'Loading forecast telemetry...', className = '' }: LoadingStateProps) => {
  return (
    <div className={`liquid-glass p-8 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center gap-3 ${className}`}>
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      <span className="text-xs text-gray-300 font-medium">{message}</span>
    </div>
  );
};
