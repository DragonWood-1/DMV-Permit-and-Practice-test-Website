import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🚧</div>
        <h1 className="text-4xl font-extrabold text-navy-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 text-lg mb-8">
          Sorry, we couldn&apos;t find the page you were looking for. The state or test type
          you entered may not be valid.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
          <Link href="/states" className="btn-outline">
            Browse All States
          </Link>
        </div>
      </div>
    </div>
  );
}
