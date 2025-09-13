/**
 * Browser Proxy Render Endpoint
 * Serves sanitized HTML content through iframe
 */

import { NextRequest, NextResponse } from 'next/server';
import { chromium, Browser, Page } from 'playwright';

// Same security measures as main proxy
const BLOCKED_DOMAINS = [
  'pornhub.com', 'xvideos.com', 'xhamster.com', 'redtube.com',
  'bestgore.com', 'liveleak.com'
];

const cache = new Map<string, { html: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

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
    return !BLOCKED_DOMAINS.some(blockedDomain => domain.includes(blockedDomain));
  } catch {
    return false;
  }
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url || !isUrlAllowed(url)) {
      return new NextResponse(
        '<html><body style="background: #1f2937; color: #fff; font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh;"><div style="text-align: center;"><h1>❌ Blocked</h1><p>This URL is not allowed for security reasons.</p></div></body></html>',
        { 
          headers: { 'Content-Type': 'text/html' },
          status: 403 
        }
      );
    }

    // Check cache
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return new NextResponse(cached.html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Render page with Playwright
    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();

    try {
      await page.setExtraHTTPHeaders({
        'User-Agent': 'GawinAI-Browser/1.0 (Educational Purpose)'
      });

      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });

      await page.waitForTimeout(2000);

      let html = await page.content();
      html = sanitizeHtml(html);

      // Add base tag for relative URLs
      const baseUrl = new URL(url).origin;
      html = html.replace(/<head>/i, `<head><base href="${baseUrl}">`);

      // Add Gawin AI watermark
      html = html.replace(
        /<body([^>]*)>/i,
        `<body$1>
          <div style="position: fixed; top: 10px; right: 10px; background: rgba(20,184,166,0.9); color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px; z-index: 9999; font-family: system-ui;">
            🤖 Gawin AI Browser
          </div>`
      );

      // Cache the result
      cache.set(url, { html, timestamp: Date.now() });

      await page.close();

      return new NextResponse(html, {
        headers: { 
          'Content-Type': 'text/html',
          'X-Frame-Options': 'SAMEORIGIN',
          'Content-Security-Policy': "script-src 'none'; object-src 'none';"
        }
      });

    } catch (error) {
      await page.close();
      
      return new NextResponse(
        `<html><body style="background: #1f2937; color: #fff; font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh;">
          <div style="text-align: center;">
            <h1>⚠️ Loading Error</h1>
            <p>Failed to load: ${url}</p>
            <p style="color: #94a3b8; font-size: 14px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </body></html>`,
        { 
          headers: { 'Content-Type': 'text/html' },
          status: 500 
        }
      );
    }

  } catch (error) {
    return new NextResponse(
      '<html><body style="background: #1f2937; color: #fff; font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh;"><div style="text-align: center;"><h1>❌ Error</h1><p>Browser proxy error</p></div></body></html>',
      { 
        headers: { 'Content-Type': 'text/html' },
        status: 500 
      }
    );
  }
}