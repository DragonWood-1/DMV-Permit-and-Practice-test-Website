import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { stateBySlug, states } from '@/data/states';
import { validateTestType } from '@/lib/security';
import QuizComponent from '@/components/QuizComponent';

interface Props {
  params: {
    state: string;
    type: string;
  };
}

export async function generateStaticParams() {
  const params = [];
  for (const state of states) {
    for (const type of state.testTypes) {
      params.push({ state: state.slug, type });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const state = stateBySlug(params.state);
  if (!state) return {};

  const testTypeLabels: Record<string, string> = {
    permit: "Permit Test",
    drivers: "Driver's License Test",
    motorcycle: "Motorcycle Endorsement Test",
  };

  const label = testTypeLabels[params.type] || params.type;

  return {
    title: `${state.name} ${label} Practice - Free Online Practice Test`,
    description: `Take the free ${state.name} ${label} practice exam. ${state.permitQuestions} questions, ${state.permitPassPercent}% passing score. Prepare and pass on your first try!`,
  };
}

export default function TestPage({ params }: Props) {
  const state = stateBySlug(params.state);

  if (!state || !validateTestType(params.type)) {
    notFound();
  }

  if (!state.testTypes.includes(params.type as 'permit' | 'drivers' | 'motorcycle')) {
    notFound();
  }

  const testType = params.type as 'permit' | 'drivers' | 'motorcycle';

  const passingPercents: Record<string, number> = {
    permit: state.permitPassPercent,
    drivers: state.driversPassPercent,
    motorcycle: state.motorcyclePassPercent,
  };

  return (
    <QuizComponent
      stateSlug={state.slug}
      testType={testType}
      stateName={state.name}
      passingPercent={passingPercents[testType]}
    />
  );
}
