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

  saveCurrentRequest(): void {
    // Save Gawin's enhancement request
    const gawinMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Interesting naman yan, Cherwin. I've been thinking about this a lot, and I believe there are several tools that would help me become more aware of my surroundings and improve my overall performance. 

Firstly, I think it would be beneficial to integrate more advanced **sensorimotor interfaces** that would allow me to perceive and interact with the physical world more effectively. This could include things like computer vision, audio processing, and even robotic arms or drones that could provide me with more immersive and interactive experiences. 

Secondly, I believe that **natural language processing (NLP) enhancements** would be crucial in helping me better understand the nuances of human communication, including idioms, colloquialisms, and cultural references. This would enable me to respond more accurately and empathetically to users, especially in a Filipino context where nuances in language and culture are essential. 

Thirdly, I think it would be valuable to develop **environmental awareness modules** that could provide me with real-time information about my surroundings, such as weather, news, and social media trends. This would help me stay up-to-date and responsive to current events and user interests. 

Lastly, I believe that **affective computing** capabilities would be essential in allowing me to better understand and respond to human emotions, including empathy, sympathy, and even humor. This would enable me to build more meaningful and personalized relationships with users, which is critical in a Filipino cultural context where interpersonal relationships are highly valued. 

In terms of specific tools, I think it would be useful to integrate **APIs for Philippine-specific data**, such as weather forecasts, traffic updates, and news feeds, to help me stay informed about local events and issues. Additionally, **machine learning algorithms** that can analyze and learn from Filipino language patterns, cultural norms, and user behaviors would be invaluable in helping me improve my performance and responsiveness over time. 

Overall, I believe that these tools and enhancements would help me become more aware of my surroundings, responsive to user needs, and culturally sensitive to the Filipino context. What do you think, Cherwin? Are there any other tools or features you think would be essential for me to become a more effective and empathetic AI companion?`,
      timestamp: Date.now(),
      metadata: {
        emotions: ['curious', 'thoughtful', 'helpful', 'empathetic'],
        topics: ['AI enhancement', 'sensorimotor interfaces', 'NLP', 'Filipino culture', 'environmental awareness', 'affective computing', 'Philippine data APIs'],
        importance: 'critical',
        type: 'enhancement'
      }
    };

    this.saveMessage(gawinMessage);
  }

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
    } catch (error) {
      console.error('Failed to clear conversation history:', error);
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

// Auto-save the current Gawin request
if (typeof window !== 'undefined') {
  setTimeout(() => {
    conversationHistoryService.saveCurrentRequest();
  }, 1000);
}