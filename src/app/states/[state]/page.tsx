import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { stateBySlug, states } from '@/data/states';
import { getQuestionCount } from '@/lib/questions';

interface Props {
  params: { state: string };
}

export async function generateStaticParams() {
  return states.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const state = stateBySlug(params.state);
  if (!state) return {};

  return {
    title: `${state.name} DMV Practice Test - Free Permit & Driver's License Test`,
    description: `Free ${state.name} DMV practice tests. Prepare for your ${state.name} permit test or driver's license exam with realistic questions. Passing score: ${state.permitPassPercent}%.`,
  };
}

const testTypeInfo = {
  permit: {
    label: 'Learner\'s Permit Test',
    description: 'Test your knowledge of traffic laws, road signs, and safe driving practices required to obtain a learner\'s permit.',
    icon: '📋',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  drivers: {
    label: "Driver's License Test",
    description: 'Comprehensive knowledge test covering all aspects of safe driving required for a full driver\'s license.',
    icon: '🪪',
    color: 'bg-green-50 border-green-200 hover:border-green-400',
    buttonColor: 'bg-green-600 hover:bg-green-700 text-white',
  },
  motorcycle: {
    label: 'Motorcycle Endorsement Test',
    description: 'Special knowledge test for motorcycle riders covering motorcycle-specific safety, equipment, and techniques.',
    icon: '🏍️',
    color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    buttonColor: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
};

export default function StatePage({ params }: Props) {
  const state = stateBySlug(params.state);

  if (!state) {
    notFound();
  }

  const permitCount = getQuestionCount(state.abbreviation, 'permit');
  const driversCount = getQuestionCount(state.abbreviation, 'drivers');
  const motorcycleCount = getQuestionCount(state.abbreviation, 'motorcycle');

  const questionCounts: Record<string, number> = {
    permit: permitCount,
    drivers: driversCount,
    motorcycle: motorcycleCount,
  };

  const passingPercents: Record<string, number> = {
    permit: state.permitPassPercent,
    drivers: state.driversPassPercent,
    motorcycle: state.motorcyclePassPercent,
  };

  const officialCounts: Record<string, number> = {
    permit: state.permitQuestions,
    drivers: state.driversQuestions,
    motorcycle: state.motorcycleQuestions,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* State Header */}
      <div className="bg-navy-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/states"
              className="text-navy-300 hover:text-white text-sm transition-colors"
            >
              &larr; All States
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-16 relative rounded-lg overflow-hidden shadow-lg flex-shrink-0">
              <Image
                src={state.flagUrl}
                alt={`${state.name} state flag`}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{state.name}</h1>
              <p className="text-navy-200 text-lg">DMV Practice Tests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Official DMV Link */}
        <div className="card p-5 mb-8 flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">Official {state.name} DMV Website</p>
            <a
              href={state.dmvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-700 hover:text-navy-900 font-medium hover:underline break-all"
            >
              {state.dmvUrl}
            </a>
          </div>
          <a
            href={state.dmvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 btn-outline text-sm px-4 py-2"
          >
            Visit &rarr;
          </a>
        </div>

        {/* State Notes */}
        <div className="card p-5 mb-8 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-xl">ℹ️</div>
            <div>
              <h2 className="font-semibold text-navy-900 mb-1">{state.name} DMV Test Requirements</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{state.notes}</p>
            </div>
          </div>
        </div>

        {/* Test Types */}
        <h2 className="text-2xl font-bold text-navy-900 mb-6">Available Practice Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-5 mb-8">
          {state.testTypes.map((type) => {
            const info = testTypeInfo[type];
            return (
              <div
                key={type}
                className={`card p-6 border-2 transition-colors ${info.color}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-shrink-0 text-4xl">{info.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-navy-900 mb-1">{info.label}</h3>
                    <p className="text-gray-600 text-sm mb-3">{info.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>
                        <strong className="text-navy-800">{questionCounts[type]}</strong> practice questions
                      </span>
                      <span>
                        Official test: <strong className="text-navy-800">{officialCounts[type]}</strong> questions
                      </span>
                      <span>
                        Passing score: <strong className="text-navy-800">{passingPercents[type]}%</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link
                      href={`/states/${state.slug}/test/${type}`}
                      className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px] ${info.buttonColor}`}
                    >
                      Start Test &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips Section */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Tips for Passing Your {state.name} DMV Test</h2>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-green-600 font-bold">✓</span>
              <span className="text-gray-700 text-sm">
                <strong>Study the {state.name} Driver&apos;s Manual</strong> &mdash; Download it from the official DMV website and read it thoroughly.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-green-600 font-bold">✓</span>
              <span className="text-gray-700 text-sm">
                <strong>Take multiple practice tests</strong> &mdash; Aim to consistently score 90%+ before taking the real test.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-green-600 font-bold">✓</span>
              <span className="text-gray-700 text-sm">
                <strong>Review wrong answers carefully</strong> &mdash; Read the explanations to understand why each answer is correct.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-green-600 font-bold">✓</span>
              <span className="text-gray-700 text-sm">
                <strong>Know the passing score</strong> &mdash; You need {state.permitPassPercent}% to pass. Aim to score well above the minimum.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-green-600 font-bold">✓</span>
              <span className="text-gray-700 text-sm">
                <strong>Visit the official DMV</strong> &mdash; Verify all requirements and bring the required documents on test day.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
