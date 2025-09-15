/**
 * Web Scraping Service for Gawin Research Mode
 * Provides comprehensive web content extraction with real-time data scraping
 * Supports multiple search engines and academic sources
 */

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  metadata: {
    author?: string;
    publishDate?: string;
    domain: string;
    wordCount: number;
    language: string;
    type: 'article' | 'academic' | 'news' | 'blog' | 'reference' | 'unknown';
  };
  credibilityScore: number;
  relevanceScore: number;
  extractedAt: number;
}

export interface SearchResult {
  sources: ScrapedContent[];
  totalFound: number;
  searchTime: number;
  searchEngine: string;
}

class WebScrapingService {
  private readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests
  private lastRequestTime = 0;

  /**
   * Search multiple sources and scrape real content
   */
  async comprehensiveSearch(query: string): Promise<SearchResult[]> {
    const searchPromises = [
      this.searchBing(query),
      this.searchWikipedia(query),
      this.searchArxiv(query),
      this.searchGoogleScholar(query),
      this.searchNewsAPI(query)
    ];

    const results = await Promise.allSettled(searchPromises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<SearchResult> => 
        result.status === 'fulfilled' && result.value.sources.length > 0
      )
      .map(result => result.value);
  }

  /**
   * Search using Bing Web Search API (if available)
   */
  private async searchBing(query: string): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      // Using Bing Custom Search API endpoint
      const endpoint = 'https://api.bing.microsoft.com/v7.0/search';
      const response = await this.rateLimitedFetch(`${endpoint}?q=${encodeURIComponent(query)}&count=10`, {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.BING_SEARCH_API_KEY || '',
          'User-Agent': 'Gawin-Research-Bot/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Bing search failed: ${response.status}`);
      }

      const data = await response.json();
      const sources: ScrapedContent[] = [];

      if (data.webPages?.value) {
        for (const result of data.webPages.value.slice(0, 5)) {
          try {
            const scrapedContent = await this.scrapeWebPage(result.url);
            if (scrapedContent) {
              scrapedContent.title = result.name || scrapedContent.title;
              scrapedContent.relevanceScore = this.calculateRelevanceScore(scrapedContent.content, query);
              sources.push(scrapedContent);
            }
          } catch (error) {
            console.warn(`Failed to scrape ${result.url}:`, error);
          }
        }
      }

      return {
        sources,
        totalFound: data.webPages?.totalEstimatedMatches || 0,
        searchTime: Date.now() - startTime,
        searchEngine: 'Bing'
      };
    } catch (error) {
      console.error('Bing search error:', error);
      return {
        sources: [],
        totalFound: 0,
        searchTime: Date.now() - startTime,
        searchEngine: 'Bing'
      };
    }
  }

  /**
   * Search Wikipedia with full content extraction
   */
  private async searchWikipedia(query: string): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      // First, search for pages
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/search/${encodeURIComponent(query)}`;
      const searchResponse = await this.rateLimitedFetch(searchUrl);
      
      if (!searchResponse.ok) {
        throw new Error(`Wikipedia search failed: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      const sources: ScrapedContent[] = [];

      // Get full content for top 3 results
      for (const page of searchData.pages?.slice(0, 3) || []) {
        try {
          const contentUrl = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(page.title)}`;
          const contentResponse = await this.rateLimitedFetch(contentUrl);
          
          if (contentResponse.ok) {
            const htmlContent = await contentResponse.text();
            const cleanedContent = this.extractTextFromHTML(htmlContent);
            
            sources.push({
              url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
              title: page.title,
              content: cleanedContent,
              metadata: {
                domain: 'en.wikipedia.org',
                wordCount: cleanedContent.split(/\s+/).length,
                language: 'en',
                type: 'reference',
                publishDate: page.timestamp
              },
              credibilityScore: 0.95, // Wikipedia is highly credible
              relevanceScore: this.calculateRelevanceScore(cleanedContent, query),
              extractedAt: Date.now()
            });
          }
        } catch (error) {
          console.warn(`Failed to get Wikipedia content for ${page.title}:`, error);
        }
      }

      return {
        sources,
        totalFound: searchData.pages?.length || 0,
        searchTime: Date.now() - startTime,
        searchEngine: 'Wikipedia'
      };
    } catch (error) {
      console.error('Wikipedia search error:', error);
      return {
        sources: [],
        totalFound: 0,
        searchTime: Date.now() - startTime,
        searchEngine: 'Wikipedia'
      };
    }
  }

  /**
   * Search ArXiv for academic papers
   */
  private async searchArxiv(query: string): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      const searchUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5&sortBy=relevance&sortOrder=descending`;
      const response = await this.rateLimitedFetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`ArXiv search failed: ${response.status}`);
      }

      const xmlData = await response.text();
      const sources = this.parseArxivXML(xmlData, query);

      return {
        sources,
        totalFound: sources.length,
        searchTime: Date.now() - startTime,
        searchEngine: 'ArXiv'
      };
    } catch (error) {
      console.error('ArXiv search error:', error);
      return {
        sources: [],
        totalFound: 0,
        searchTime: Date.now() - startTime,
        searchEngine: 'ArXiv'
      };
    }
  }

  /**
   * Search Google Scholar (limited access)
   */
  private async searchGoogleScholar(query: string): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      // Note: Google Scholar doesn't have a public API, so we'll use SerpAPI or similar
      // For now, returning empty results but structure is ready
      const sources: ScrapedContent[] = [];

      return {
        sources,
        totalFound: 0,
        searchTime: Date.now() - startTime,
        searchEngine: 'Google Scholar'
      };
    } catch (error) {
      console.error('Google Scholar search error:', error);
      return {
        sources: [],
        totalFound: 0,
        searchTime: Date.now() - startTime,
        searchEngine: 'Google Scholar'
      };
    }
  }

  /**
   * Search NewsAPI for recent articles
   */
  private async searchNewsAPI(query: string): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      const apiKey = process.env.NEWS_API_KEY;
      if (!apiKey) {
        throw new Error('NewsAPI key not configured');
      }

      const searchUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=relevancy&pageSize=5`;
      const response = await this.rateLimitedFetch(searchUrl, {
        headers: {
          'X-API-Key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`NewsAPI search failed: ${response.status}`);
      }

      const data = await response.json();
      const sources: ScrapedContent[] = [];

      for (const article of data.articles || []) {
        if (article.content && article.url) {
          sources.push({
            url: article.url,
            title: article.title,
            content: article.content + (article.description ? `\n\n${article.description}` : ''),
            metadata: {
              author: article.author,
              publishDate: article.publishedAt,
              domain: this.extractDomain(article.url),
              wordCount: (article.content || '').split(/\s+/).length,
              language: 'en',
              type: 'news'
            },
            credibilityScore: this.calculateNewsCredibility(article.source?.name || ''),
            relevanceScore: this.calculateRelevanceScore(article.content || '', query),
            extractedAt: Date.now()
          });
        }
      }

      return {
        sources,
        totalFound: data.totalResults || 0,
        searchTime: Date.now() - startTime,
        searchEngine: 'NewsAPI'
      };
    } catch (error) {
      console.error('NewsAPI search error:', error);
      return {
        sources: [],
        totalFound: 0,
        searchTime: Date.now() - startTime,
        searchEngine: 'NewsAPI'
      };
    }
  }

  /**
   * Scrape content from a web page
   */
  private async scrapeWebPage(url: string): Promise<ScrapedContent | null> {
    try {
      const response = await this.rateLimitedFetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Gawin-Research-Bot/1.0)'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }

      const html = await response.text();
      const content = this.extractTextFromHTML(html);
      const title = this.extractTitleFromHTML(html);
      const metadata = this.extractMetadataFromHTML(html, url);

      return {
        url,
        title: title || 'Untitled',
        content,
        metadata: {
          ...metadata,
          domain: this.extractDomain(url),
          wordCount: content.split(/\s+/).length,
          language: 'en', // Default to English
          type: this.inferContentType(url, content)
        },
        credibilityScore: this.calculateDomainCredibility(this.extractDomain(url)),
        relevanceScore: 0.5, // Will be calculated later with query
        extractedAt: Date.now()
      };
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error);
      return null;
    }
  }

  /**
   * Rate-limited fetch to respect website policies
   */
  private async rateLimitedFetch(url: string, options?: RequestInit): Promise<Response> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastRequest));
    }
    
    this.lastRequestTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Extract clean text from HTML
   */
  private extractTextFromHTML(html: string): string {
    // Remove script and style elements
    let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, ' ');
    
    // Decode HTML entities
    cleaned = cleaned.replace(/&nbsp;/g, ' ')
                   .replace(/&amp;/g, '&')
                   .replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>')
                   .replace(/&quot;/g, '"')
                   .replace(/&#39;/g, "'");
    
    // Clean up whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Limit length for practical processing
    return cleaned.substring(0, 5000);
  }

  /**
   * Extract title from HTML
   */
  private extractTitleFromHTML(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  /**
   * Extract metadata from HTML
   */
  private extractMetadataFromHTML(html: string, url: string): Partial<ScrapedContent['metadata']> {
    const metadata: Partial<ScrapedContent['metadata']> = {};
    
    // Extract author
    const authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i);
    if (authorMatch) metadata.author = authorMatch[1];
    
    // Extract publish date
    const dateMatch = html.match(/<meta[^>]*(?:name|property)=["'](?:article:published_time|publishdate|date)["'][^>]*content=["']([^"']+)["']/i);
    if (dateMatch) metadata.publishDate = dateMatch[1];
    
    return metadata;
  }

  /**
   * Calculate relevance score based on query match
   */
  private calculateRelevanceScore(content: string, query: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    let matches = 0;
    let totalTerms = queryTerms.length;
    
    for (const term of queryTerms) {
      if (contentLower.includes(term)) {
        matches++;
      }
    }
    
    return matches / totalTerms;
  }

  /**
   * Calculate domain credibility score
   */
  private calculateDomainCredibility(domain: string): number {
    const highCredibilityDomains = [
      'wikipedia.org', 'nature.com', 'science.org', 'arxiv.org', 'pubmed.ncbi.nlm.nih.gov',
      'scholar.google.com', 'ieee.org', 'acm.org', 'springer.com', 'wiley.com',
      'gov', 'edu', 'who.int', 'un.org', 'reuters.com', 'bbc.com', 'cnn.com'
    ];
    
    const mediumCredibilityDomains = [
      'medium.com', 'forbes.com', 'techcrunch.com', 'wired.com', 'theguardian.com'
    ];
    
    const lowerDomain = domain.toLowerCase();
    
    if (highCredibilityDomains.some(d => lowerDomain.includes(d))) {
      return 0.9;
    } else if (mediumCredibilityDomains.some(d => lowerDomain.includes(d))) {
      return 0.7;
    } else if (lowerDomain.endsWith('.edu') || lowerDomain.endsWith('.gov')) {
      return 0.95;
    } else {
      return 0.5;
    }
  }

  /**
   * Calculate news source credibility
   */
  private calculateNewsCredibility(sourceName: string): number {
    const highCredibility = ['reuters', 'associated press', 'bbc', 'npr', 'pbs'];
    const mediumCredibility = ['cnn', 'fox news', 'msnbc', 'wall street journal', 'new york times'];
    
    const lowerName = sourceName.toLowerCase();
    
    if (highCredibility.some(s => lowerName.includes(s))) {
      return 0.9;
    } else if (mediumCredibility.some(s => lowerName.includes(s))) {
      return 0.7;
    } else {
      return 0.6;
    }
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  /**
   * Infer content type from URL and content
   */
  private inferContentType(url: string, content: string): ScrapedContent['metadata']['type'] {
    const urlLower = url.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (urlLower.includes('arxiv.org') || contentLower.includes('abstract:') || contentLower.includes('doi:')) {
      return 'academic';
    } else if (urlLower.includes('news') || urlLower.includes('blog')) {
      return 'news';
    } else if (urlLower.includes('wikipedia.org')) {
      return 'reference';
    } else if (contentLower.includes('by ') && contentLower.includes('published')) {
      return 'article';
    } else {
      return 'unknown';
    }
  }

  /**
   * Parse ArXiv XML response
   */
  private parseArxivXML(xmlData: string, query: string): ScrapedContent[] {
    const sources: ScrapedContent[] = [];
    
    // Simple XML parsing for ArXiv entries
    const entryMatches = xmlData.match(/<entry>[\s\S]*?<\/entry>/g);
    
    if (entryMatches) {
      for (const entry of entryMatches.slice(0, 3)) {
        const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
        const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
        const linkMatch = entry.match(/<id>([\s\S]*?)<\/id>/);
        const authorMatch = entry.match(/<name>([\s\S]*?)<\/name>/);
        const publishedMatch = entry.match(/<published>([\s\S]*?)<\/published>/);
        
        if (titleMatch && summaryMatch && linkMatch) {
          const content = `${summaryMatch[1].trim()}\n\nTitle: ${titleMatch[1].trim()}`;
          
          sources.push({
            url: linkMatch[1].trim(),
            title: titleMatch[1].trim(),
            content,
            metadata: {
              author: authorMatch ? authorMatch[1].trim() : undefined,
              publishDate: publishedMatch ? publishedMatch[1].trim() : undefined,
              domain: 'arxiv.org',
              wordCount: content.split(/\s+/).length,
              language: 'en',
              type: 'academic'
            },
            credibilityScore: 0.9, // ArXiv is highly credible for academic content
            relevanceScore: this.calculateRelevanceScore(content, query),
            extractedAt: Date.now()
          });
        }
      }
    }
    
    return sources;
  }
}

export const webScrapingService = new WebScrapingService();
export default webScrapingService;