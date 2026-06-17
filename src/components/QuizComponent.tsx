'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface QuestionData {
  id: string;
  text: string;
  options: string[];
  category: string;
  topic: string;
}

interface QuizComponentProps {
  stateSlug: string;
  testType: 'permit' | 'drivers' | 'motorcycle';
  stateName: string;
  passingPercent: number;
}

export default function QuizComponent({
  stateSlug,
  testType,
  stateName,
  passingPercent,
}: QuizComponentProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/questions?state=${stateSlug}&type=${testType}&count=40`
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch questions');
        }

        const data = await response.json();
        setQuestions(data.questions);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [stateSlug, testType]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const handleAnswerSelect = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitRequest = () => {
    setShowConfirm(true);
  };

  const handleSubmitConfirm = useCallback(async () => {
    setShowConfirm(false);
    setSubmitting(true);

    try {
      const submittedAnswers = questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] ?? -1,
      }));

      const response = await fetch('/api/submit-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: stateSlug,
          type: testType,
          answers: submittedAnswers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit test');
      }

      const result = await response.json();

      // Store results in sessionStorage for the results page
      sessionStorage.setItem(
        `test-results-${stateSlug}-${testType}`,
        JSON.stringify(result)
      );

      router.push(`/states/${stateSlug}/test/${testType}/results`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit test. Please try again.');
      setSubmitting(false);
    }
  }, [questions, answers, stateSlug, testType, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-navy-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600">No questions available for this test.</p>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const canSubmit = answeredCount === totalQuestions;
  const currentAnswer = answers[currentQuestion.id];

  const testTypeLabels: Record<string, string> = {
    permit: 'Permit Test',
    drivers: "Driver's License Test",
    motorcycle: 'Motorcycle Endorsement Test',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 text-white py-4 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-navy-200 text-sm mb-1">{stateName} &mdash; {testTypeLabels[testType]}</p>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">
              Question {currentIndex + 1} of {totalQuestions}
            </h1>
            <span className="text-sm text-navy-200">
              {answeredCount} answered
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 bg-navy-700 rounded-full h-2">
            <div
              className="bg-gold-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={answeredCount}
              aria-valuemin={0}
              aria-valuemax={totalQuestions}
              aria-label={`${answeredCount} of ${totalQuestions} questions answered`}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Question Card */}
        <div className="card p-6 md:p-8 mb-6">
          {/* Topic Badge */}
          <div className="mb-4">
            <span className="inline-block bg-navy-50 text-navy-700 text-xs font-semibold px-3 py-1 rounded-full">
              {currentQuestion.topic}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl font-semibold text-navy-900 mb-6 leading-relaxed">
            {currentQuestion.text}
          </h2>

          {/* Answer Options */}
          <div className="space-y-3" role="radiogroup" aria-label="Answer options">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentAnswer === index;
              const letters = ['A', 'B', 'C', 'D'];

              return (
                <button
                  key={index}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all min-h-[56px] flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                    isSelected
                      ? 'border-navy-600 bg-navy-50 text-navy-900'
                      : 'border-gray-200 bg-white hover:border-navy-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${
                      isSelected
                        ? 'bg-navy-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {letters[index]}
                  </span>
                  <span className="flex-1 text-base leading-snug">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="btn-outline disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
          >
            &larr; Previous
          </button>

          <div className="hidden sm:flex gap-2 flex-wrap justify-center">
            {questions.map((q, i) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`w-8 h-8 text-xs font-semibold rounded-md transition-colors ${
                    isCurrent
                      ? 'bg-navy-900 text-white'
                      : isAnswered
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  aria-label={`Question ${i + 1}${isAnswered ? ' (answered)' : ''}`}
                  aria-current={isCurrent ? 'true' : undefined}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {isLastQuestion ? (
            <button
              type="button"
              onClick={handleSubmitRequest}
              disabled={submitting}
              className="btn-secondary flex-1 sm:flex-none"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex-1 sm:flex-none"
            >
              Next &rarr;
            </button>
          )}
        </div>

        {/* Submit early button */}
        {!isLastQuestion && canSubmit && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleSubmitRequest}
              disabled={submitting}
              className="text-sm text-navy-700 hover:text-navy-900 font-medium underline"
            >
              All questions answered - submit test now
            </button>
          </div>
        )}

        {/* Incomplete notice */}
        {isLastQuestion && !canSubmit && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <strong>{totalQuestions - answeredCount} question{totalQuestions - answeredCount !== 1 ? 's' : ''} unanswered.</strong>{' '}
            You can submit now or go back to answer remaining questions.
            <button
              type="button"
              onClick={handleSubmitRequest}
              disabled={submitting}
              className="block mt-2 text-navy-700 font-semibold underline"
            >
              Submit anyway
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-navy-900 mb-3">Submit Test?</h3>
            <p className="text-gray-600 mb-2">
              You have answered <strong>{answeredCount}</strong> of{' '}
              <strong>{totalQuestions}</strong> questions.
            </p>
            {answeredCount < totalQuestions && (
              <p className="text-yellow-700 bg-yellow-50 rounded p-2 text-sm mb-4">
                {totalQuestions - answeredCount} question(s) will be marked as incorrect.
              </p>
            )}
            <p className="text-gray-600 text-sm mb-6">
              You need {passingPercent}% to pass. Are you ready to submit?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 btn-outline"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleSubmitConfirm}
                className="flex-1 btn-secondary"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
