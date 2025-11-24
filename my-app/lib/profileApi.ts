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

  try {
    // For React Native, we need to handle the file differently
    const ext = extractFileExtension(fileUri);
    const contentType = mimeFromExtension(ext);
    const objectPath = `${profileId}/avatar.${ext}`;
    console.log('Uploading avatar to:', objectPath);

    // Convert the file URI to ArrayBuffer for React Native
    const response = await fetch(fileUri);
    const arrayBuffer = await response.arrayBuffer();

    // Convert ArrayBuffer to Uint8Array which Supabase accepts
    const fileData = new Uint8Array(arrayBuffer);

    // Upload the new file and overwrite old one
    const { error: uploadError } = await supabase.storage
      .from(PROFILE_PICTURE_BUCKET)
      .upload(objectPath, fileData, {
        contentType,
        cacheControl: PROFILE_PICTURE_CACHE_CONTROL,
        upsert: true, // ensures overwrite
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL and append timestamp to bust cache
    const { data: publicUrlData } = supabase.storage
      .from(PROFILE_PICTURE_BUCKET)
      .getPublicUrl(objectPath);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to retrieve uploaded image URL');
    }

    const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
    console.log('Generated public URL:', publicUrl);

    // Update the profile table with new URL
    const { error: updateError } = await supabase
      .from('user_profiles_test')
      .update({
        profile_picture_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    console.log('Successfully updated profile with new avatar URL');
    return publicUrl;
  } catch (error: any) {
    console.error('Profile picture upload error:', error);
    throw new Error(error.message || 'Failed to upload profile picture');
  }
}
