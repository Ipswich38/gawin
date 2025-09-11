import { NextRequest, NextResponse } from 'next/server';
import { chromium, Browser, Page, BrowserContext } from 'playwright';

interface BrowserSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  sessionId: string;
  lastActivity: number;
}

// Store active browser sessions
const activeSessions = new Map<string, BrowserSession>();

// Cleanup inactive sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 10 * 60 * 1000; // 10 minutes
  
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastActivity > maxAge) {
      session.browser.close().catch(console.error);
      activeSessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { action, sessionId, url, query, coordinates, elementSelector } = await request.json();
    
    let session = sessionId ? activeSessions.get(sessionId) : null;
    
    switch (action) {
      case 'start':
        return await startBrowserSession(url);
      
      case 'navigate':
        if (!session) throw new Error('No active session');
        return await navigateToUrl(session, url);
      
      case 'screenshot':
        if (!session) throw new Error('No active session');
        return await takeScreenshot(session);
      
      case 'scroll':
        if (!session) throw new Error('No active session');
        return await scrollPage(session, coordinates);
      
      case 'click':
        if (!session) throw new Error('No active session');
        return await clickElement(session, coordinates, elementSelector);
      
      case 'type':
        if (!session) throw new Error('No active session');
        return await typeText(session, elementSelector, query);
      
      case 'search':
        if (!session) throw new Error('No active session');
        return await performSearch(session, query);
      
      case 'analyze':
        if (!session) throw new Error('No active session');
        return await analyzePage(session, query);
      
      case 'close':
        if (session) {
          await session.browser.close();
          activeSessions.delete(sessionId);
        }
        return NextResponse.json({ success: true });
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Browser automation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function startBrowserSession(initialUrl?: string) {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1280,720'
    ]
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 GawinAI/1.0'
  });
  
  const page = await context.newPage();
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const session: BrowserSession = {
    browser,
    context,
    page,
    sessionId,
    lastActivity: Date.now()
  };
  
  activeSessions.set(sessionId, session);
  
  if (initialUrl) {
    await page.goto(initialUrl, { waitUntil: 'networkidle', timeout: 30000 });
  }
  
  const screenshot = await page.screenshot({ type: 'png', fullPage: false });
  
  return NextResponse.json({
    sessionId,
    screenshot: screenshot.toString('base64'),
    url: page.url(),
    title: await page.title()
  });
}

async function navigateToUrl(session: BrowserSession, url: string) {
  session.lastActivity = Date.now();
  await session.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  
  const screenshot = await session.page.screenshot({ type: 'png', fullPage: false });
  
  return NextResponse.json({
    sessionId: session.sessionId,
    screenshot: screenshot.toString('base64'),
    url: session.page.url(),
    title: await session.page.title()
  });
}

async function takeScreenshot(session: BrowserSession) {
  session.lastActivity = Date.now();
  const screenshot = await session.page.screenshot({ type: 'png', fullPage: false });
  
  return NextResponse.json({
    sessionId: session.sessionId,
    screenshot: screenshot.toString('base64'),
    url: session.page.url(),
    title: await session.page.title()
  });
}

async function scrollPage(session: BrowserSession, coordinates?: { x: number; y: number; direction?: string; amount?: number }) {
  session.lastActivity = Date.now();
  
  if (coordinates) {
    if (coordinates.direction === 'down') {
      await session.page.evaluate((amount) => window.scrollBy(0, amount || 500), coordinates.amount);
    } else if (coordinates.direction === 'up') {
      await session.page.evaluate((amount) => window.scrollBy(0, -(amount || 500)), coordinates.amount);
    } else {
      await session.page.evaluate(({ x, y }) => window.scrollTo(x, y), coordinates);
    }
  } else {
    // Default scroll down
    await session.page.evaluate(() => window.scrollBy(0, 500));
  }
  
  // Wait for any dynamic content to load
  await session.page.waitForTimeout(1000);
  
  const screenshot = await session.page.screenshot({ type: 'png', fullPage: false });
  
  return NextResponse.json({
    sessionId: session.sessionId,
    screenshot: screenshot.toString('base64'),
    url: session.page.url(),
    scrollY: await session.page.evaluate(() => window.scrollY)
  });
}

