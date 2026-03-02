'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  deadline: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(deadline: string): TimeLeft | null {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="rounded-lg bg-primary/10 px-3 py-2 text-2xl font-bold tabular-nums text-primary">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null | undefined>(undefined);

  useEffect(() => {
    setTimeLeft(calcTimeLeft(deadline));
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(deadline));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [deadline]);

  if (timeLeft === undefined) {
    return (
      <div className="flex gap-3">
        {['Days', 'Hours', 'Min', 'Sec'].map((label, i) => (
          <div key={label} className="flex flex-col items-center">
            {i > 0 && (
              <span className="self-start pt-2 text-2xl font-bold text-muted-foreground">:</span>
            )}
            <span className="rounded-lg bg-primary/10 px-3 py-2 text-2xl font-bold tabular-nums text-primary">
              --
            </span>
            <span className="mt-1 text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (timeLeft === null) {
    return <p className="text-lg font-semibold text-destructive">Deadline has passed</p>;
  }

  return (
    <div className="flex gap-3">
      <TimeBlock value={timeLeft.days} label="Days" />
      <span className="self-start pt-2 text-2xl font-bold text-muted-foreground">:</span>
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <span className="self-start pt-2 text-2xl font-bold text-muted-foreground">:</span>
      <TimeBlock value={timeLeft.minutes} label="Min" />
      <span className="self-start pt-2 text-2xl font-bold text-muted-foreground">:</span>
      <TimeBlock value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
