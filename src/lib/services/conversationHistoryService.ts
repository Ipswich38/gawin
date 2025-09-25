'use client';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    emotions?: string[];
    topics?: string[];
    importance?: 'low' | 'medium' | 'high' | 'critical';
    type?: 'request' | 'enhancement' | 'feedback' | 'general';
  };
}

export interface ConversationHistory {
  id: string;
  timestamp: number;
  messages: ConversationMessage[];
  duration: number;
  summary: string;
  emotions: string[];
  topics: string[];
  importance: 'low' | 'medium' | 'high' | 'critical';
  metadata?: {
    context?: string;
    userIntent?: string;
    gawinResponse?: string;
    followUpNeeded?: boolean;
  };
}

class ConversationHistoryService {
  private storageKey = 'gawin_conversation_history';

  saveMessage(message: ConversationMessage, conversationId?: string): void {
    try {
      const history = this.getHistory();
      let currentConversation = conversationId 
        ? history.find(h => h.id === conversationId)
        : history[history.length - 1];

      if (!currentConversation || this.shouldStartNewConversation(message, currentConversation)) {
        currentConversation = this.createNewConversation(message);
        history.push(currentConversation);
      } else {
        currentConversation.messages.push(message);
        currentConversation.duration = Date.now() - currentConversation.timestamp;
        this.updateConversationMetadata(currentConversation);
      }

      this.saveHistory(history);
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  }

  // Removed saveCurrentRequest method to prevent hardcoded message loops

  private shouldStartNewConversation(message: ConversationMessage, lastConversation: ConversationHistory): boolean {
    const timeDiff = message.timestamp - (lastConversation.messages[lastConversation.messages.length - 1]?.timestamp || 0);
    const timeThreshold = 30 * 60 * 1000; // 30 minutes

    return timeDiff > timeThreshold || lastConversation.messages.length > 50;
  }

  private createNewConversation(message: ConversationMessage): ConversationHistory {
    return {
      id: crypto.randomUUID(),
      timestamp: message.timestamp,
      messages: [message],
      duration: 0,
      summary: this.generateSummary([message]),
      emotions: message.metadata?.emotions || [],
      topics: message.metadata?.topics || [],
      importance: message.metadata?.importance || 'medium'
    };
  }

  private updateConversationMetadata(conversation: ConversationHistory): void {
    const allEmotions = conversation.messages.flatMap(m => m.metadata?.emotions || []);
    const allTopics = conversation.messages.flatMap(m => m.metadata?.topics || []);
    
    conversation.emotions = [...new Set(allEmotions)];
    conversation.topics = [...new Set(allTopics)];
    conversation.summary = this.generateSummary(conversation.messages);
    
    // Update importance based on message importance
    const hasHighImportance = conversation.messages.some(m => m.metadata?.importance === 'high');
    const hasCriticalImportance = conversation.messages.some(m => m.metadata?.importance === 'critical');
    
    if (hasCriticalImportance) {
      conversation.importance = 'critical';
    } else if (hasHighImportance) {
      conversation.importance = 'high';
    }
  }

  private generateSummary(messages: ConversationMessage[]): string {
    if (messages.length === 0) return 'Empty conversation';
    
    const topics = messages.flatMap(m => m.metadata?.topics || []);
    const uniqueTopics = [...new Set(topics)].slice(0, 3);
    
    if (uniqueTopics.length > 0) {
      return `Discussion about ${uniqueTopics.join(', ')}`;
    }
    
    const firstMessage = messages[0];
    if (firstMessage.content.length > 50) {
      return firstMessage.content.substring(0, 50) + '...';
    }
    
    return firstMessage.content;
  }

  getHistory(): ConversationHistory[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      return [];
    }
  }

  private saveHistory(history: ConversationHistory[]): void {
    try {
      // Keep only last 100 conversations to manage storage
      const trimmedHistory = history.slice(-100);
      localStorage.setItem(this.storageKey, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  }

  getConversationById(id: string): ConversationHistory | null {
    const history = this.getHistory();
    return history.find(h => h.id === id) || null;
  }

  searchConversations(query: string): ConversationHistory[] {
    const history = this.getHistory();
    const lowerQuery = query.toLowerCase();
    
    return history.filter(conversation => 
      conversation.summary.toLowerCase().includes(lowerQuery) ||
      conversation.topics.some(topic => topic.toLowerCase().includes(lowerQuery)) ||
      conversation.messages.some(message => 
        message.content.toLowerCase().includes(lowerQuery)
      )
    );
  }

  getImportantConversations(): ConversationHistory[] {
    const history = this.getHistory();
    return history.filter(h => h.importance === 'critical' || h.importance === 'high')
                  .sort((a, b) => b.timestamp - a.timestamp);
  }

  exportHistory(format: 'json' | 'txt' = 'json'): string {
    const history = this.getHistory();
    
    if (format === 'json') {
      return JSON.stringify(history, null, 2);
    }
    
    // Text format
    return history.map(conversation => {
      const date = new Date(conversation.timestamp).toLocaleString();
      let output = `=== Conversation: ${conversation.summary} ===\n`;
      output += `Date: ${date}\n`;
      output += `Duration: ${Math.round(conversation.duration / 60000)}m\n`;
      output += `Topics: ${conversation.topics.join(', ')}\n`;
      output += `Importance: ${conversation.importance}\n\n`;
      
      conversation.messages.forEach(message => {
        output += `[${message.role.toUpperCase()}] ${message.content}\n\n`;
      });
      
      return output;
    }).join('\n' + '='.repeat(80) + '\n\n');
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('✅ Conversation history cleared');
    } catch (error) {
      console.error('Failed to clear conversation history:', error);
    }
  }

  // Clear all Gawin-related localStorage data to fix message loops
  clearAllGawinData(): void {
    try {
      const keys = Object.keys(localStorage);
      const gawinKeys = keys.filter(key => key.includes('gawin'));

      gawinKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🧹 Cleared localStorage key: ${key}`);
      });

      console.log('✅ All Gawin data cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear Gawin data:', error);
    }
  }

  getAnalytics() {
    const history = this.getHistory();
    const totalConversations = history.length;
    const totalMessages = history.reduce((sum, conv) => sum + conv.messages.length, 0);
    const averageSessionDuration = history.length > 0 
      ? history.reduce((sum, conv) => sum + conv.duration, 0) / history.length 
      : 0;

    // Topic analysis
    const allTopics = history.flatMap(h => h.topics);
    const topicCounts = allTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    // Emotion analysis  
    const allEmotions = history.flatMap(h => h.emotions);
    const emotionCounts = allEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([emotion, count]) => ({ emotion, count }));

    return {
      totalConversations,
      totalMessages,
      averageSessionDuration,
      topTopics,
      topEmotions,
      importantConversations: this.getImportantConversations().length
    };
  }
}

export const conversationHistoryService = new ConversationHistoryService();

// Auto-save disabled to prevent message loops
// if (typeof window !== 'undefined') {
//   setTimeout(() => {
//     conversationHistoryService.saveCurrentRequest();
//   }, 1000);
// }