async function clickElement(session: BrowserSession, coordinates?: { x: number; y: number }, elementSelector?: string) {
  session.lastActivity = Date.now();
  
  if (elementSelector) {
    // Click by CSS selector
    await session.page.click(elementSelector);
  } else if (coordinates) {
    // Click by coordinates
    await session.page.click(`css=*`, { position: coordinates });
  }
  
  // Wait for any navigation or dynamic content
  await Promise.race([
    session.page.waitForNavigation({ timeout: 5000 }).catch(() => {}),
    session.page.waitForTimeout(2000)
  ]);
  
  const screenshot = await session.page.screenshot({ type: 'png', fullPage: false });
  
  return NextResponse.json({
    sessionId: session.sessionId,
    screenshot: screenshot.toString('base64'),
    url: session.page.url(),
    title: await session.page.title()
  });
}

async function typeText(session: BrowserSession, elementSelector: string, text: string) {
  session.lastActivity = Date.now();
  
  await session.page.fill(elementSelector, text);
  
  const screenshot = await session.page.screenshot({ type: 'png', fullPage: false });
  
  return NextResponse.json({
    sessionId: session.sessionId,
    screenshot: screenshot.toString('base64'),
    url: session.page.url()
  });
}

async function performSearch(session: BrowserSession, query: string) {
  session.lastActivity = Date.now();
  
  // Try common search input selectors
  const searchSelectors = [
    'input[type="search"]',
    'input[name="q"]',
    'input[name="query"]',
    'input[name="search"]',
    'input[placeholder*="search" i]',
    '.search-input',
    '#search-input',
    '#q'
  ];
  
  let searchInput = null;
  for (const selector of searchSelectors) {
    try {
      searchInput = await session.page.$(selector);
      if (searchInput) break;
    } catch (e) {
      continue;
    }
  }
  
  if (searchInput) {
    await session.page.fill(await searchInput.getAttribute('selector') || searchSelectors[0], query);
    await session.page.press(await searchInput.getAttribute('selector') || searchSelectors[0], 'Enter');
    
    // Wait for search results
    await Promise.race([
      session.page.waitForNavigation({ timeout: 10000 }).catch(() => {}),
      session.page.waitForTimeout(3000)
    ]);
  }
  
  const screenshot = await session.page.screenshot({ type: 'png', fullPage: false });
  
  return NextResponse.json({
    sessionId: session.sessionId,
    screenshot: screenshot.toString('base64'),
    url: session.page.url(),
    title: await session.page.title(),
    searchPerformed: !!searchInput
  });
}

async function analyzePage(session: BrowserSession, query?: string) {
  session.lastActivity = Date.now();
  
  // Extract text content and structure
  const pageData = await session.page.evaluate(() => {
    return {
      title: document.title,
      url: window.location.href,
      headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        tag: h.tagName.toLowerCase(),
        text: h.textContent?.trim() || ''
      })),
      links: Array.from(document.querySelectorAll('a[href]')).slice(0, 20).map(a => ({
        text: a.textContent?.trim() || '',
        href: a.getAttribute('href') || ''
      })),
      paragraphs: Array.from(document.querySelectorAll('p')).slice(0, 10).map(p => 
        p.textContent?.trim() || ''
      ).filter(text => text.length > 50),
      forms: Array.from(document.querySelectorAll('form')).map(form => ({
        action: form.action,
        method: form.method,
        inputs: Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
          type: input.getAttribute('type') || input.tagName.toLowerCase(),
          name: input.getAttribute('name') || '',
          placeholder: input.getAttribute('placeholder') || ''
        }))
      }))
    };
  });
  
  const screenshot = await session.page.screenshot({ type: 'png', fullPage: false });
  
  return NextResponse.json({
    sessionId: session.sessionId,
    screenshot: screenshot.toString('base64'),
    pageData,
    query
  });
}

export async function GET() {
  return NextResponse.json({
    message: 'Browser Automation API',
    activeSessions: activeSessions.size,
    actions: [
      'start - Start new browser session',
      'navigate - Navigate to URL',
      'screenshot - Take screenshot',
      'scroll - Scroll page',
      'click - Click element',
      'type - Type text',
      'search - Perform search',
      'analyze - Analyze page content',
      'close - Close session'
    ]
  });
}