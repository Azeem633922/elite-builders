'use client';

import { useChallengeStore } from '@/stores/challenge-store';
import type { DeadlineFilter } from '@/stores/challenge-store';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ChallengeFiltersProps {
  industries: string[];
  maxPrize: number;
}

const deadlineOptions: { label: string; value: DeadlineFilter }[] = [
  { label: 'Any time', value: 'ANY' },
  { label: 'This week', value: 'THIS_WEEK' },
  { label: 'This month', value: 'THIS_MONTH' },
];

const difficultyOptions = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const difficultyLabels: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

function formatPrize(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ChallengeFilters({ industries, maxPrize }: ChallengeFiltersProps) {
  const { filters, toggleIndustry, setPrizeRange, setDeadline, toggleDifficulty, resetFilters } =
    useChallengeStore();

  const hasActiveFilters =
    filters.industries.length > 0 ||
    filters.difficulties.length > 0 ||
    filters.deadline !== 'ANY' ||
    filters.prizeRange[0] > 0 ||
    filters.prizeRange[1] < maxPrize;

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={resetFilters}>
            Reset all
          </Button>
        )}
      </div>

      <Separator />

      {/* Industry */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Industry</h3>
        <div className="space-y-2">
          {industries.map((industry) => (
            <div key={industry} className="flex items-center gap-2">
              <Checkbox
                id={`industry-${industry}`}
                checked={filters.industries.includes(industry)}
                onCheckedChange={() => {
                  toggleIndustry(industry);
                }}
              />
              <Label
                htmlFor={`industry-${industry}`}
                className="cursor-pointer text-sm font-normal"
              >
                {industry}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Prize Range */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Prize Range</h3>
        <Slider
          min={0}
          max={maxPrize}
          step={500}
          value={[filters.prizeRange[0], filters.prizeRange[1]]}
          onValueChange={(v) => {
            setPrizeRange([v[0] ?? 0, v[1] ?? maxPrize]);
          }}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatPrize(filters.prizeRange[0])}</span>
          <span>{formatPrize(filters.prizeRange[1])}</span>
        </div>
      </div>

      <Separator />

      {/* Posted */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Posted</h3>
        <div className="space-y-2">
          {deadlineOptions.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <Checkbox
                id={`deadline-${opt.value}`}
                checked={filters.deadline === opt.value}
                onCheckedChange={() => {
                  setDeadline(opt.value);
                }}
              />
              <Label
                htmlFor={`deadline-${opt.value}`}
                className="cursor-pointer text-sm font-normal"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Difficulty */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Difficulty</h3>
        <div className="space-y-2">
          {difficultyOptions.map((d) => (
            <div key={d} className="flex items-center gap-2">
              <Checkbox
                id={`difficulty-${d}`}
                checked={filters.difficulties.includes(d)}
                onCheckedChange={() => {
                  toggleDifficulty(d);
                }}
              />
              <Label htmlFor={`difficulty-${d}`} className="cursor-pointer text-sm font-normal">
                {difficultyLabels[d]}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
