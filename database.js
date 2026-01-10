/* DB-CON.js 
   STEM12G - Supabase Configuration
*/

const SUPABASE_URL = 'https://hrzgkljyqsomhjmuqddu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_mOqHg-ZMch3GJo68W8eA5w_6wMWURzE'; // Your public key

// Initialize the Supabase Client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Exporting is not needed in plain HTML/JS, 
// 'supabase' is now a global variable you can use in other scripts.