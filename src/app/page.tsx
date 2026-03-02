import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">EliteBuilders</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          The competitive platform where solo builders submit AI-powered MVPs for company-sponsored
          challenges — scored by AI and human judges.
        </p>
      </div>
      <div className="flex gap-4">
        <Link href="/sign-in">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="/sign-in">
          <Button size="lg" variant="outline">
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}
