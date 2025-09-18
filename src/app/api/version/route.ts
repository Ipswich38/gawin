/**
 * Version API endpoint for auto-update system
 * Returns current deployment version/timestamp
 */

import { NextRequest, NextResponse } from 'next/server';

// Get deployment timestamp from environment or build time
const DEPLOYMENT_VERSION = process.env.VERCEL_GIT_COMMIT_SHA ||
                          process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
                          process.env.BUILD_TIME ||
                          Date.now().toString();

const BUILD_TIME = process.env.BUILD_TIME || new Date().toISOString();

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Version check requested');

    // Get current deployment info
    const versionInfo = {
      version: DEPLOYMENT_VERSION,
      timestamp: Date.now(),
      buildTime: BUILD_TIME,
      environment: process.env.NODE_ENV || 'development',
      // Vercel deployment info if available
      vercelUrl: process.env.VERCEL_URL,
      vercelGitCommitRef: process.env.VERCEL_GIT_COMMIT_REF,
      vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
      // Force cache busting
      requestTime: new Date().toISOString()
    };

    console.log('🔍 Returning version info:', {
      version: versionInfo.version,
      environment: versionInfo.environment,
      timestamp: versionInfo.timestamp
    });

    // Return version info with no-cache headers
    return NextResponse.json(versionInfo, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ Version API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to get version info',
        timestamp: Date.now(),
        fallbackVersion: Date.now().toString()
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}

// Support HEAD requests for health checks
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}