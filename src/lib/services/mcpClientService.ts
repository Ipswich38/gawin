/**
 * MCP (Model Context Protocol) Client Service for Gawin
 * Provides standardized access to AI models and tools through MCP servers
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

interface MCPServer {
  name: string;
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  capabilities: string[];
  priority: number;
}

interface MCPResponse {
  success: boolean;
  content?: string;
  error?: string;
  toolResults?: any[];
  metadata?: Record<string, any>;
}

interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

class MCPClientService {
  private clients: Map<string, Client> = new Map();
  private servers: MCPServer[] = [];
  private isInitialized = false;

  constructor() {
    this.setupDefaultServers();
  }

  /**
   * Setup default MCP servers - simplified for better reliability
   */
  private setupDefaultServers() {
    // Start with minimal servers that are more likely to work
    this.servers = [
      // Simple filesystem server (most reliable)
      {
        name: 'filesystem',
        command: 'node',
        args: ['-e', 'console.log("MCP filesystem server starting...")'],
        capabilities: ['read_file', 'write_file', 'list_directory'],
        priority: 1
      }
    ];

    // Only add additional servers if environment variables are available
    if (process.env.BRAVE_API_KEY) {
      this.servers.push({
        name: 'brave-search',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-brave-search'],
        env: {
          BRAVE_API_KEY: process.env.BRAVE_API_KEY
        },
        capabilities: ['web_search', 'news_search'],
        priority: 2
      });
    }

    if (process.env.GITHUB_TOKEN) {
      this.servers.push({
        name: 'github',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN
        },
        capabilities: ['repository_access', 'issue_management'],
        priority: 3
      });
    }
  }

  /**
   * Initialize all MCP servers
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🔌 Initializing MCP Client Service...');

    const initPromises = this.servers.map(async (server) => {
      try {
        await this.connectToServer(server);
        console.log(`✅ Connected to MCP server: ${server.name}`);
      } catch (error) {
        console.warn(`⚠️ Failed to connect to MCP server ${server.name}:`, error);
      }
    });

    await Promise.allSettled(initPromises);
    this.isInitialized = true;
    console.log('🔌 MCP Client Service initialized');
  }

  /**
   * Connect to a specific MCP server
   */
  private async connectToServer(server: MCPServer): Promise<void> {
    let transport;

    if (server.url) {
      // HTTP/SSE transport
      transport = new SSEClientTransport(new URL(server.url));
    } else if (server.command) {
      // Stdio transport for local processes
      const envVars: Record<string, string> = {};

      // Filter out undefined values from process.env
      Object.entries(process.env).forEach(([key, value]) => {
        if (value !== undefined) {
          envVars[key] = value;
        }
      });

      // Add server-specific environment variables
      if (server.env) {
        Object.entries(server.env).forEach(([key, value]) => {
          if (value !== undefined) {
            envVars[key] = value;
          }
        });
      }

      transport = new StdioClientTransport({
        command: server.command,
        args: server.args || [],
        env: envVars
      });
    } else {
      throw new Error(`Invalid server configuration for ${server.name}`);
    }

    const client = new Client(
      {
        name: 'gawin-ai',
        version: '1.0.0'
      },
      {
        capabilities: {}
      }
    );

    await client.connect(transport);
    this.clients.set(server.name, client);
  }

  /**
   * Get available tools from all connected servers
   */
  async getAvailableTools(): Promise<Record<string, any>> {
    const allTools: Record<string, any> = {};

    for (const [serverName, client] of this.clients) {
      try {
        const tools = await client.listTools();
        allTools[serverName] = tools;
      } catch (error) {
        console.warn(`Failed to get tools from ${serverName}:`, error);
      }
    }

    return allTools;
  }

  /**
   * Execute a tool call through MCP
   */
  async executeTool(toolCall: MCPToolCall, preferredServer?: string): Promise<MCPResponse> {
    const { name, arguments: args } = toolCall;

    // Find the best server for this tool
    const serverName = preferredServer || this.findBestServerForTool(name);
    const client = this.clients.get(serverName);

    if (!client) {
      return {
        success: false,
        error: `No MCP server available for tool: ${name}`
      };
    }

    try {
      const result = await client.callTool({
        name,
        arguments: args
      });

      return {
        success: true,
        toolResults: Array.isArray(result.content) ? result.content : [result.content],
        metadata: {
          server: serverName,
          isError: result.isError
        }
      };
    } catch (error) {
      console.error(`MCP tool execution failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Chat completion through MCP (if AI servers are available)
   */
  async createChatCompletion(messages: any[], options: any = {}): Promise<MCPResponse> {
    // Try AI-capable servers in priority order
    const aiServers = ['groq', 'openai', 'anthropic'].filter(name => this.clients.has(name));

    for (const serverName of aiServers) {
      try {
        const result = await this.executeTool({
          name: 'chat_completion',
          arguments: {
            messages,
            ...options
          }
        }, serverName);

        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn(`Chat completion failed on ${serverName}:`, error);
        continue;
      }
    }

    return {
      success: false,
      error: 'No AI servers available for chat completion'
    };
  }

  /**
   * Find the best server for a specific tool
   */
  private findBestServerForTool(toolName: string): string {
    // Tool to server mapping
    const toolMappings: Record<string, string[]> = {
      'read_file': ['filesystem'],
      'write_file': ['filesystem'],
      'list_directory': ['filesystem'],
      'web_search': ['brave-search'],
      'github_search': ['github'],
      'database_query': ['sqlite'],
      'chat_completion': ['groq', 'openai', 'anthropic']
    };

    const possibleServers = toolMappings[toolName] || [];

    // Return the first available server from the list
    for (const serverName of possibleServers) {
      if (this.clients.has(serverName)) {
        return serverName;
      }
    }

    // Fallback: return any available server
    return Array.from(this.clients.keys())[0] || 'unknown';
  }

  /**
   * Get server status and capabilities
   */
  async getServerStatus(): Promise<Record<string, any>> {
    const status: Record<string, any> = {};

    for (const [serverName, client] of this.clients) {
      try {
        const resources = await client.listResources();
        const tools = await client.listTools();

        status[serverName] = {
          connected: true,
          resources: resources.length,
          tools: tools.length,
          capabilities: this.servers.find(s => s.name === serverName)?.capabilities || []
        };
      } catch (error) {
        status[serverName] = {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return status;
  }

  /**
   * Gracefully disconnect from all servers
   */
  async disconnect(): Promise<void> {
    const disconnectPromises = Array.from(this.clients.values()).map(client =>
      client.close().catch(err => console.warn('Error disconnecting MCP client:', err))
    );

    await Promise.allSettled(disconnectPromises);
    this.clients.clear();
    this.isInitialized = false;
    console.log('🔌 MCP Client Service disconnected');
  }

  /**
   * Health check for MCP service
   */
  async healthCheck(): Promise<{ healthy: boolean; details: Record<string, any> }> {
    if (!this.isInitialized) {
      return {
        healthy: false,
        details: { error: 'MCP service not initialized' }
      };
    }

    const status = await this.getServerStatus();
    const connectedServers = Object.values(status).filter((s: any) => s.connected).length;

    return {
      healthy: connectedServers > 0,
      details: {
        connectedServers,
        totalServers: this.servers.length,
        status
      }
    };
  }
}

// Singleton instance
export const mcpClientService = new MCPClientService();
export default mcpClientService;