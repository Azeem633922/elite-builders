'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@clerk/nextjs';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OnboardingPage() {
  const router = useRouter();
  const { session } = useSession();
  const { toast } = useToast();
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeOnboarding = trpc.user.completeOnboarding.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!githubUrl) {
      toast({ title: 'GitHub URL is required', variant: 'destructive' });
      return;
    }

    if (!cvFile) {
      toast({ title: 'Please upload your CV', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload CV to Supabase Storage
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

      const { url: cvUrl } = (await uploadRes.json()) as { url: string };

      // 2. Save profile + mark onboarding complete in one call
      await completeOnboarding.mutateAsync({
        githubUrl,
        portfolioUrl: portfolioUrl || undefined,
        cvUrl,
      });

      // 3. Reload session so JWT picks up new metadata, then navigate
      await session?.reload();
      router.push('/dashboard');
    } catch (err) {
      toast({
        title: 'Something went wrong',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Tell us a bit about yourself before you start competing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL *</Label>
              <Input
                id="githubUrl"
                type="url"
                placeholder="https://github.com/yourusername"
                value={githubUrl}
                onChange={(e) => {
                  setGithubUrl(e.target.value);
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input
                id="portfolioUrl"
                type="url"
                placeholder="https://yourportfolio.com"
                value={portfolioUrl}
                onChange={(e) => {
                  setPortfolioUrl(e.target.value);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv">CV (PDF, max 5MB) *</Label>
              <Input
                id="cv"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  setCvFile(e.target.files?.[0] ?? null);
                }}
                required
              />
              {cvFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
