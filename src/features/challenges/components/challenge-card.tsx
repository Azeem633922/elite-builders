import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    slug: string;
    description: string;
    prizeAmount: number;
    deadline: Date | string;
    createdAt: Date | string;
    difficulty?: string | null;
    organization: {
      name: string;
      logo: string | null;
      industry: string | null;
    };
  };
}

function formatDeadline(deadline: Date | string): string {
  const d = new Date(deadline);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return 'Closed';
  if (days === 0) return 'Closes today';
  if (days === 1) return '1 day left';
  if (days <= 14) return `${String(days)} days left`;
  return `Closes ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function formatPrize(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPostedDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${String(days)}d ago`;
  if (days < 30) return `${String(Math.floor(days / 7))}w ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const deadlineText = formatDeadline(challenge.deadline);
  const isUrgent = deadlineText.includes('day') && !deadlineText.includes('Closes');

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      {/* Top section */}
      <div className="p-6 pb-0">
        {/* Posted date — top right */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 border">
              <AvatarImage src={challenge.organization.logo ?? undefined} />
              <AvatarFallback className="text-xs font-medium">
                {challenge.organization.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-bold text-foreground">{challenge.organization.name}</span>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatPostedDate(challenge.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-snug">{challenge.title}</h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {challenge.description}
        </p>

        {/* Badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {challenge.difficulty && (
            <Badge variant="outline">
              {challenge.difficulty.charAt(0) + challenge.difficulty.slice(1).toLowerCase()}
            </Badge>
          )}
          {challenge.organization.industry && (
            <Badge variant="outline" className="text-xs">
              {challenge.organization.industry}
            </Badge>
          )}
        </div>
      </div>

      {/* Bottom section */}
      <div className="mt-auto p-6 pt-4">
        <Separator className="mb-5" />

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {formatPrize(challenge.prizeAmount)}
          </span>
          <span
            className={`text-sm ${isUrgent ? 'font-semibold text-destructive' : 'text-muted-foreground'}`}
          >
            {deadlineText}
          </span>
        </div>

        <Link href={`/challenges/${challenge.slug}`} className="mt-4 block">
          <Button className="w-full" size="lg">
            View Challenge
          </Button>
        </Link>
      </div>
    </Card>
  );
}
