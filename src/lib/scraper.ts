import crypto from 'crypto';
import { states, StateData } from '@/data/states';
import prisma from '@/lib/db';

export interface ScrapeResult {
  stateSlug: string;
  stateName: string;
  status: 'success' | 'error' | 'no_changes';
  changesFound: boolean;
  notes?: string;
  url: string;
}

interface ScrapedContent {
  title: string;
  description: string;
  contentHash: string;
  lastModified?: string;
}

/**
 * Scrape a single state's DMV website
 */
export async function scrapeState(state: StateData): Promise<ScrapeResult> {
  try {
    // Dynamic import of cheerio to avoid issues with server-side rendering
    const cheerio = await import('cheerio');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    let responseText: string;
    let lastModified: string | undefined;

    try {
      const response = await fetch(state.dmvUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; DMVPracticeTestBot/1.0; +https://dmvpracticetest.com)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          stateSlug: state.slug,
          stateName: state.name,
          status: 'error',
          changesFound: false,
          notes: `HTTP ${response.status}: ${response.statusText}`,
          url: state.dmvUrl,
        };
      }

      lastModified = response.headers.get('last-modified') || undefined;
      responseText = await response.text();
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
      return {
        stateSlug: state.slug,
        stateName: state.name,
        status: 'error',
        changesFound: false,
        notes: `Fetch failed: ${errorMessage}`,
        url: state.dmvUrl,
      };
    }

    const $ = cheerio.load(responseText);

    // Extract key content
    const title = $('title').text().trim() || '';
    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';

    // Look for news/updates sections
    const newsContent: string[] = [];
    const newsSelectors = [
      '.news',
      '.updates',
      '.announcements',
      '#news',
      '#updates',
      '[class*="news"]',
      '[class*="update"]',
      '[class*="announcement"]',
    ];

    newsSelectors.forEach((selector) => {
      const el = $(selector);
      if (el.length) {
        newsContent.push(el.text().trim().slice(0, 500));
      }
    });

    // Create content hash
    const contentToHash = `${title}|${description}|${newsContent.join('|')}`;
    const contentHash = crypto
      .createHash('sha256')
      .update(contentToHash)
      .digest('hex');

    // Check if content has changed
    const scraped: ScrapedContent = {
      title,
      description,
      contentHash,
      lastModified,
    };

    // Look up previous scraping log to compare
    const stateRecord = await prisma.state.findUnique({
      where: { slug: state.slug },
      include: {
        scrapingLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!stateRecord) {
      return {
        stateSlug: state.slug,
        stateName: state.name,
        status: 'error',
        changesFound: false,
        notes: 'State not found in database',
        url: state.dmvUrl,
      };
    }

    const lastLog = stateRecord.scrapingLogs[0];
    const changesFound = !lastLog || (lastLog.notes ? !lastLog.notes.includes(contentHash) : true);

    // Log the scraping result
    await prisma.scrapingLog.create({
      data: {
        stateId: stateRecord.id,
        status: 'success',
        changesFound,
        notes: JSON.stringify({
          contentHash,
          title: scraped.title.slice(0, 200),
          lastModified: scraped.lastModified,
        }),
      },
    });

    return {
      stateSlug: state.slug,
      stateName: state.name,
      status: changesFound ? 'success' : 'no_changes',
      changesFound,
      notes: changesFound
        ? `Changes detected. New hash: ${contentHash}`
        : 'No changes detected',
      url: state.dmvUrl,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error scraping ${state.name}:`, errorMessage);

    try {
      const stateRecord = await prisma.state.findUnique({
        where: { slug: state.slug },
      });

      if (stateRecord) {
        await prisma.scrapingLog.create({
          data: {
            stateId: stateRecord.id,
            status: 'error',
            changesFound: false,
            notes: `Error: ${errorMessage}`,
          },
        });
      }
    } catch (dbError) {
      console.error('Failed to log scraping error to database:', dbError);
    }

    return {
      stateSlug: state.slug,
      stateName: state.name,
      status: 'error',
      changesFound: false,
      notes: `Error: ${errorMessage}`,
      url: state.dmvUrl,
    };
  }
}

/**
 * Check if content has changed since last scrape
 */
export async function hasContentChanged(
  url: string,
  lastContentHash: string
): Promise<boolean> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DMVPracticeTestBot/1.0)',
      },
    });

    if (!response.ok) return false;

    const text = await response.text();
    const currentHash = crypto.createHash('sha256').update(text).digest('hex');

    return currentHash !== lastContentHash;
  } catch {
    return false;
  }
}

/**
 * Scrape all states and return results
 */
export async function scrapeAllStates(): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  // Process states in batches to avoid overwhelming servers
  const batchSize = 5;
  for (let i = 0; i < states.length; i += batchSize) {
    const batch = states.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map((state) => scrapeState(state))
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Scrape failed:', result.reason);
      }
    }

    // Small delay between batches to be respectful to servers
    if (i + batchSize < states.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return results;
}
