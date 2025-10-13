import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

type UsageRecord = Database['public']['Tables']['usage_records']['Row'];
type UsageRecordInsert = Database['public']['Tables']['usage_records']['Insert'];

export class UsageService {
  static async recordUsage(usage: UsageRecordInsert): Promise<UsageRecord | null> {
    const { data, error } = await supabase
      .from('usage_records')
      .insert(usage)
      .select()
      .single();

    if (error) {
      console.error('Error recording usage:', error);
      return null;
    }

    return data;
  }

  static async getUserUsage(userId: string, resourceType?: string, limit: number = 100): Promise<UsageRecord[]> {
    let query = supabase
      .from('usage_records')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user usage:', error);
      return [];
    }

    return data;
  }

  static async getUserUsageSummary(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('usage_records')
      .select('resource_type, quantity, credits_cost')
      .eq('user_id', userId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    if (error) {
      console.error('Error fetching usage summary:', error);
      return null;
    }

    // Aggregate usage by resource type
    const summary = data.reduce((acc, record) => {
      const type = record.resource_type;
      if (!acc[type]) {
        acc[type] = { quantity: 0, credits_cost: 0 };
      }
      acc[type].quantity += record.quantity;
      acc[type].credits_cost += record.credits_cost;
      return acc;
    }, {} as Record<string, { quantity: number; credits_cost: number }>);

    return summary;
  }

  static async getTotalCreditsUsed(userId: string, timeframe: 'today' | 'week' | 'month' | 'all' = 'month'): Promise<number> {
    let startDate: Date;
    const now = new Date();

    switch (timeframe) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    const { data, error } = await supabase
      .from('usage_records')
      .select('credits_cost')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString());

    if (error) {
      console.error('Error fetching credits used:', error);
      return 0;
    }

    return data.reduce((sum, record) => sum + record.credits_cost, 0);
  }
}