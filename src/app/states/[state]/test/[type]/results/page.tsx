'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TestResults from '@/components/TestResults';
import { stateBySlug } from '@/data/states';
import Link from 'next/link';

interface ResultData {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  review: Array<{
    questionId: string;
    correct: boolean;
    correctAnswer: number;
    selectedAnswer: number;
    explanation: string;
    text: string;
    options: string[];
  }>;
}

interface Props {
  params: {
    state: string;
    type: string;
  };
}

export default function ResultsPage({ params }: Props) {
  const router = useRouter();
  const [results, setResults] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  const state = stateBySlug(params.state);
  const testType = params.type;

  useEffect(() => {
    const stored = sessionStorage.getItem(`test-results-${params.state}-${params.type}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResults(parsed);
      } catch {
        // Invalid data
      }
    }
    setLoading(false);
  }, [params.state, params.type]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900 mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-navy-900 mb-2">No Test Results Found</h2>
          <p className="text-gray-600 mb-6">
            It looks like you haven&apos;t taken this test yet, or your results have expired.
            Take the practice test to see your results here.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/states/${params.state}/test/${params.type}`}
              className="btn-primary"
            >
              Take the Test
            </Link>
            <Link href="/states" className="btn-outline">
              Browse States
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TestResults
      {...results}
      stateSlug={params.state}
      testType={testType}
      stateName={state.name}
    />
  );
}
