/**
 * Supabase Client Integration
 * Example of how to use Supabase with environment configuration
 * 
 * Frontend uses anon key (safe to expose)
 * Backend uses service role key (must keep secret)
 */

import config from '../config/env.js';

/**
 * Initialize Supabase client
 * This will be loaded dynamically when needed
 */
let supabaseClient = null;

/**
 * Get or create Supabase client
 */
export async function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Dynamically import Supabase
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  
  // Create client with config from backend
  supabaseClient = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_ANON_KEY
  );

  if (config.DEBUG) {
    console.log('✅ Supabase client initialized');
  }

  return supabaseClient;
}

/**
 * Example: Authentication
 */
export const supabaseAuth = {
  /**
   * Sign up new user
   */
  async signUp(email, password) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Sign in user
   */
  async signIn(email, password) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Sign out user
   */
  async signOut() {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const supabase = await getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    return user;
  },

  /**
   * Listen to auth changes
   */
  onAuthStateChange(callback) {
    getSupabaseClient().then(supabase => {
      supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
    });
  },
};

/**
 * Example: Database Operations
 */
export const supabaseDB = {
  /**
   * Fetch data from table
   */
  async fetchData(table, options = {}) {
    const supabase = await getSupabaseClient();
    let query = supabase.from(table).select(options.select || '*');
    
    // Add filters
    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    // Add ordering
    if (options.orderBy) {
      query = query.order(options.orderBy, { 
        ascending: options.ascending !== false 
      });
    }
    
    // Add limit
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Insert data
   */
  async insert(table, data) {
    const supabase = await getSupabaseClient();
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },

  /**
   * Update data
   */
  async update(table, id, data) {
    const supabase = await getSupabaseClient();
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return result;
  },

  /**
   * Delete data
   */
  async delete(table, id) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

/**
 * Example: Storage Operations
 */
export const supabaseStorage = {
  /**
   * Upload file
   */
  async uploadFile(bucket, path, file) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    return data;
  },

  /**
   * Get public URL
   */
  async getPublicUrl(bucket, path) {
    const supabase = await getSupabaseClient();
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  /**
   * Delete file
   */
  async deleteFile(bucket, path) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
  },
};

/**
 * Example: Real-time Subscriptions
 */
export const supabaseRealtime = {
  /**
   * Subscribe to table changes
   */
  async subscribe(table, callback) {
    const supabase = await getSupabaseClient();
    
    const subscription = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: table },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();
    
    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  },
};

// Example usage:
/**

// Authentication
import { supabaseAuth } from './integrations/supabase.js';

const user = await supabaseAuth.signIn('user@example.com', 'password');
console.log('Logged in:', user);

// Database
import { supabaseDB } from './integrations/supabase.js';

const products = await supabaseDB.fetchData('products', {
  filter: { category: 'electronics' },
  orderBy: 'created_at',
  limit: 10
});

// Real-time
import { supabaseRealtime } from './integrations/supabase.js';

const unsubscribe = await supabaseRealtime.subscribe('orders', (payload) => {
  console.log('Order changed:', payload);
});

// Later: unsubscribe()

*/

export default {
  getClient: getSupabaseClient,
  auth: supabaseAuth,
  db: supabaseDB,
  storage: supabaseStorage,
  realtime: supabaseRealtime,
};