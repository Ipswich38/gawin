import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

type Agent = Database['public']['Tables']['agents']['Row'];
type AgentInsert = Database['public']['Tables']['agents']['Insert'];
type AgentUpdate = Database['public']['Tables']['agents']['Update'];

export class AgentService {
  static async getPublicAgents(limit: number = 50): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_public', true)
      .order('downloads', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching public agents:', error);
      return [];
    }

    return data;
  }

  static async getMarketplaceAgents(limit: number = 50): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_marketplace', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching marketplace agents:', error);
      return [];
    }

    return data;
  }

  static async getUserAgents(userId: string): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user agents:', error);
      return [];
    }

    return data;
  }

  static async getAgentById(agentId: string): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (error) {
      console.error('Error fetching agent:', error);
      return null;
    }

    return data;
  }

  static async createAgent(agent: AgentInsert): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .insert(agent)
      .select()
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      return null;
    }

    return data;
  }

  static async updateAgent(agentId: string, updates: AgentUpdate): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating agent:', error);
      return null;
    }

    return data;
  }

  static async incrementDownloads(agentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('agents')
      .update({
        downloads: supabase.raw('downloads + 1'),
        updated_at: new Date().toISOString(),
      })
      .eq('id', agentId);

    if (error) {
      console.error('Error incrementing downloads:', error);
      return false;
    }

    return true;
  }

  static async searchAgents(query: string, limit: number = 20): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .eq('is_public', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching agents:', error);
      return [];
    }

    return data;
  }

  static async getAgentsByCategory(category: string, limit: number = 20): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .contains('tags', [category])
      .eq('is_public', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching agents by category:', error);
      return [];
    }

    return data;
  }
}