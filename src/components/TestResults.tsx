'use client';

import Link from 'next/link';

interface AnswerResult {
  questionId: string;
  correct: boolean;
  correctAnswer: number;
  selectedAnswer: number;
  explanation: string;
  text: string;
  options: string[];
}

interface TestResultsProps {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  review: AnswerResult[];
  stateSlug: string;
  testType: string;
  stateName: string;
}

const optionLetters = ['A', 'B', 'C', 'D'];

export default function TestResults({
  score,
  total,
  percentage,
  passed,
  passingScore,
  review,
  stateSlug,
  testType,
  stateName,
}: TestResultsProps) {
  const testTypeLabels: Record<string, string> = {
    permit: 'Permit Test',
    drivers: "Driver's License Test",
    motorcycle: 'Motorcycle Endorsement Test',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Results Header Card */}
        <div className={`card p-8 mb-8 text-center ${passed ? 'border-t-4 border-t-green-500' : 'border-t-4 border-t-red-500'}`}>
          {/* Score Circle */}
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 text-4xl font-bold ${
            passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {percentage}%
          </div>

          {/* Pass/Fail Badge */}
          <div className="mb-4">
            <span
              className={`inline-block px-6 py-2 rounded-full text-lg font-bold ${
                passed
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {passed ? 'PASSED' : 'FAILED'}
            </span>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-navy-900 mb-2">
            {passed
              ? 'Congratulations! You passed!'
              : 'Keep studying and try again'}
          </h1>
          <p className="text-gray-600 mb-4">
            {passed
              ? `Great work! You answered ${score} out of ${total} questions correctly on the ${stateName} ${testTypeLabels[testType] || testType}.`
              : `You answered ${score} out of ${total} questions correctly. The passing score is ${passingScore}%. Review the explanations below and try again.`}
          </p>

          {/* Score Details */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <div className="text-2xl font-bold text-navy-900">{score}</div>
              <div className="text-sm text-gray-500">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-900">{total - score}</div>
              <div className="text-sm text-gray-500">Incorrect</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-900">{passingScore}%</div>
              <div className="text-sm text-gray-500">To Pass</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link
              href={`/states/${stateSlug}/test/${testType}`}
              className="btn-primary flex-1"
            >
              Retake Test
            </Link>
            <Link
              href={`/states/${stateSlug}`}
              className="btn-outline flex-1"
            >
              Back to {stateName}
            </Link>
          </div>
        </div>

        {/* Question Review */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-navy-900 mb-2">Question Review</h2>
          <p className="text-gray-600 mb-6">
            Review all {total} questions with explanations for correct answers.
          </p>

          <div className="space-y-4">
            {review.map((item, index) => (
              <div
                key={item.questionId}
                className={`card p-5 ${
                  item.correct ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${
                      item.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.correct ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-400 mb-1">Question {index + 1}</p>
                    <p className="text-navy-900 font-medium">{item.text}</p>
                  </div>
                </div>

                {/* Answer Status */}
                <div className="space-y-2 ml-10">
                  {item.selectedAnswer === -1 && (
                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="font-semibold shrink-0">Your answer:</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded">Not answered</span>
                    </div>
                  )}
                  {item.selectedAnswer !== -1 && item.selectedAnswer !== item.correctAnswer && (
                    <div className="flex items-start gap-2 text-sm text-red-600">
                      <span className="font-semibold shrink-0">Your answer:</span>
                      <span className="bg-red-50 px-2 py-0.5 rounded">
                        {optionLetters[item.selectedAnswer]}) {item.options?.[item.selectedAnswer]}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm text-green-700">
                    <span className="font-semibold shrink-0">Correct answer:</span>
                    <span className="bg-green-50 px-2 py-0.5 rounded">
                      {optionLetters[item.correctAnswer]}) {item.options?.[item.correctAnswer]}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="mt-3 ml-10 p-3 bg-blue-50 rounded-lg text-sm text-blue-900 leading-relaxed">
                  <strong>Explanation:</strong> {item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/states/${stateSlug}/test/${testType}`}
            className="btn-primary flex-1 text-center"
          >
            Retake Test
          </Link>
          <Link
            href="/states"
            className="btn-outline flex-1 text-center"
          >
            Choose Another State
          </Link>
        </div>
      </div>
    </div>
  );
}
