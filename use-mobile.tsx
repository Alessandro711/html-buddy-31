import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://dypjhpjgslvufkzqcktg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_-6k3k5KE7NBpyBx1j1PMPw_DpGxKZq_';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
