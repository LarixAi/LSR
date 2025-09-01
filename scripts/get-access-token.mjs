import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load env from .env.local if present, otherwise .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const envLocalPath = path.join(root, '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config({ path: path.join(root, '.env') });
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY. Add them to .env.local');
  process.exit(1);
}
if (!TEST_EMAIL || !TEST_PASSWORD) {
  console.error('Missing TEST_EMAIL or TEST_PASSWORD. Add them to .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    if (error) {
      console.error('Login failed:', error.message);
      process.exit(1);
    }
    const token = data.session?.access_token;
    if (!token) {
      console.error('No session token returned.');
      process.exit(1);
    }

    // Try to persist into .env.local if it exists
    if (fs.existsSync(envLocalPath)) {
      let content = fs.readFileSync(envLocalPath, 'utf8');
      if (content.includes('TEST_ACCESS_TOKEN=')) {
        content = content.replace(/TEST_ACCESS_TOKEN=.*/g, `TEST_ACCESS_TOKEN=${token}`);
      } else {
        if (!content.endsWith('\n')) content += '\n';
        content += `TEST_ACCESS_TOKEN=${token}\n`;
      }
      fs.writeFileSync(envLocalPath, content, 'utf8');
      console.log('Updated .env.local with TEST_ACCESS_TOKEN');
    }

    console.log('\n=== ACCESS TOKEN ===');
    console.log(token);
    console.log('====================\n');
    console.log('Use it in curl:');
    console.log('  Authorization: Bearer $TEST_ACCESS_TOKEN');
  } catch (e) {
    console.error('Unexpected error:', e);
    process.exit(1);
  }
})();
