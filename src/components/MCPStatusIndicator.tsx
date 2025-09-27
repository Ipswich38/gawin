'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Zap, AlertCircle } from 'lucide-react';

interface MCPStatus {
  healthy: boolean;
  connectedServers: number;
  totalServers: number;
  details: any;
}

export default function MCPStatusIndicator() {
  const [mcpStatus, setMcpStatus] = useState<MCPStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkMCPStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkMCPStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkMCPStatus = async () => {
    try {
      const response = await fetch('/api/mcp');
      const data = await response.json();

      if (data.success && data.data.health) {
        setMcpStatus({
          healthy: data.data.health.healthy,
          connectedServers: data.data.health.details.connectedServers || 0,
          totalServers: data.data.health.details.totalServers || 0,
          details: data.data
        });
      } else {
        setMcpStatus({
          healthy: false,
          connectedServers: 0,
          totalServers: 0,
          details: null
        });
      }
    } catch (error) {
      console.warn('Failed to check MCP status:', error);
      setMcpStatus({
        healthy: false,
        connectedServers: 0,
        totalServers: 0,
        details: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-xs">
        <Activity className="w-3 h-3 animate-pulse" />
        <span>Checking MCP...</span>
      </div>
    );
  }

  if (!mcpStatus) {
    return null;
  }

  const getStatusColor = () => {
    if (mcpStatus.healthy && mcpStatus.connectedServers > 0) {
      return 'text-green-500';
    } else if (mcpStatus.connectedServers > 0) {
      return 'text-yellow-500';
    } else {
      return 'text-red-500';
    }
  };

  const getStatusIcon = () => {
    if (mcpStatus.healthy && mcpStatus.connectedServers > 0) {
      return <Zap className="w-3 h-3" />;
    } else {
      return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getStatusText = () => {
    if (mcpStatus.healthy && mcpStatus.connectedServers > 0) {
      return `MCP Active (${mcpStatus.connectedServers}/${mcpStatus.totalServers})`;
    } else if (mcpStatus.connectedServers > 0) {
      return `MCP Partial (${mcpStatus.connectedServers}/${mcpStatus.totalServers})`;
    } else {
      return 'MCP Offline';
    }
  };

  return (
    <div className={`flex items-center gap-2 text-xs ${getStatusColor()}`} title="Model Context Protocol Status">
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  );
}