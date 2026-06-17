import Link from 'next/link';
import Image from 'next/image';
import { StateData } from '@/data/states';

interface StateCardProps {
  state: StateData;
}

const testTypeLabels: Record<string, string> = {
  permit: 'Permit',
  drivers: "Driver's",
  motorcycle: 'Motorcycle',
};

const testTypeColors: Record<string, string> = {
  permit: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  drivers: 'bg-green-100 text-green-800 hover:bg-green-200',
  motorcycle: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
};

export default function StateCard({ state }: StateCardProps) {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="p-5">
        {/* State Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-8 relative flex-shrink-0 rounded overflow-hidden shadow-sm">
            <Image
              src={state.flagUrl}
              alt={`${state.name} state flag`}
              fill
              className="object-cover"
              sizes="48px"
              unoptimized
            />
          </div>
          <div>
            <h3 className="font-bold text-navy-900 text-lg leading-tight">{state.name}</h3>
            <span className="text-gray-500 text-sm">{state.abbreviation}</span>
          </div>
        </div>

        {/* Test Type Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {state.testTypes.map((type) => (
            <Link
              key={type}
              href={`/states/${state.slug}/test/${type}`}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors min-h-[36px] flex items-center ${testTypeColors[type]}`}
            >
              {testTypeLabels[type]}
            </Link>
          ))}
        </div>

        {/* View State Details Link */}
        <Link
          href={`/states/${state.slug}`}
          className="text-sm text-navy-700 hover:text-navy-900 font-medium hover:underline"
        >
          View test details &rarr;
        </Link>
      </div>
    </div>
  );
}
