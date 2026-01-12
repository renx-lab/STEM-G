/**
 * STEM12G - Database Configuration
 * This file establishes the link between your website and Supabase.
 */

// 1. Define your Supabase Credentials
const supabaseUrl = 'https://hrzgkljyqsomhjmuqddu.supabase.co';
const supabaseKey = 'sb_publishable_mOqHg-ZMch3GJo68W8eA5w_6wMWURzE';

// 2. Initialize the Supabase Client
// We destructure 'createClient' from the global 'supabase' object loaded in HTML
const { createClient } = supabase;

// 3. Attach the client to the 'window' object
// This ensures that memories.js and other files can use window.supabase
window.supabase = createClient(supabaseUrl, supabaseKey);

// 4. Connection Debugger
console.log("--- STEM12G VAULT STATUS ---");
if (window.supabase) {
    console.log("✅ Supabase Client Initialized Successfully");
    console.log("🔗 URL:", supabaseUrl);
} else {
    console.error("❌ Failed to initialize Supabase. Check your script order.");
}