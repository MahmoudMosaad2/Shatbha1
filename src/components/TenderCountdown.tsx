import React, { useState, useEffect } from 'react';

interface TenderCountdownProps {
  deadline?: string;
  createdAt?: string;
  isEn?: boolean;
}

export const TenderCountdown: React.FC<TenderCountdownProps> = ({ deadline, createdAt, isEn }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      let targetTime = deadline ? new Date(deadline).getTime() : 0;
      if (!targetTime && createdAt) {
        targetTime = new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000;
      }
      if (!targetTime) {
        // Safe ultimate fallback: 5 days from now
        targetTime = Date.now() + 5 * 24 * 60 * 60 * 1000;
      }

      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setIsOver(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setIsOver(false);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [deadline, createdAt]);

  if (!timeLeft) return null;

  if (isOver) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
        ⚠️ {isEn ? 'Bidding Ended' : 'انتهت المناقصة'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1 text-right select-none font-mono tracking-tight" dir="rtl">
      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 font-black px-2 py-0.5 sm:py-1 rounded-lg border border-amber-500/20 text-[11px] shadow-xs animate-pulse">
        <span>{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-[9px] font-sans text-amber-500/70 font-semibold">{isEn ? 'd' : 'ي'}</span>
        <span className="text-amber-500/40 font-bold">:</span>
        <span>{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[9px] font-sans text-amber-500/70 font-semibold">{isEn ? 'h' : 'س'}</span>
        <span className="text-amber-500/40 font-bold">:</span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[9px] font-sans text-amber-500/70 font-semibold">{isEn ? 'm' : 'د'}</span>
        <span className="text-amber-500/40 font-bold">:</span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-[9px] font-sans text-amber-500/70 font-semibold">{isEn ? 's' : 'ث'}</span>
      </div>
    </div>
  );
};
