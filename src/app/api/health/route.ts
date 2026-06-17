import { NextResponse } from 'next/server';
import { questions } from '@/data/questions';
import { states } from '@/data/states';

// Force dynamic rendering — this route checks live DB status, never cache it
export const dynamic = 'force-dynamic';

export async function GET() {
  let dbStatus = 'unknown';

  // Skip DB check if DATABASE_URL is not configured (e.g. during build)
  if (process.env.DATABASE_URL) {
    try {
      const { default: prisma } = await import('@/lib/db');
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'unavailable';
    }
  } else {
    dbStatus = 'not_configured';
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
