import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Supabase configuration
// Get these values from your Supabase project settings
// 1. Go to https://supabase.com/dashboard
// 2. Select your project or create a new one
// 3. Go to Settings > API
// 4. Copy the Project URL and anon/public key

// Dummy credentials for guest mode testing
// Replace these with real Supabase credentials when you're ready to use cloud features
// These dummy values allow the app to start in guest mode without a real Supabase backend
const SUPABASE_URL = "https://xxxxxxxxxxxxxxxxxxx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.ACURVJM1fw_7_dPKV5w6QsRVxTKXXJxL-0m7dXjLxkU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
