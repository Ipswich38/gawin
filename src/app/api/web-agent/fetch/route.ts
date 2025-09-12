/**
 * Web Agent Fetch API Route
 * Secure server-side content fetching for the AI Web Browsing Agent
 * 
 * Security Features:
 * - Rate limiting
 * - URL validation
 * - Content sanitization
 * - CORS bypass on server-side
 */

import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import { rateLimit } from '@/lib/rate-limit';

// Rate limiting configuration
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Limit by IP
});

// Allowed domains whitelist (for additional security)
const ALLOWED_DOMAINS = [
  'wikipedia.org',
  'github.com',
  'stackoverflow.com',
  'developer.mozilla.org',
  'docs.python.org',
  'nodejs.org',
  'reactjs.org',
  'nextjs.org',
  'vercel.com',
  'anthropic.com',
  'openai.com',
  'google.com',
  'bing.com',
  'duckduckgo.com',
  // Add more trusted domains as needed
];

// Blocked content patterns
const BLOCKED_PATTERNS = [
  /password/i,
  /login/i,
  /auth/i,
  /token/i,
  /api[_-]?key/i,
  /secret/i,
  /private/i,
  /confidential/i,
];

/**
 * Validate URL for security
 */
function validateUrl(url: string): { valid: boolean; reason?: string } {
  try {
    const urlObj = new URL(url);
    
    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, reason: 'Only HTTP and HTTPS protocols allowed' };
    }
    
    // Check for private/local IPs
    const hostname = urlObj.hostname;
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      return { valid: false, reason: 'Private/local URLs not allowed' };
    }
    
    // Check domain whitelist (optional - can be disabled for more open browsing)
    // const domain = hostname.toLowerCase();
    // const isAllowed = ALLOWED_DOMAINS.some(allowed => 
    //   domain === allowed || domain.endsWith(`.${allowed}`)
    // );
    // if (!isAllowed) {
    //   return { valid: false, reason: 'Domain not in whitelist' };
    // }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, reason: 'Invalid URL format' };
  }
}

/**
 * Extract text content from HTML
 */
function extractTextContent(html: string, selector?: string): { title: string; content: string } {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Extract title
  const titleElement = document.querySelector('title');
  const title = titleElement?.textContent?.trim() || 'Untitled';
  
  // Extract content based on selector or use intelligent content extraction
  let contentElement;
  if (selector) {
    contentElement = document.querySelector(selector);
  } else {
    // Intelligent content extraction
    contentElement = 
      document.querySelector('main') ||
      document.querySelector('article') ||
      document.querySelector('[role="main"]') ||
      document.querySelector('.content') ||
      document.querySelector('#content') ||
      document.body;
  }
  
  if (!contentElement) {
    return { title, content: 'No content found' };
  }
  
  // Remove script and style elements
  const scripts = contentElement.querySelectorAll('script, style, nav, header, footer, aside');
  scripts.forEach(el => el.remove());
  
  // Extract text content
  const content = contentElement.textContent
    ?.replace(/\s+/g, ' ')
    ?.trim() || 'No content extracted';
    
  return { title, content };
}

/**
 * Sanitize content to remove sensitive information
 */
function sanitizeContent(content: string): string {
  let sanitized = content;
  
  // Remove potential sensitive patterns
  BLOCKED_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });
  
  // Limit content length to prevent abuse
  if (sanitized.length > 50000) {
    sanitized = sanitized.substring(0, 50000) + '\n\n[Content truncated for length]';
  }
  
  return sanitized;
}

/**
 * Main fetch handler
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'unknown';
    const { success } = await limiter.check(10, identifier); // 10 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // Parse request body
    const { url, format = 'text', selector } = await request.json();
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      );
    }
    
    // Validate URL
    const validation = validateUrl(url);
    if (!validation.valid) {
      return NextResponse.json(
        { error: `Invalid URL: ${validation.reason}` },
        { status: 400 }
      );
    }
    
    console.log(`🌐 Fetching content from: ${url}`);
    
    // Fetch content with proper headers
    const fetchResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GawinAI/1.0; +https://gawin.ai/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
      },
      timeout: 10000, // 10 second timeout
    });
    
    if (!fetchResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: HTTP ${fetchResponse.status}` },
        { status: fetchResponse.status }
      );
    }
    
    const html = await fetchResponse.text();
    
    // Process content based on format
    let result;
    switch (format.toLowerCase()) {
      case 'html':
        result = {
          content: html,
          title: extractTextContent(html).title,
          url: url,
          format: 'html'
        };
        break;
        
      case 'text':
      default:
        const extracted = extractTextContent(html, selector);
        result = {
          content: sanitizeContent(extracted.content),
          title: extracted.title,
          url: url,
          format: 'text'
        };
        break;
    }
    
    console.log(`✅ Successfully fetched content from ${url} (${result.content.length} chars)`);
    
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Web fetch error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}