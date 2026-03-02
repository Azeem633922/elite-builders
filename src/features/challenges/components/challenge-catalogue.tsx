'use client';

import { useMemo } from 'react';
import { useChallengeStore } from '@/stores/challenge-store';
import { ChallengeCard } from './challenge-card';
import { ChallengeFilters } from './challenge-filters';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface ChallengeWithOrg {
  id: string;
  title: string;
  slug: string;
  description: string;
  prizeAmount: number;
  deadline: Date;
  createdAt: Date;
  difficulty: string;
  organization: {
    name: string;
    logo: string | null;
    industry: string | null;
  };
}

interface ChallengeCatalogueProps {
  challenges: ChallengeWithOrg[];
}

export function ChallengeCatalogue({ challenges }: ChallengeCatalogueProps) {
  const { filters, setSearch } = useChallengeStore();

  const industries = useMemo(() => {
    const set = new Set<string>();
    for (const c of challenges) {
      if (c.organization.industry) set.add(c.organization.industry);
    }
    return Array.from(set).sort();
  }, [challenges]);

  const maxPrize = useMemo(() => {
    return Math.max(...challenges.map((c) => c.prizeAmount), 0);
  }, [challenges]);

  const filtered = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    return challenges.filter((c) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches =
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.organization.name.toLowerCase().includes(q) ||
          (c.organization.industry?.toLowerCase().includes(q) ?? false);
        if (!matches) return false;
      }

      if (filters.industries.length > 0) {
        if (!c.organization.industry || !filters.industries.includes(c.organization.industry)) {
          return false;
        }
      }

      if (c.prizeAmount < filters.prizeRange[0] || c.prizeAmount > filters.prizeRange[1]) {
        return false;
      }

      const createdAt = new Date(c.createdAt);
      if (filters.deadline === 'THIS_WEEK' && createdAt < weekAgo) return false;
      if (filters.deadline === 'THIS_MONTH' && createdAt < monthAgo) return false;

      if (filters.difficulties.length > 0 && !filters.difficulties.includes(c.difficulty)) {
        return false;
      }

      return true;
    });
  }, [challenges, filters]);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <Input
        type="search"
        placeholder="Search challenges..."
        value={filters.search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        className="max-w-md"
      />

      <div className="flex gap-8">
        {/* Filter box */}
        <div className="w-72 shrink-0">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <ChallengeFilters industries={industries} maxPrize={maxPrize} />
            </CardContent>
          </Card>
        </div>

        {/* Challenge grid */}
        <div className="min-w-0 flex-1">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg font-medium">No challenges found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}

          <p className="mt-6 text-sm text-muted-foreground">
            Showing {filtered.length} of {challenges.length} challenge
            {challenges.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
