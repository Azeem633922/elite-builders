'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface SubmissionFormProps {
  challenge: {
    id: string;
    title: string;
    slug: string;
    deadline: string;
  };
}

const GITHUB_URL_REGEX = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+/;
const MAX_DESCRIPTION = 500;
const MAX_DECK_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SubmissionForm({ challenge }: SubmissionFormProps) {
  const router = useRouter();

  // Form state
  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [deckFile, setDeckFile] = useState<File | null>(null);
  const [deckUrl, setDeckUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploadUrl, setVideoUploadUrl] = useState<string | null>(null);

  // UI state
  const [repoError, setRepoError] = useState('');
  const [deckUploading, setDeckUploading] = useState(false);
  const [deckError, setDeckError] = useState('');
  const [videoError, setVideoError] = useState('');
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const deckInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const createSubmission = trpc.submission.create.useMutation();

  // Validation
  const isRepoValid = GITHUB_URL_REGEX.test(repoUrl);
  const isDescriptionValid =
    description.trim().length >= 10 && description.length <= MAX_DESCRIPTION;
  const isDeckReady = !!deckUrl;
  const isVideoReady = videoUploaded && !!videoUploadUrl;
  const canSubmit =
    isRepoValid && isDescriptionValid && isDeckReady && isVideoReady && !isSubmitting;

  function handleRepoChange(value: string) {
    setRepoUrl(value);
    if (value && !GITHUB_URL_REGEX.test(value)) {
      setRepoError('Must be a valid GitHub URL (e.g., https://github.com/user/repo)');
    } else {
      setRepoError('');
    }
  }

  function handleDeckSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setDeckError('');
    setDeckUrl(null);

    if (file.type !== 'application/pdf') {
      setDeckError('Only PDF files are allowed');
      setDeckFile(null);
      return;
    }

    if (file.size > MAX_DECK_SIZE) {
      setDeckError(`File must be under 10MB (yours is ${formatFileSize(file.size)})`);
      setDeckFile(null);
      return;
    }

    setDeckFile(file);
    void uploadDeck(file);
  }

  async function uploadDeck(file: File) {
    setDeckError('');
    setDeckUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('challengeId', challenge.id);

    try {
      const res = await fetch('/api/upload-deck', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Deck upload failed');
      }

      const data = (await res.json()) as { url: string };
      setDeckUrl(data.url);
    } catch (err) {
      setDeckError(err instanceof Error ? err.message : 'Deck upload failed');
    } finally {
      setDeckUploading(false);
    }
  }

  function handleVideoSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoError('');
    setVideoUploaded(false);
    setVideoUploadUrl(null);
    setVideoProgress(null);

    if (file.type !== 'video/mp4') {
      setVideoError('Only MP4 files are allowed');
      setVideoFile(null);
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setVideoError(`File must be under 500MB (yours is ${formatFileSize(file.size)})`);
      setVideoFile(null);
      return;
    }

    setVideoFile(file);
    void startVideoUpload(file);
  }

  async function startVideoUpload(file: File) {
    setVideoError('');
    setVideoProgress(0);

    try {
      // Get direct upload URL from Mux
      const res = await fetch('/api/mux/upload', { method: 'POST' });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to create video upload');
      }

      const { uploadUrl, uploadId } = (await res.json()) as { uploadUrl: string; uploadId: string };

      // Upload directly to Mux via XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setVideoProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error('Video upload failed'));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Video upload failed'));
        };

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', 'video/mp4');
        xhr.send(file);
      });

      // Store the Mux upload ID as the video reference
      setVideoUploadUrl(`mux://upload/${uploadId}`);
      setVideoUploaded(true);
      setVideoProgress(100);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : 'Video upload failed');
      setVideoProgress(null);
    }
  }

  async function handleSubmit() {
    if (!canSubmit || !deckUrl || !videoUploadUrl) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const submission = await createSubmission.mutateAsync({
        challengeId: challenge.id,
        repoUrl,
        deckUrl,
        videoUrl: videoUploadUrl,
        description,
      });

      router.push(`/submissions/${submission.id}/status`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/challenges/${challenge.slug}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Challenge
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Submit Your Solution</h1>
        <p className="mt-1 text-muted-foreground">{challenge.title}</p>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6 pt-6">
          {/* GitHub Repository URL */}
          <div className="space-y-2">
            <Label htmlFor="repoUrl">GitHub Repository URL *</Label>
            <Input
              id="repoUrl"
              type="url"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => {
                handleRepoChange(e.target.value);
              }}
            />
            {repoError && <p className="text-sm text-destructive">{repoError}</p>}
          </div>

          <Separator />

          {/* Pitch Deck Upload */}
          <div className="space-y-2">
            <Label htmlFor="deck">Pitch Deck (PDF, max 10MB) *</Label>
            <input
              ref={deckInputRef}
              id="deck"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleDeckSelect}
              style={{ display: 'none' }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={deckUploading}
              onClick={() => deckInputRef.current?.click()}
            >
              {deckUploading ? 'Uploading...' : deckFile ? 'Change File' : 'Choose File'}
            </Button>
            {deckFile && (
              <p className="text-sm text-muted-foreground">
                {deckFile.name} ({formatFileSize(deckFile.size)})
                {deckUploading && <span className="ml-2">— Uploading...</span>}
                {deckUrl && <span className="ml-2 font-medium text-green-600">Uploaded</span>}
              </p>
            )}
            {deckError && <p className="text-sm text-destructive">{deckError}</p>}
          </div>

          <Separator />

          {/* Demo Video Upload */}
          <div className="space-y-2">
            <Label htmlFor="video">Demo Video (MP4, max 500MB) *</Label>
            <input
              ref={videoInputRef}
              id="video"
              type="file"
              accept=".mp4,video/mp4"
              onChange={handleVideoSelect}
              style={{ display: 'none' }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => videoInputRef.current?.click()}
              disabled={videoProgress !== null && !videoUploaded}
            >
              {videoFile ? 'Change File' : 'Choose File'}
            </Button>
            {videoFile && (
              <p className="text-sm text-muted-foreground">
                {videoFile.name} ({formatFileSize(videoFile.size)})
              </p>
            )}
            {videoProgress !== null && (
              <div className="space-y-1">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${String(videoProgress)}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {videoUploaded ? (
                    <span className="font-medium text-green-600">Upload complete</span>
                  ) : (
                    `Uploading... ${String(videoProgress)}%`
                  )}
                </p>
              </div>
            )}
            {videoError && (
              <div className="space-y-1">
                <p className="text-sm text-destructive">{videoError}</p>
                {videoFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => startVideoUpload(videoFile)}
                  >
                    Retry Upload
                  </Button>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Project Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Project Description *</Label>
              <span
                className={`text-xs ${
                  description.length > MAX_DESCRIPTION
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {description.length}/{MAX_DESCRIPTION}
              </span>
            </div>
            <Textarea
              id="description"
              placeholder="Describe your solution, approach, and key features..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              maxLength={MAX_DESCRIPTION}
              rows={5}
            />
            {description.length > 0 && description.trim().length < 10 && (
              <p className="text-sm text-destructive">Description must be at least 10 characters</p>
            )}
          </div>

          <Separator />

          {/* Submit */}
          {submitError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{submitError}</p>
            </div>
          )}

          <Button className="w-full" size="lg" disabled={!canSubmit} onClick={handleSubmit}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Submitting...
              </span>
            ) : (
              'Submit Solution'
            )}
          </Button>

          {!canSubmit && !isSubmitting && (
            <p className="text-center text-xs text-muted-foreground">
              All four fields must be completed to submit
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
