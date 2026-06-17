import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, getClientIP } from '@/lib/security';
import { scrapeAllStates } from '@/lib/scraper';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // Validate API key
  const apiKey = request.headers.get('x-api-key');
  if (!validateApiKey(apiKey)) {
    return NextResponse.json(
      { error: 'Unauthorized. Valid API key required.' },
      { status: 401 }
    );
  }

  const ip = getClientIP(request);

  // Rate limit: 3 scrape jobs per hour
  if (!rateLimit(ip, 'scrape', 3, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many scrape requests. Please wait before running another scrape.' },
      { status: 429 }
    );
  }

  try {
    console.log('Starting DMV website scraping job...');
    const startTime = Date.now();

    const results = await scrapeAllStates();

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    const summary = {
      total: results.length,
      success: results.filter((r) => r.status === 'success').length,
      noChanges: results.filter((r) => r.status === 'no_changes').length,
      errors: results.filter((r) => r.status === 'error').length,
      changesFound: results.filter((r) => r.changesFound).length,
      duration: `${duration}s`,
    };

    return NextResponse.json(
      {
        message: 'Scraping complete',
        summary,
        results,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Scraping job failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Scraping job failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Also support GET for Vercel cron (cron jobs use GET)
export async function GET(request: NextRequest) {
  // For Vercel cron, check the Authorization header
  const authHeader = request.headers.get('authorization');
  const apiKey = request.headers.get('x-api-key');

  // Vercel cron sends CRON_SECRET in Authorization: Bearer <secret>
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron =
    cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isVercelCron && !validateApiKey(apiKey)) {
    return NextResponse.json(
      { error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  try {
    const results = await scrapeAllStates();

    const summary = {
      total: results.length,
      success: results.filter((r) => r.status === 'success').length,
      noChanges: results.filter((r) => r.status === 'no_changes').length,
      errors: results.filter((r) => r.status === 'error').length,
      changesFound: results.filter((r) => r.changesFound).length,
    };

    return NextResponse.json({ message: 'Scraping complete', summary, results });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
