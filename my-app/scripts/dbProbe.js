import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(url, key);

const parentGuesses = [
  'sessions',
  'workout_sessions',
  'workouts',
  'training_sessions',
  'workout',
  'session',
];

async function main() {
  const wx = await supabase
    .from('workout_exercises')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (wx.error) {
    console.log('Could not read workout_exercises:', wx.error.message);
    return;
  }
  const row = wx.data?.[0];
  console.log('\nSample workout_exercises row:\n', row ?? '(none)');

  if (!row?.session_id) {
    console.log('\nNo session_id found in the sample. If table is empty, insert a test row in the app or Dashboard.');
    return;
  }

  const sessionId = row.session_id;

  for (const table of parentGuesses) {
    const q = await supabase.from(table).select('*').eq('id', sessionId).limit(1);
    if (!q.error && q.data && q.data.length) {
      const sample = q.data[0];
      console.log(`\nPARENT TABLE FOUND: ${table}`);
      console.log('Sample parent row keys:', Object.keys(sample));
      console.log('Sample parent row:', sample);
      return;
    }
  }

  console.log('\nParent table not auto-detected. It may have a different name or RLS blocks anon reads.');
  console.log('Try checking the Supabase dashboard Table Editor to see which table references workout_exercises.session_id.');
}

main();
