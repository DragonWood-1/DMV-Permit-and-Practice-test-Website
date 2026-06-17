import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const stateLinks = [
    { slug: 'california', name: 'California' },
    { slug: 'texas', name: 'Texas' },
    { slug: 'new-york', name: 'New York' },
    { slug: 'florida', name: 'Florida' },
    { slug: 'illinois', name: 'Illinois' },
    { slug: 'pennsylvania', name: 'Pennsylvania' },
  ];

  return (
    <footer className="bg-navy-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🚗</span>
              <span className="text-white font-bold text-lg">DMV Practice Tests</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Free DMV practice tests for all 50 states. Prepare for your permit test,
              driver&apos;s license exam, or motorcycle endorsement with realistic practice questions.
            </p>
          </div>

          {/* Popular States */}
          <div>
            <h3 className="text-white font-semibold mb-4">Popular States</h3>
            <ul className="space-y-2">
              {stateLinks.map((state) => (
                <li key={state.slug}>
                  <Link
                    href={`/states/${state.slug}`}
                    className="text-sm text-gray-400 hover:text-gold-400 transition-colors"
                  >
                    {state.name} DMV Practice Test
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-gold-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/states" className="text-sm text-gray-400 hover:text-gold-400 transition-colors">
                  All 50 States
                </Link>
              </li>
              <li>
                <a href="/api/health" className="text-sm text-gray-400 hover:text-gold-400 transition-colors">
                  API Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-navy-800 pt-8">
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            <strong className="text-gray-400">Disclaimer:</strong> This website provides practice
            materials for educational purposes only. The questions on this site are representative
            of DMV written tests but are not official DMV questions. Test requirements, question
            counts, and passing scores vary by state and may change. Always verify current
            requirements with your state&apos;s official DMV website before taking your actual test.
            This site is not affiliated with any state DMV or government agency.
          </p>
          <p className="text-xs text-gray-500">
            &copy; {currentYear} DMV Practice Tests. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
