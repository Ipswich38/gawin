/**
 * AI Browser Proxy API - Production-ready web browser backend
 * Inspired by Perplexity Comet and Manus AI browsing capabilities
 * 
 * Features:
 * - Playwright-based reliable page rendering
 * - DOM text extraction for AI analysis
 * - Screenshot capture for multimodal AI
 * - Security sandboxing and content filtering
 * - Performance optimization with caching
 */

import { NextRequest, NextResponse } from 'next/server';
import { chromium, Browser, Page } from 'playwright';

// Security: Domain blocklist
const BLOCKED_DOMAINS = [
  // Adult content
  'pornhub.com', 'xvideos.com', 'xhamster.com', 'redtube.com',
  // Violence/harmful content
  'bestgore.com', 'liveleak.com',
  // Malware/phishing (add more as needed)
  'bit.ly', 'tinyurl.com' // Potentially risky shortened URLs
];

// Performance: Simple in-memory cache
const cache = new Map<string, { html: string; text: string; screenshot: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface BrowserProxyRequest {
  url: string;
  action: 'render' | 'extract' | 'screenshot' | 'analyze';
  options?: {
    includeImages?: boolean;
    includeScripts?: boolean;
    timeout?: number;
  };
}

interface BrowserProxyResponse {
  success: boolean;
  data?: {
    html?: string;
    text?: string;
    screenshot?: string;
    metadata?: {
      title: string;
      description: string;
      url: string;
      domain: string;
    };
  };
  error?: string;
}

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
  }
  return browser;
}

function isUrlAllowed(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    
    return !BLOCKED_DOMAINS.some(blockedDomain => 
      domain.includes(blockedDomain)
    );
  } catch {
    return false;
  }
}

function sanitizeContent(html: string): string {
  // Remove potentially dangerous scripts and content
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

function extractCleanText(html: string): string {
  // Remove HTML tags and extract clean text
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const body: BrowserProxyRequest = await request.json();
    const { url, action, options = {} } = body;

    console.log('🌐 Browser Proxy Request:', { url, action });

    // Validate URL
    if (!url || !isUrlAllowed(url)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or blocked URL'
      } as BrowserProxyResponse);
    }

    // Check cache
    const cacheKey = `${url}-${action}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('📦 Serving from cache:', url);
      return NextResponse.json({
        success: true,
        data: {
          html: cached.html,
          text: cached.text,
          screenshot: cached.screenshot
        }
      } as BrowserProxyResponse);
    }

    // Get browser instance
    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();

    try {
      // Set security options
      await page.setExtraHTTPHeaders({
        'User-Agent': 'GawinAI-Browser/1.0 (Educational Purpose)'
      });

      // Navigate to page
      const timeout = options.timeout || 10000;
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout 
      });

      // Wait for page to load
      await page.waitForTimeout(2000);

      let html = '';
      let text = '';
      let screenshot = '';
      let metadata = null;

      // Extract based on action
      switch (action) {
        case 'render':
        case 'analyze':
          html = await page.content();
          html = sanitizeContent(html);
          text = extractCleanText(html);
          
          // Get metadata
          metadata = {
            title: await page.title() || '',
            description: await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => '') || '',
            url: page.url(),
            domain: new URL(page.url()).hostname
          };
          
          if (action === 'analyze') {
            // Also capture screenshot for multimodal AI
            const screenshotBuffer = await page.screenshot({ 
              type: 'png',
              clip: { x: 0, y: 0, width: 1200, height: 800 }
            });
            screenshot = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
          }
          break;

        case 'extract':
          text = await page.evaluate(() => {
            // Extract clean text content from the page
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
              null,
              false
            );
            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
              if (node.textContent?.trim()) {
                textNodes.push(node.textContent.trim());
              }
            }
            return textNodes.join('\n');
          });
          break;

        case 'screenshot':
          const screenshotBuffer = await page.screenshot({ 
            type: 'png',
            fullPage: false,
            clip: { x: 0, y: 0, width: 1200, height: 800 }
          });
          screenshot = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
          break;
      }

      // Cache the result
      cache.set(cacheKey, {
        html,
        text,
        screenshot,
        timestamp: Date.now()
      });

      // Clean up old cache entries
      for (const [key, value] of cache.entries()) {
        if (Date.now() - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      }

      await page.close();

      console.log('✅ Browser Proxy Success:', { 
        url, 
        action, 
        textLength: text.length,
        hasScreenshot: !!screenshot
      });

      return NextResponse.json({
        success: true,
        data: {
          html: html || undefined,
          text: text || undefined,
          screenshot: screenshot || undefined,
          metadata
        }
      } as BrowserProxyResponse);

    } catch (error) {
      await page.close();
      throw error;
    }

  } catch (error) {
    console.error('❌ Browser Proxy Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    } as BrowserProxyResponse);
  }
}

// Cleanup on process exit
process.on('beforeExit', async () => {
  if (browser) {
    await browser.close();
  }
});