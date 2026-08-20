import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({
  message = 'Forecast service unavailable',
  onRetry,
  className = '',
}: ErrorStateProps) => {
  return (
    <div className={`liquid-glass p-8 rounded-2xl border border-amber-500/30 bg-amber-950/20 flex flex-col items-center justify-center text-center gap-3 ${className}`}>
      <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-white mb-1">{message}</h3>
        <p className="text-xs text-gray-300 font-light max-w-md">
          Unable to establish connection to OpenSTEF backend server. You can retry connection or switch to DEMO MODE.
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="mt-2 bg-white text-black px-5 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
        </button>
      )}
    </div>
  );
};
