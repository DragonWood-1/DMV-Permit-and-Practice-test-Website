import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { scoreAnswers } from '@/lib/questions';
import { rateLimit } from '@/lib/rateLimit';
import { validateStateSlug, validateTestType, getClientIP, hashIP } from '@/lib/security';
import { stateBySlug } from '@/data/states';
import prisma from '@/lib/db';

const SubmitSchema = z.object({
  state: z.string().min(1).max(50),
  type: z.enum(['permit', 'drivers', 'motorcycle']),
  answers: z.array(
    z.object({
      questionId: z.string().min(1).max(50),
      selectedAnswer: z.number().int().min(-1).max(3),
    })
  ).min(1).max(100),
});

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  // Rate limit: 10 submissions per hour per IP
  if (!rateLimit(ip, 'submit-test', 10, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many test submissions. Please wait before submitting again.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const parseResult = SubmitSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'Invalid submission data',
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { state, type, answers } = parseResult.data;

  if (!validateStateSlug(state)) {
    return NextResponse.json(
      { error: 'Invalid state.' },
      { status: 400 }
    );
  }

  if (!validateTestType(type)) {
    return NextResponse.json(
      { error: 'Invalid test type.' },
      { status: 400 }
    );
  }

  const stateData = stateBySlug(state);
  if (!stateData) {
    return NextResponse.json(
      { error: 'State not found.' },
      { status: 404 }
    );
  }

  const passingPercents: Record<string, number> = {
    permit: stateData.permitPassPercent,
    drivers: stateData.driversPassPercent,
    motorcycle: stateData.motorcyclePassPercent,
  };

  try {
    const result = scoreAnswers(answers, passingPercents[type]);
    const ipHash = hashIP(ip);

    // Store test session in database
    try {
      await prisma.testSession.create({
        data: {
          stateSlug: state,
          testType: type,
          score: result.score,
          totalQuestions: result.total,
          passed: result.passed,
          answers: JSON.stringify(answers),
          ipHash,
        },
      });
    } catch (dbError) {
      // Don't fail the request if DB is unavailable, just log
      console.error('Failed to save test session:', dbError);
    }

    return NextResponse.json(
      result,
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (error) {
    console.error('Error scoring test:', error);
    return NextResponse.json(
      { error: 'Internal server error while scoring test.' },
      { status: 500 }
    );
  }
}
