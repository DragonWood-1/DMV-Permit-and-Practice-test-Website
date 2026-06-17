'use client';

import { useState } from 'react';
import StateCard from '@/components/StateCard';
import { states } from '@/data/states';

export default function StatesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStates = states.filter(
    (state) =>
      state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      state.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-4">
            DMV Practice Tests &mdash; All 50 States
          </h1>
          <p className="text-navy-100 text-xl max-w-2xl mx-auto">
            Select your state to start practicing for your permit test, driver&apos;s license exam,
            or motorcycle endorsement.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search states..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
              aria-label="Search states"
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-500 text-center">
              {filteredStates.length} state{filteredStates.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* States Grid */}
        {filteredStates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStates.map((state) => (
              <StateCard key={state.slug} state={state} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2">No states found</h2>
            <p className="text-gray-600">
              No states match &quot;{searchQuery}&quot;. Try searching by state name or abbreviation.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 btn-outline"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
