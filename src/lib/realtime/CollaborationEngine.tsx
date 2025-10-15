import { createClient } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';

// Real-time Collaboration Types
export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  selection?: { nodeId: string; type: 'node' | 'edge' };
  status: 'online' | 'idle' | 'typing';
  lastSeen: string;
}

export interface WorkflowChange {
  id: string;
  type: 'node_added' | 'node_removed' | 'node_updated' | 'edge_added' | 'edge_removed' | 'edge_updated';
  userId: string;
  timestamp: string;
  data: any;
  workflowId: string;
}

export interface CollaborationState {
  users: Record<string, CollaborationUser>;
  changes: WorkflowChange[];
  isConnected: boolean;
  lastSync: string;
}

// Enhanced Real-time Collaboration Engine
export class CollaborationEngine {
  private static instance: CollaborationEngine;
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  private channels: Map<string, RealtimeChannel> = new Map();
  private state: Record<string, CollaborationState> = {};
  private listeners: Map<string, Set<(state: CollaborationState) => void>> = new Map();
  private cursorListeners: Map<string, Set<(users: Record<string, CollaborationUser>) => void>> = new Map();

  static getInstance(): CollaborationEngine {
    if (!CollaborationEngine.instance) {
      CollaborationEngine.instance = new CollaborationEngine();
    }
    return CollaborationEngine.instance;
  }

  // Join a workflow collaboration session
  async joinWorkflow(
    workflowId: string,
    user: { id: string; name: string; email: string; avatar?: string },
    onStateChange?: (state: CollaborationState) => void,
    onCursorUpdate?: (users: Record<string, CollaborationUser>) => void
  ): Promise<() => void> {
    // Initialize state if not exists
    if (!this.state[workflowId]) {
      this.state[workflowId] = {
        users: {},
        changes: [],
        isConnected: false,
        lastSync: new Date().toISOString()
      };
    }

    // Add user to state
    this.state[workflowId].users[user.id] = {
      ...user,
      status: 'online',
      lastSeen: new Date().toISOString()
    };

    // Set up listeners
    if (onStateChange) {
      if (!this.listeners.has(workflowId)) {
        this.listeners.set(workflowId, new Set());
      }
      this.listeners.get(workflowId)!.add(onStateChange);
    }

    if (onCursorUpdate) {
      if (!this.cursorListeners.has(workflowId)) {
        this.cursorListeners.set(workflowId, new Set());
      }
      this.cursorListeners.get(workflowId)!.add(onCursorUpdate);
    }

    // Create or get channel
    let channel = this.channels.get(workflowId);
    if (!channel) {
      channel = this.supabase.channel(`workflow:${workflowId}`, {
        config: {
          presence: { key: user.id },
          broadcast: { self: true }
        }
      });

      // Handle presence events (users joining/leaving)
      channel
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState();
          const users: Record<string, CollaborationUser> = {};

          Object.entries(presenceState).forEach(([userId, presence]) => {
            const userPresence = Array.isArray(presence) ? presence[0] : presence;
            users[userId] = userPresence as CollaborationUser;
          });

          this.state[workflowId].users = users;
          this.notifyStateChange(workflowId);
          this.notifyCursorUpdate(workflowId);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          console.log('User joined:', newPresences);
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          console.log('User left:', leftPresences);
        })

        // Handle workflow changes
        .on('broadcast', { event: 'workflow_change' }, ({ payload }) => {
          const change = payload as WorkflowChange;
          this.state[workflowId].changes.unshift(change);

          // Keep only last 100 changes
          if (this.state[workflowId].changes.length > 100) {
            this.state[workflowId].changes = this.state[workflowId].changes.slice(0, 100);
          }

          this.notifyStateChange(workflowId);
        })

        // Handle cursor movements
        .on('broadcast', { event: 'cursor_move' }, ({ payload }) => {
          const { userId, cursor, selection } = payload;
          if (this.state[workflowId].users[userId]) {
            this.state[workflowId].users[userId].cursor = cursor;
            this.state[workflowId].users[userId].selection = selection;
            this.notifyCursorUpdate(workflowId);
          }
        })

