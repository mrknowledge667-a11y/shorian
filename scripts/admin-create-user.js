// scripts/admin-create-user.js
// Local CLI to create an admin user in Supabase using the service role key.
// Usage: npm run admin

const readline = require('node:readline');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.REACT_APP_SUPABASE_URL ||
  'https://byguuzomaqhyywyuqmch.supabase.co';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL) {
  console.error('Missing SUPABASE_URL environment variable.');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌ Missing SUPABASE_SERVICE_ROLE environment variable.\n');
  console.log('To create admin users, you need the service role key from Supabase.\n');
  console.log('Option 1: Get your service role key');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to Settings > API');
  console.log('3. Copy the "service_role" key (keep this secret!)');
  console.log('4. Run this command with the key:');
  console.log('   SUPABASE_SERVICE_ROLE="your-service-role-key" npm run admin\n');
  
  console.log('Option 2: Create admin manually in Supabase');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to Authentication > Users');
  console.log('3. Click "Add user" > "Create new user"');
  console.log('4. Enter email and password');
  console.log('5. After creation, go to Table Editor > profiles');
  console.log('6. Find the user and set is_admin = true\n');
  
  console.log('⚠️  Never commit the service role key to version control!');
  console.log('⚠️  The service role key bypasses Row Level Security.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Prompt helper
function ask(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

(async () => {
  try {
    console.log('Create an admin user for WiMed Admin Dashboard');
    const email = (await ask('Email: ')).trim();
    if (!email || !email.includes('@')) throw new Error('Invalid email');

    const password = (await ask('Password (min 6 chars): ')).trim();
    if (!password || password.length < 6) throw new Error('Password too short');

    // 1) Create user with Supabase Admin API (email confirmed)
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    
    if (createError) {
      if (createError.message?.includes('not allowed') || createError.message?.includes('Invalid API key')) {
        console.error('\n❌ Error: Invalid service role key or insufficient permissions.\n');
        console.log('Make sure you are using the SERVICE ROLE key, not the ANON key.');
        console.log('The service role key starts with "eyJ..." and is much longer than the anon key.\n');
        console.log('You can find it in your Supabase dashboard under Settings > API > service_role\n');
        throw new Error('Invalid service role key');
      }
      throw createError;
    }

    const user = userData.user;
    if (!user?.id) throw new Error('User creation returned no user id');

    // 2) Upsert profile with is_admin = true
    const { error: upsertError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        is_admin: true,
      },
      { onConflict: 'id' }
    );
    if (upsertError) throw upsertError;

    console.log('Admin user created successfully: ' + email);
    console.log('You can now sign in at /admin with this account.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin user:', err.message || err);
    process.exit(1);
  }
})();