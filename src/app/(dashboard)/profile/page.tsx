'use client';

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { data: user, isLoading } = trpc.user.getCurrent.useQuery();
  const updateUser = trpc.user.update.useMutation({
    onSuccess: () => {
      void utils.user.getCurrent.invalidate();
      toast({ title: 'Profile updated' });
    },
    onError: (err) => {
      toast({ title: 'Failed to update', description: err.message, variant: 'destructive' });
    },
  });

  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [name, setName] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setGithubUrl(user.githubUrl ?? '');
      setPortfolioUrl(user.portfolioUrl ?? '');
      setName(user.name ?? '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let cvUrl: string | undefined;

      // Upload new CV if selected
      if (cvFile) {
        const formData = new FormData();
        formData.append('file', cvFile);
        const uploadRes = await fetch('/api/upload-cv', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = (await uploadRes.json()) as { error: string };
          throw new Error(err.error || 'CV upload failed');
        }

        const data = (await uploadRes.json()) as { url: string };
        cvUrl = data.url;
      }

      await updateUser.mutateAsync({
        name: name || undefined,
        githubUrl: githubUrl || undefined,
        portfolioUrl: portfolioUrl || undefined,
        cvUrl,
      });

      setCvFile(null);
    } catch (err) {
      toast({
        title: 'Something went wrong',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-9 w-48 rounded bg-muted" />
        <div className="h-96 rounded-lg border bg-card" />
      </div>
    );
  }

  const isSaving = isUploading || updateUser.isPending;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold">Edit Profile</h1>

      {/* Current Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.name ?? 'User'} />
              <AvatarFallback>{user?.name?.charAt(0) ?? '?'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.name ?? 'Anonymous'}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your builder profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Your name"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                type="url"
                value={githubUrl}
                onChange={(e) => {
                  setGithubUrl(e.target.value);
                }}
                placeholder="https://github.com/yourusername"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input
                id="portfolioUrl"
                type="url"
                value={portfolioUrl}
                onChange={(e) => {
                  setPortfolioUrl(e.target.value);
                }}
                placeholder="https://yourportfolio.com"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="cv">Replace CV (PDF, max 5MB)</Label>
              {user?.cvUrl && (
                <p className="text-sm text-muted-foreground">
                  Current:{' '}
                  <a
                    href={user.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    View current CV
                  </a>
                </p>
              )}
              <Input
                id="cv"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  setCvFile(e.target.files?.[0] ?? null);
                }}
              />
              {cvFile && (
                <p className="text-sm text-muted-foreground">
                  New file: {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              )}
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
