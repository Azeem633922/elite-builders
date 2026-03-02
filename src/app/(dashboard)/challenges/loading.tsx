export default function ChallengesLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Loading challenges...</p>
    </div>
  );
}
