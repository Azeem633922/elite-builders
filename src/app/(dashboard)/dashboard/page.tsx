'use client';

import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { data: user, isLoading } = trpc.user.getCurrent.useQuery();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-9 w-48 rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 rounded-lg border bg-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Welcome back, {user?.name ?? 'Builder'}</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Challenges</CardTitle>
            <CardDescription>Open challenges you can enter</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Submissions</CardTitle>
            <CardDescription>Your submitted MVPs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Career Score</CardTitle>
            <CardDescription>Your cumulative score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold">{user?.careerScore ?? 0}</p>
              <Badge variant="secondary">pts</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
