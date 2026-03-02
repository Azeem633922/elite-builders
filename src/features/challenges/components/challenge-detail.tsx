'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CountdownTimer } from './countdown-timer';

interface RubricDimension {
  name: string;
  weight: number;
  description: string;
}

interface ChallengeDetailProps {
  challenge: {
    id: string;
    title: string;
    slug: string;
    description: string;
    problemStatement: string;
    evaluationRubric: { dimensions: RubricDimension[] } | null;
    prizeAmount: number;
    deadline: string;
    createdAt: string;
    difficulty: string | null;
    status: string;
    organization: {
      name: string;
      logo: string | null;
      industry: string | null;
    };
  };
  hasSubmitted: boolean;
  userSubmissionId: string | null;
}

function formatPrize(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function renderProblemStatement(text: string) {
  const lines = text.split('\n');

  return lines.map((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={i} className="mb-2 mt-6 text-lg font-semibold first:mt-0">
          {trimmed.slice(3)}
        </h3>
      );
    }

    if (/^\d+\.\s\*\*/.test(trimmed)) {
      const match = /^(\d+\.)\s\*\*(.+?)\*\*\s*[—–-]\s*(.+)$/.exec(trimmed);
      if (match) {
        return (
          <p key={i} className="mb-1.5 ml-4">
            <span className="font-medium">{match[1]}</span> <strong>{match[2]}</strong> — {match[3]}
          </p>
        );
      }
    }

    if (trimmed.startsWith('- ')) {
      return (
        <p key={i} className="mb-1 ml-4">
          &bull; {trimmed.slice(2)}
        </p>
      );
    }

    if (trimmed === '') {
      return <div key={i} className="h-2" />;
    }

    return (
      <p key={i} className="mb-1 leading-relaxed text-muted-foreground">
        {trimmed}
      </p>
    );
  });
}

export function ChallengeDetail({
  challenge,
  hasSubmitted,
  userSubmissionId,
}: ChallengeDetailProps) {
  const [deadlinePassed, setDeadlinePassed] = useState(false);

  useEffect(() => {
    setDeadlinePassed(new Date(challenge.deadline) < new Date());
  }, [challenge.deadline]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Back link */}
      <Link
        href="/challenges"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to Challenges
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={challenge.organization.logo ?? undefined} />
            <AvatarFallback className="text-sm font-medium">
              {challenge.organization.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold text-foreground">{challenge.organization.name}</p>
            {challenge.organization.industry && (
              <p className="text-xs text-muted-foreground">{challenge.organization.industry}</p>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold">{challenge.title}</h1>

        <div className="flex flex-wrap items-center gap-2">
          {challenge.difficulty && (
            <Badge variant="outline">
              {challenge.difficulty.charAt(0) + challenge.difficulty.slice(1).toLowerCase()}
            </Badge>
          )}
          <Badge variant="outline">
            {challenge.status.charAt(0) + challenge.status.slice(1).toLowerCase()}
          </Badge>
        </div>

        <p className="text-base leading-relaxed text-muted-foreground">{challenge.description}</p>
      </div>

      <Separator />

      {/* Prize & Countdown */}
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Prize Pool</p>
          <p className="text-4xl font-bold text-primary">{formatPrize(challenge.prizeAmount)}</p>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Time Remaining</p>
          <CountdownTimer deadline={challenge.deadline} />
        </div>
      </div>

      <Separator />

      {/* Problem Statement */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Problem Statement</h2>
        <Card>
          <CardContent className="p-6">
            {renderProblemStatement(challenge.problemStatement)}
          </CardContent>
        </Card>
      </div>

      {/* Evaluation Rubric */}
      {challenge.evaluationRubric && challenge.evaluationRubric.dimensions.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Evaluation Rubric</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {challenge.evaluationRubric.dimensions.map((dim) => (
              <div
                key={dim.name}
                className="rounded-xl border bg-card shadow"
                style={{ padding: '1.5rem' }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{dim.name}</h3>
                  <span className="text-sm font-bold text-primary">{dim.weight}%</span>
                </div>
                <div className="mb-3 h-2 overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${String(dim.weight)}%` }}
                  />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{dim.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Submit Button */}
      <div className="flex justify-center pb-8">
        {deadlinePassed ? (
          <Button size="lg" disabled className="min-w-64 py-6 text-base">
            Submissions Closed
          </Button>
        ) : hasSubmitted ? (
          <Link href={`/challenges/${challenge.slug}/submissions/${String(userSubmissionId)}`}>
            <Button size="lg" variant="outline" className="min-w-64 py-6 text-base">
              You&apos;ve already submitted &mdash; View your submission
            </Button>
          </Link>
        ) : (
          <Link href={`/challenges/${challenge.slug}/submit`}>
            <Button size="lg" className="min-w-64 py-6 text-base">
              Submit Your Solution
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
