import { supabase } from './supabaseClient';

const PROFILE_PICTURE_BUCKET =
  process.env.EXPO_PUBLIC_SUPABASE_AVATAR_BUCKET?.trim() || 'profileImage';

const PROFILE_PICTURE_CACHE_CONTROL = '3600';

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

function extractFileExtension(uri: string): string | null {
  const cleanUri = uri.split(/[?#]/)[0] ?? '';
  const match = /\.([a-zA-Z0-9]+)$/.exec(cleanUri);
  return match ? match[1].toLowerCase() : null;
}

function mimeFromExtension(ext: string | null): string | null {
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    default:
      return null;
  }
}

export async function uploadAvatarToSupabase(
  localUri: string,
  profileId: string = DEFAULT_PROFILE_ID
): Promise<string> {
  if (!localUri) throw new Error('No image selected.');

  // Figure out extension & default content-type
  const extFromUri = extractFileExtension(localUri);
  const fileExtension = (extFromUri || 'jpg').toLowerCase();
  const contentType = mimeFromExtension(fileExtension) || 'image/jpeg';

  // Create FormData for upload
  const formData = new FormData();

  // For React Native, we need to structure the file object properly
  const fileObj = {
    uri: localUri,
    type: contentType,
    name: `avatar.${fileExtension}`,
  } as any;

  formData.append('file', fileObj);

  // Where to store in the bucket (using profileId instead of user.id)
  const objectPath = `${profileId}/${Date.now()}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_PICTURE_BUCKET)
    .upload(objectPath, formData, {
      contentType,
      cacheControl: PROFILE_PICTURE_CACHE_CONTROL,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from(PROFILE_PICTURE_BUCKET)
    .getPublicUrl(objectPath);

  const publicUrl = publicUrlData?.publicUrl;
  if (!publicUrl) throw new Error('Unable to retrieve the uploaded image URL.');

  return publicUrl;
}


export async function updateProfilePictureUrl(
  publicUrl: string,
  profileId: string = DEFAULT_PROFILE_ID
): Promise<void> {
  if (!publicUrl) throw new Error('Missing profile picture URL.');

  const { error } = await supabase
    .from('user_profiles')
    .update({
      profile_picture_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('profile_id', profileId);

  if (error) throw error;
}
