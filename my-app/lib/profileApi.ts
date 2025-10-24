import { supabase } from './supabaseClient';

const DEFAULT_PROFILE_ID = 'fe2fbd92-fd7b-4152-8e92-4d77f169e6da';

export interface ActiveUserProfile {
  id: string;                 // users.id (stringified)
  profileId: string;          // user_profiles.profile_id (uuid)
  email: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  updatedAt: string | null;
}

export async function fetchActiveUserProfile(
  profileId: string = DEFAULT_PROFILE_ID
): Promise<ActiveUserProfile> {
  const selectColumns =
    // NOTE: use profile_picture_url (not profile_picture)
    'profile_id, id, first_name, last_name, bio, profile_picture_url, date_of_birth, gender, updated_at';

  // 1) Try by profile_id (uuid)
  const { data: byProfileId, error: byProfileErr } = await supabase
    .from('user_profiles')
    .select(selectColumns)
    .eq('profile_id', profileId)
    .maybeSingle();

  if (byProfileErr) throw byProfileErr;

  let row = byProfileId;

  // 2) Optional fallback: if the caller passed a numeric *user id* as a string
  if (!row) {
    const maybeUserId = Number(profileId);
    if (!Number.isNaN(maybeUserId)) {
      const { data: byUserId, error: byUserErr } = await supabase
        .from('user_profiles')
        .select(selectColumns)
        .eq('id', maybeUserId) // user_profiles.id (int4) -> users.id
        .maybeSingle();
      if (byUserErr) throw byUserErr;
      row = byUserId ?? null;
    }
  }

  if (!row) throw new Error('Profile not found.');

  // Fetch email/username from public.users (int4 id)
  let account: { email: string | null; username: string | null } | null = null;
  if (typeof row.id === 'number') {
    const { data, error } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', row.id)
      .maybeSingle();
    if (error) throw error;
    account = data ?? null;
  }

  const firstName =
    typeof row.first_name === 'string' ? row.first_name.trim() || null : null;
  const lastName =
    typeof row.last_name === 'string' ? row.last_name.trim() || null : null;
  const email =
    typeof account?.email === 'string' ? account.email.trim() : account?.email ?? '';
  const username =
    typeof account?.username === 'string' ? account.username.trim() || null : account?.username ?? null;
  const bio = typeof row.bio === 'string' ? row.bio.trim() || null : null;

  const fullName =
    [firstName, lastName].filter(Boolean).join(' ') ||
    username ||
    email ||
    'Unknown User';

  return {
    id: String(row.id ?? ''),
    profileId: row.profile_id ?? profileId,
    email,
    fullName,
    firstName,
    lastName,
    username,
    bio,
    // NOTE: map the corrected column
    profilePictureUrl: row.profile_picture_url ?? null,
    dateOfBirth: row.date_of_birth ?? null,
    gender: row.gender ?? null,
    updatedAt: row.updated_at ?? null,
  };
}
