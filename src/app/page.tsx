import type { Metadata } from 'next';
import Link from 'next/link';
import StateCard from '@/components/StateCard';
import { states } from '@/data/states';

export const metadata: Metadata = {
  title: 'Free DMV Practice Tests for All 50 States - Pass Your Test First Try',
  description:
    'Free DMV practice tests for all 50 states. Prepare for your permit test, driver\'s license exam, or motorcycle endorsement with 200+ realistic questions. Pass on your first try!',
};

const features = [
  {
    icon: '🗺️',
    title: 'All 50 States',
    description: 'Practice tests for every US state with state-specific questions and requirements.',
  },
  {
    icon: '📝',
    title: '200+ Questions',
    description: 'Comprehensive question bank covering all DMV test topics with detailed explanations.',
  },
  {
    icon: '🆓',
    title: 'Free Practice Tests',
    description: 'No registration, no fees. Take as many practice tests as you need.',
  },
  {
    icon: '🔄',
    title: 'Updated Regularly',
    description: 'Questions are updated to reflect the latest state DMV requirements.',
  },
];

const steps = [
  {
    number: '1',
    title: 'Select Your State',
    description: 'Choose from all 50 states to get questions specific to your state\'s DMV requirements.',
  },
  {
    number: '2',
    title: 'Take the Practice Test',
    description: 'Answer realistic questions covering road signs, traffic laws, and safety rules.',
  },
  {
    number: '3',
    title: 'Review & Improve',
    description: 'See your score, review wrong answers with explanations, and retake until you\'re ready.',
  },
];

// Show a curated selection of popular states on the home page
const featuredStates = states.filter((s) =>
  ['california', 'texas', 'new-york', 'florida', 'illinois', 'pennsylvania', 'ohio', 'georgia'].includes(s.slug)
);

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-700 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-balance leading-tight">
            Pass Your DMV Test on the{' '}
            <span className="text-gold-400">First Try</span>
          </h1>
          <p className="text-xl md:text-2xl text-navy-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Free practice tests for all 50 states. Permit tests, driver&apos;s license exams,
            and motorcycle endorsements &mdash; with detailed explanations for every answer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/states"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg bg-gold-500 text-navy-900 hover:bg-gold-400 transition-colors shadow-lg min-h-[56px]"
            >
              Start Practice Test &rarr;
            </Link>
            <Link
              href="/states"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg border-2 border-white text-white hover:bg-white hover:text-navy-900 transition-colors min-h-[56px]"
            >
              Browse All States
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-heading">Everything You Need to Pass</h2>
            <p className="section-subheading">
              Comprehensive DMV test preparation for drivers of all experience levels.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-xl bg-gray-50">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-navy-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-heading">How It Works</h2>
            <p className="section-subheading">Get ready for your DMV test in three simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-navy-900 text-white text-xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/states" className="btn-primary">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Popular States Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-heading">Popular States</h2>
            <p className="section-subheading">
              Get started with practice tests for some of the most popular states.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {featuredStates.map((state) => (
              <StateCard key={state.slug} state={state} />
            ))}
          </div>
          <div className="text-center">
            <Link href="/states" className="btn-outline">
              View All 50 States &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-navy-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Pass Your DMV Test?
          </h2>
          <p className="text-navy-100 text-lg mb-8">
            Join thousands of drivers who prepared with our free practice tests.
            Start studying today and pass with confidence.
          </p>
          <Link
            href="/states"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg bg-gold-500 text-navy-900 hover:bg-gold-400 transition-colors shadow-lg min-h-[56px]"
          >
            Choose Your State &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
