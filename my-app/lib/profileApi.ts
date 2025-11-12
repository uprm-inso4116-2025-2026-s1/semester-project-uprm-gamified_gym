import { supabase } from './supabaseClient';

const PROFILE_PICTURE_BUCKET =
  process.env.EXPO_PUBLIC_SUPABASE_AVATAR_BUCKET?.trim() || 'profileImage';

const PROFILE_PICTURE_CACHE_CONTROL = '3600';

// ---------------------- HELPERS ----------------------
function extractFileExtension(uri: string): string {
  const match = /\.([a-zA-Z0-9]+)(?:[?#]|$)/.exec(uri);
  return match ? match[1].toLowerCase() : 'jpg';
}

function mimeFromExtension(ext: string): string {
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
      return 'image/jpeg';
  }
}

// ---------------------- UPLOAD & SET AVATAR ----------------------
export async function uploadProfilePictureAndUpdateRecord(
  profileId: string,
  fileUri: string
): Promise<string> {
  if (!profileId) throw new Error('Missing profileId');
  if (!fileUri) throw new Error('Missing fileUri');

  // Convert local URI to blob
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const ext = extractFileExtension(fileUri);
  const contentType = mimeFromExtension(ext);
  const objectPath = `${profileId}/avatar`;
  console.log('Uploading avatar to:', objectPath);

  // Upload the new file and overwrite old one
  const { error: uploadError } = await supabase.storage
    .from(PROFILE_PICTURE_BUCKET)
    .upload(objectPath, blob, {
      contentType,
      cacheControl: PROFILE_PICTURE_CACHE_CONTROL,
      upsert: true, // ensures overwrite
    });

  if (uploadError) throw uploadError;

  // Get public URL and append timestamp to bust cache
  const { data: publicUrlData } = supabase.storage
    .from(PROFILE_PICTURE_BUCKET)
    .getPublicUrl(objectPath);

  if (!publicUrlData?.publicUrl)
    throw new Error('Failed to retrieve uploaded image URL');

  const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

  // Update the profile table with new URL
  const { error: updateError } = await supabase
    .from('user_profiles_test')
    .update({ profile_picture_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', profileId);

  if (updateError) throw updateError;

  console.log('Updated profile with new avatar URL:', publicUrl);
  return publicUrl;
}
