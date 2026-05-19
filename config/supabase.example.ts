import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Supabase configuration
// Get these values from your Supabase project settings
// 1. Go to https://supabase.com/dashboard
// 2. Select your project or create a new one
// 3. Go to Settings > API
// 4. Copy the Project URL and anon/public key

// INSTRUCTIONS:
// 1. Copy this file to config/supabase.ts
// 2. Replace the placeholder values below with your actual Supabase credentials
// 3. Never commit the actual config/supabase.ts file to version control

const SUPABASE_URL = "https://xxxxxxxxxxxxx.supabase.co"; // Replace with your Project URL
const SUPABASE_ANON_KEY = "your-anon-key-here"; // Replace with your anon/public key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
