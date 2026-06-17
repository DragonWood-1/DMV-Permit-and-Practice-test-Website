import { NextResponse } from 'next/server';
import { questions } from '@/data/questions';
import { states } from '@/data/states';

export async function GET() {
  let dbStatus = 'unknown';

  try {
    // Try to import and use prisma
    const { default: prisma } = await import('@/lib/db');
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'unavailable';
  }

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    data: {
      states: states.length,
      questions: questions.length,
      questionsByCategory: {
        permit: questions.filter((q) => q.category === 'permit').length,
        drivers: questions.filter((q) => q.category === 'drivers').length,
        motorcycle: questions.filter((q) => q.category === 'motorcycle').length,
      },
    },
  };

  return NextResponse.json(health, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
