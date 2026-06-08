import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabasePublishableKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable');
}

// On the web the app is statically rendered on the server (app.json
// `web.output: "static"`), where there is no `window` for AsyncStorage to read.
// Fall back to a no-op store there so importing the client never touches the DOM;
// the browser and native runtimes keep using AsyncStorage as normal.
const hasWindow = typeof window !== 'undefined';

const storage = hasWindow
  ? AsyncStorage
  : {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    };

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    // Read the recovery/confirmation tokens from the URL on the web client so a
    // password-reset link can establish the temporary session needed to set a
    // new password. Off during static rendering (no window) and on native,
    // which uses deep links instead.
    detectSessionInUrl: hasWindow && Platform.OS === 'web',
  },
});