        // Handle typing indicators
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
          const { userId, isTyping } = payload;
          if (this.state[workflowId].users[userId]) {
            this.state[workflowId].users[userId].status = isTyping ? 'typing' : 'online';
            this.notifyStateChange(workflowId);
          }
        });

      this.channels.set(workflowId, channel);
    }

    // Subscribe and track presence
    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        this.state[workflowId].isConnected = true;

        // Send presence data
        await channel.track({
          ...user,
          status: 'online',
          lastSeen: new Date().toISOString()
        });

        this.notifyStateChange(workflowId);
      }
    });

    // Return cleanup function
    return () => {
      this.leaveWorkflow(workflowId, user.id);
    };
  }

  // Leave workflow collaboration
  async leaveWorkflow(workflowId: string, userId: string): Promise<void> {
    const channel = this.channels.get(workflowId);
    if (channel) {
      await channel.untrack();

      // If no more users, unsubscribe channel
      if (Object.keys(this.state[workflowId]?.users || {}).length <= 1) {
        await channel.unsubscribe();
        this.channels.delete(workflowId);
        delete this.state[workflowId];
        this.listeners.delete(workflowId);
        this.cursorListeners.delete(workflowId);
      } else {
        // Remove user from state
        delete this.state[workflowId].users[userId];
        this.notifyStateChange(workflowId);
      }
    }
  }

  // Broadcast workflow changes
  async broadcastChange(
    workflowId: string,
    change: Omit<WorkflowChange, 'id' | 'timestamp'>
  ): Promise<void> {
    const channel = this.channels.get(workflowId);
    if (!channel) return;

    const fullChange: WorkflowChange = {
      ...change,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    await channel.send({
      type: 'broadcast',
      event: 'workflow_change',
      payload: fullChange
    });
  }

  // Broadcast cursor movement
  async broadcastCursor(
    workflowId: string,
    userId: string,
    cursor: { x: number; y: number },
    selection?: { nodeId: string; type: 'node' | 'edge' }
  ): Promise<void> {
    const channel = this.channels.get(workflowId);
    if (!channel) return;

    await channel.send({
      type: 'broadcast',
      event: 'cursor_move',
      payload: { userId, cursor, selection }
    });
  }

  // Broadcast typing status
  async broadcastTyping(
    workflowId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    const channel = this.channels.get(workflowId);
    if (!channel) return;

    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping }
    });
  }

  // Get current collaboration state
  getState(workflowId: string): CollaborationState | null {
    return this.state[workflowId] || null;
  }

  // Get online users for a workflow
  getOnlineUsers(workflowId: string): CollaborationUser[] {
    const state = this.state[workflowId];
    if (!state) return [];

    return Object.values(state.users).filter(user => user.status !== 'idle');
  }

  // Get recent changes for a workflow
  getRecentChanges(workflowId: string, limit = 20): WorkflowChange[] {
    const state = this.state[workflowId];
    if (!state) return [];

    return state.changes.slice(0, limit);
  }

  // Apply operational transform for conflict resolution
  applyOperationalTransform(
    localChange: WorkflowChange,
    remoteChange: WorkflowChange
  ): WorkflowChange | null {
    // Simple operational transform logic
    // In production, you'd want more sophisticated OT algorithms

    if (localChange.type === 'node_updated' && remoteChange.type === 'node_updated') {
      if (localChange.data.nodeId === remoteChange.data.nodeId) {
        // Merge the changes based on timestamp
        if (new Date(localChange.timestamp) > new Date(remoteChange.timestamp)) {
          return localChange;
        } else {
          return remoteChange;
        }
      }
    }

    if (localChange.type === 'node_removed' && remoteChange.type === 'node_updated') {
      if (localChange.data.nodeId === remoteChange.data.nodeId) {
        // Removal takes precedence
        return localChange;
      }
    }

    return localChange;
  }

  // Sync workflow state with database
  async syncWithDatabase(workflowId: string): Promise<void> {
    try {
      const { data: workflow, error } = await this.supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) throw error;

      if (workflow) {
        this.state[workflowId].lastSync = new Date().toISOString();
        this.notifyStateChange(workflowId);
      }
    } catch (error) {
      console.error('Error syncing with database:', error);
    }
  }

  // Private methods for notifications
  private notifyStateChange(workflowId: string): void {
    const listeners = this.listeners.get(workflowId);
    if (listeners) {
      const state = this.state[workflowId];
      listeners.forEach(listener => listener(state));
    }
  }

  private notifyCursorUpdate(workflowId: string): void {
    const listeners = this.cursorListeners.get(workflowId);
    if (listeners) {
      const users = this.state[workflowId]?.users || {};
      listeners.forEach(listener => listener(users));
    }
  }

  // Cleanup all connections
  async cleanup(): Promise<void> {
    for (const [workflowId, channel] of this.channels.entries()) {
      await channel.unsubscribe();
    }

    this.channels.clear();
    this.state = {};
    this.listeners.clear();
    this.cursorListeners.clear();
  }
}

// React Hook for using collaboration features
export function useCollaboration(
  workflowId: string,
  user: { id: string; name: string; email: string; avatar?: string }
) {
  const [state, setState] = React.useState<CollaborationState | null>(null);
  const [cursors, setCursors] = React.useState<Record<string, CollaborationUser>>({});
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (!workflowId || !user.id) return;

    const collaboration = CollaborationEngine.getInstance();
    let cleanup: (() => void) | undefined;

    const initCollaboration = async () => {
      cleanup = await collaboration.joinWorkflow(
        workflowId,
        user,
        (newState) => {
          setState(newState);
          setIsConnected(newState.isConnected);
        },
        (users) => {
          setCursors(users);
        }
      );
    };

    initCollaboration();

    return () => {
      if (cleanup) cleanup();
    };
  }, [workflowId, user.id]);

  const broadcastChange = React.useCallback(
    (change: Omit<WorkflowChange, 'id' | 'timestamp'>) => {
      const collaboration = CollaborationEngine.getInstance();
      collaboration.broadcastChange(workflowId, change);
    },
    [workflowId]
  );

  const broadcastCursor = React.useCallback(
    (cursor: { x: number; y: number }, selection?: { nodeId: string; type: 'node' | 'edge' }) => {
      const collaboration = CollaborationEngine.getInstance();
      collaboration.broadcastCursor(workflowId, user.id, cursor, selection);
    },
    [workflowId, user.id]
  );

  const broadcastTyping = React.useCallback(
    (isTyping: boolean) => {
      const collaboration = CollaborationEngine.getInstance();
      collaboration.broadcastTyping(workflowId, user.id, isTyping);
    },
    [workflowId, user.id]
  );

  return {
    state,
    cursors,
    isConnected,
    onlineUsers: state ? Object.values(state.users) : [],
    recentChanges: state?.changes || [],
    broadcastChange,
    broadcastCursor,
    broadcastTyping
  };
}