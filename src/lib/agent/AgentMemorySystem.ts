/**
 * Persistent Memory System for Gawin Autonomous Agent
 * Handles persistent storage and retrieval of agent memory across sessions
 */

import { AgentMemory, Goal, ProactiveSuggestion } from './AutonomousAgentCore';

class AgentMemorySystem {
  private readonly STORAGE_KEY = 'gawin_agent_memory';
  private readonly GOALS_KEY = 'gawin_agent_goals';
  private readonly SUGGESTIONS_KEY = 'gawin_agent_suggestions';

  /**
   * Save user memory to persistent storage
   */
  saveUserMemory(userId: string, memory: AgentMemory): void {
    try {
      const allMemories = this.getAllMemories();
      allMemories[userId] = {
        ...memory,
        lastUpdated: new Date()
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allMemories));
      }

      console.log('💾 Memory saved for user:', userId);
    } catch (error) {
      console.error('❌ Failed to save memory:', error);
    }
  }

  /**
   * Load user memory from persistent storage
   */
  loadUserMemory(userId: string): AgentMemory | null {
    try {
      if (typeof window === 'undefined') {
        return null;
      }

      const allMemories = this.getAllMemories();
      const memory = allMemories[userId];

      if (memory) {
        // Convert date strings back to Date objects
        memory.lastUpdated = new Date(memory.lastUpdated);
        memory.longTermMemory.completedGoals.forEach(goal => {
          goal.createdAt = new Date(goal.createdAt);
          goal.updatedAt = new Date(goal.updatedAt);
          if (goal.deadline) goal.deadline = new Date(goal.deadline);
        });

        memory.workingMemory.currentGoals.forEach(goal => {
          goal.createdAt = new Date(goal.createdAt);
          goal.updatedAt = new Date(goal.updatedAt);
          if (goal.deadline) goal.deadline = new Date(goal.deadline);
        });

        console.log('📖 Memory loaded for user:', userId);
        return memory;
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to load memory:', error);
      return null;
    }
  }

  /**
   * Save goals to persistent storage
   */
  saveGoals(goals: Map<string, Goal>): void {
    try {
      const goalsArray = Array.from(goals.entries()).map(([id, goal]) => ({
        id,
        ...goal,
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
        deadline: goal.deadline?.toISOString()
      }));

      if (typeof window !== 'undefined') {
        localStorage.setItem(this.GOALS_KEY, JSON.stringify(goalsArray));
      }

      console.log('💾 Goals saved:', goals.size);
    } catch (error) {
      console.error('❌ Failed to save goals:', error);
    }
  }

  /**
   * Load goals from persistent storage
   */
  loadGoals(): Map<string, Goal> {
    try {
      if (typeof window === 'undefined') {
        return new Map();
      }

      const stored = localStorage.getItem(this.GOALS_KEY);
      if (!stored) return new Map();

      const goalsArray = JSON.parse(stored);
      const goalsMap = new Map<string, Goal>();

      goalsArray.forEach((goalData: any) => {
        const goal: Goal = {
          ...goalData,
          createdAt: new Date(goalData.createdAt),
          updatedAt: new Date(goalData.updatedAt),
          deadline: goalData.deadline ? new Date(goalData.deadline) : undefined
        };
        goalsMap.set(goal.id, goal);
      });

      console.log('📖 Goals loaded:', goalsMap.size);
      return goalsMap;
    } catch (error) {
      console.error('❌ Failed to load goals:', error);
      return new Map();
    }
  }

  /**
   * Save suggestions to persistent storage
   */
  saveSuggestions(userId: string, suggestions: ProactiveSuggestion[]): void {
    try {
      const allSuggestions = this.getAllSuggestions();
      allSuggestions[userId] = suggestions.map(suggestion => ({
        ...suggestion,
        createdAt: suggestion.createdAt.toISOString()
      }));

      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SUGGESTIONS_KEY, JSON.stringify(allSuggestions));
      }

      console.log('💾 Suggestions saved for user:', userId, suggestions.length);
    } catch (error) {
      console.error('❌ Failed to save suggestions:', error);
    }
  }

  /**
   * Load suggestions from persistent storage
   */
  loadSuggestions(userId: string): ProactiveSuggestion[] {
    try {
      if (typeof window === 'undefined') {
        return [];
      }

      const allSuggestions = this.getAllSuggestions();
      const suggestions = allSuggestions[userId] || [];

      return suggestions.map((suggestion: any) => ({
        ...suggestion,
        createdAt: new Date(suggestion.createdAt)
      }));
    } catch (error) {
      console.error('❌ Failed to load suggestions:', error);
      return [];
    }
  }

  /**
   * Clear old suggestions (older than 24 hours)
   */
  clearOldSuggestions(userId: string): void {
    try {
      const suggestions = this.loadSuggestions(userId);
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const recentSuggestions = suggestions.filter(suggestion =>
        suggestion.createdAt > twentyFourHoursAgo
      );

      this.saveSuggestions(userId, recentSuggestions);
      console.log('🧹 Cleared old suggestions for user:', userId);
    } catch (error) {
      console.error('❌ Failed to clear old suggestions:', error);
    }
  }

  /**
   * Export all user data for backup
   */
  exportUserData(userId: string): any {
    try {
      const memory = this.loadUserMemory(userId);
      const suggestions = this.loadSuggestions(userId);

      return {
        userId,
        memory,
        suggestions,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to export user data:', error);
      return null;
    }
  }

  /**
   * Import user data from backup
   */
  importUserData(userData: any): boolean {
    try {
      if (!userData.userId || !userData.memory) {
        throw new Error('Invalid user data format');
      }

      this.saveUserMemory(userData.userId, userData.memory);
      if (userData.suggestions) {
        this.saveSuggestions(userData.userId, userData.suggestions);
      }

      console.log('📥 User data imported for:', userData.userId);
      return true;
    } catch (error) {
      console.error('❌ Failed to import user data:', error);
      return false;
    }
  }

  /**
   * Get statistics about memory usage
   */
  getMemoryStats(): any {
    try {
      const allMemories = this.getAllMemories();
      const allGoals = this.loadGoals();

      return {
        totalUsers: Object.keys(allMemories).length,
        totalGoals: allGoals.size,
        completedGoals: Array.from(allGoals.values()).filter(g => g.status === 'completed').length,
        activeGoals: Array.from(allGoals.values()).filter(g => g.status === 'in_progress').length,
        storageUsed: this.getStorageSize()
      };
    } catch (error) {
      console.error('❌ Failed to get memory stats:', error);
      return null;
    }
  }

  private getAllMemories(): Record<string, AgentMemory> {
    if (typeof window === 'undefined') return {};

    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  private getAllSuggestions(): Record<string, any[]> {
    if (typeof window === 'undefined') return {};

    const stored = localStorage.getItem(this.SUGGESTIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  private getStorageSize(): string {
    if (typeof window === 'undefined') return '0 KB';

    let total = 0;
    for (let key in localStorage) {
      if (key.startsWith('gawin_')) {
        total += localStorage[key].length;
      }
    }

    return `${Math.round(total / 1024)} KB`;
  }
}

export const agentMemorySystem = new AgentMemorySystem();