import { Gamepad2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text = 'Загрузка...', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#d4af37]/30 flex items-center justify-center animate-pulse`}>
          <Gamepad2 className="w-6 h-6 text-[#d4af37] animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-transparent animate-ping"></div>
      </div>
      {text && (
        <p className="text-slate-400 mt-4 animate-pulse">{text}</p>
      )}
    </div>
  );
}

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#d4af37]/20 rounded-lg p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#0d0d0d] border border-[#d4af37]/10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#0d0d0d] rounded w-3/4"></div>
              <div className="h-3 bg-[#0d0d0d] rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-[#0d0d0d] rounded w-full"></div>
            <div className="h-3 bg-[#0d0d0d] rounded w-5/6"></div>
            <div className="h-3 bg-[#0d0d0d] rounded w-2/3"></div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="h-6 bg-[#0d0d0d] rounded w-1/4"></div>
            <div className="h-8 bg-[#0d0d0d] rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
