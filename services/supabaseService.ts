// SUPABASE INTEGRATION SERVICE
// Real Database Backend for Bravo Forms v2.0

import { createClient } from '@supabase/supabase-js';
import { User, Form, FormResponse, Team } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: any = null;

export const initializeSupabase = () => {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
  }
  return false;
};

export const isSupabaseConfigured = (): boolean => {
  return supabase !== null && SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';
};

// AUTHENTICATION
export const authenticateUserSupabase = async (email: string, password: string) => {
  try {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userError) return { success: false, error: userError.message };
    return { success: true, user: userData };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// FORMS OPERATIONS
export const getFormsByTeamSupabase = async (teamId: string): Promise<Form[]> => {
  try {
    if (!supabase) return [];
    let query = supabase.from('forms').select('*');
    if (teamId !== 'all') query = query.eq('team_id', teamId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching forms:', err);
    return [];
  }
};

export const getFormByIdSupabase = async (id: string): Promise<Form | undefined> => {
  try {
    if (!supabase) return undefined;
    const { data, error } = await supabase.from('forms').select('*').eq('id', id).single();
    if (error) return undefined;
    return data;
  } catch (err) {
    return undefined;
  }
};

export const saveFormSupabase = async (form: Form): Promise<void> => {
  try {
    if (!supabase) return;
    const { error } = await supabase.from('forms').upsert([form], { onConflict: 'id' });
    if (error) throw error;
  } catch (err) {
    console.error('Error saving form:', err);
  }
};

export const deleteFormSupabase = async (id: string): Promise<void> => {
  try {
    if (!supabase) return;
    const { error } = await supabase.from('forms').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('Error deleting form:', err);
  }
};

// RESPONSES
export const saveResponseSupabase = async (formId: string, answers: Record<string, any>, userId: string): Promise<void> => {
  try {
    if (!supabase) return;
    const newResponse = { form_id: formId, submitted_at: new Date().toISOString(), submitted_by: userId, answers };
    const { error } = await supabase.from('form_responses').insert([newResponse]);
    if (error) throw error;
  } catch (err) {
    console.error('Error saving response:', err);
  }
};

export const getResponsesByFormIdSupabase = async (formId: string): Promise<FormResponse[]> => {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase.from('form_responses').select('*').eq('form_id', formId);
    if (error) return [];
    return data || [];
  } catch (err) {
    console.error('Error fetching responses:', err);
    return [];
  }
};

// USERS
export const getAllUsersSupabase = async (): Promise<User[]> => {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase.from('users').select('*');
    if (error) return [];
    return data || [];
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
};

export const createUserSupabase = async (user: User): Promise<void> => {
  try {
    if (!supabase) return;
    const { error } = await supabase.from('users').insert([user]);
    if (error) throw error;
  } catch (err) {
    console.error('Error creating user:', err);
  }
};

// TEAMS
export const getTeamsSupabase = async (): Promise<Team[]> => {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase.from('teams').select('*');
    if (error) return [];
    return data || [];
  } catch (err) {
    console.error('Error fetching teams:', err);
    return [];
  }
};

export const createTeamSupabase = async (team: Team): Promise<void> => {
  try {
    if (!supabase) return;
    const { error } = await supabase.from('teams').insert([team]);
    if (error) throw error;
  } catch (err) {
    console.error('Error creating team:', err);
  }
};

// EXPORT FEATURE - CSV
export const exportFormResponsesAsCSV = async (formId: string, fileName: string = 'responses.csv'): Promise<void> => {
  try {
    const responses = await getResponsesByFormIdSupabase(formId);
    if (responses.length === 0) {
      alert('No responses to export');
      return;
    }
    
    const headers = Object.keys(responses[0].answers || {});
    let csv = headers.join(',') + '\n';
    
    responses.forEach(r => {
      const values = headers.map(h => {
        const val = r.answers[h];
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csv += values.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  } catch (err) {
    console.error('Error exporting CSV:', err);
  }
};

// EXPORT FEATURE - PDF
export const exportFormResponsesAsPDF = async (formId: string, fileName: string = 'responses.pdf'): Promise<void> => {
  try {
    const responses = await getResponsesByFormIdSupabase(formId);
    if (responses.length === 0) {
      alert('No responses to export');
      return;
    }
    
    // This requires jsPDF - would be implemented with actual PDF generation
    console.log('PDF export requires jsPDF library - implement with your PDF library');
  } catch (err) {
    console.error('Error exporting PDF:', err);
  }
};

export default { initializeSupabase, isSupabaseConfigured };
