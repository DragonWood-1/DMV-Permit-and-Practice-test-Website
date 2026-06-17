import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getQuestionsForTest } from '@/lib/questions';
import { rateLimit } from '@/lib/rateLimit';
import { validateStateSlug, validateTestType, getClientIP } from '@/lib/security';

const QuerySchema = z.object({
  state: z.string().min(1).max(50),
  type: z.enum(['permit', 'drivers', 'motorcycle']),
  count: z.string().optional().transform((val) => {
    if (!val) return 40;
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 100) return 40;
    return num;
  }),
});

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);

  // Rate limit: 30 requests per minute per IP
  if (!rateLimit(ip, 'questions-get', 30, 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before making more requests.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);

  const parseResult = QuerySchema.safeParse({
    state: searchParams.get('state'),
    type: searchParams.get('type'),
    count: searchParams.get('count'),
  });

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'Invalid parameters',
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { state, type, count } = parseResult.data;

  // Validate state slug
  if (!validateStateSlug(state)) {
    return NextResponse.json(
      { error: 'Invalid state. Please provide a valid US state identifier.' },
      { status: 400 }
    );
  }

  if (!validateTestType(type)) {
    return NextResponse.json(
      { error: 'Invalid test type. Must be permit, drivers, or motorcycle.' },
      { status: 400 }
    );
  }

  try {
    const questions = getQuestionsForTest(state, type, count);

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found for the specified state and test type.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        questions,
        total: questions.length,
        state,
        type,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching questions.' },
      { status: 500 }
    );
  }
}
