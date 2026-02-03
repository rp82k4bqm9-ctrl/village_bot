import { Gamepad2 } from 'lucide-react';

interface GamePlaceholderProps {
  className?: string;
}

export function GamePlaceholder({ className = '' }: GamePlaceholderProps) {
  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {/* Фон с градиентом */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#0d0d0d] to-[#1a1a1a]" />
      
      {/* Декоративные круги */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-transparent blur-xl" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-[#cd7f32]/20 to-transparent blur-xl" />
      </div>
      
      {/* Центральная иконка с обводкой */}
      <div className="relative z-10">
        {/* Внешнее свечение */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d4af37]/30 to-[#cd7f32]/30 blur-lg scale-150" />
        
        {/* Обводка */}
        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37]/50 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
          {/* Внутренний градиент */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#d4af37]/10 via-transparent to-[#cd7f32]/10" />
          
          {/* Иконка геймпада */}
          <Gamepad2 className="relative w-16 h-16 text-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" strokeWidth={1.5} />
        </div>
        
        {/* Текст под иконкой */}
        <p className="mt-3 text-center text-xs text-[#d4af37]/60 font-medium tracking-wider uppercase">
          No Image
        </p>
      </div>
      
      {/* Угловые декорации */}
      <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-[#d4af37]/30 rounded-tl-lg" />
      <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-[#d4af37]/30 rounded-tr-lg" />
      <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-[#d4af37]/30 rounded-bl-lg" />
      <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-[#d4af37]/30 rounded-br-lg" />
    </div>
  );
}
