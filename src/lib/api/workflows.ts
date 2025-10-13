import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

type Workflow = Database['public']['Tables']['workflows']['Row'];
type WorkflowInsert = Database['public']['Tables']['workflows']['Insert'];
type WorkflowUpdate = Database['public']['Tables']['workflows']['Update'];
type WorkflowExecution = Database['public']['Tables']['workflow_executions']['Row'];
type WorkflowExecutionInsert = Database['public']['Tables']['workflow_executions']['Insert'];

export class WorkflowService {
  static async getUserWorkflows(userId: string): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }

    return data;
  }

  static async getPublicWorkflows(limit: number = 20): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching public workflows:', error);
      return [];
    }

    return data;
  }

  static async createWorkflow(workflow: WorkflowInsert): Promise<Workflow | null> {
    const { data, error } = await supabase
      .from('workflows')
      .insert(workflow)
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow:', error);
      return null;
    }

    return data;
  }

  static async updateWorkflow(workflowId: string, updates: WorkflowUpdate): Promise<Workflow | null> {
    const { data, error } = await supabase
      .from('workflows')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflowId)
      .select()
      .single();

    if (error) {
      console.error('Error updating workflow:', error);
      return null;
    }

    return data;
  }

  static async deleteWorkflow(workflowId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', workflowId)
      .eq('owner_id', userId);

    if (error) {
      console.error('Error deleting workflow:', error);
      return false;
    }

    return true;
  }

  static async executeWorkflow(execution: WorkflowExecutionInsert): Promise<WorkflowExecution | null> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .insert(execution)
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow execution:', error);
      return null;
    }

    return data;
  }

  static async updateExecution(
    executionId: string,
    updates: Partial<Pick<WorkflowExecution, 'status' | 'output_data' | 'execution_log' | 'error_message' | 'credits_used' | 'duration_ms' | 'completed_at'>>
  ): Promise<WorkflowExecution | null> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .update(updates)
      .eq('id', executionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating workflow execution:', error);
      return null;
    }

    return data;
  }

  static async getWorkflowExecutions(workflowId: string, limit: number = 50): Promise<WorkflowExecution[]> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching workflow executions:', error);
      return [];
    }

    return data;
  }
}