import { supabase } from "../lib/supabaseClient";

export async function checkUsernameAvailable(username: string): Promise<{
  available: boolean;
  message: string;
}> {
  const validRegex = /^[a-zA-Z0-9]+$/;

  if (!username) return { available: false, message: "" }; // empty input

  if (!validRegex.test(username)) {
    return { available: false, message: "Username can only contain letters and numbers" };
  }

  if (/\s/.test(username)) {
    return { available: false, message: "Username cannot contain spaces" };
  }

  const { data, error } = await supabase
    .from("user_profiles_test")
    .select("username")
    .ilike("username", username) // case-insensitive
    .limit(1);

  if (error) {
    console.error("Username check error:", error.message);
    return { available: false, message: "Error checking username" };
  }

  if (data?.length > 0) {
    return { available: false, message: "Username already exists" };
  }

  return { available: true, message: "Username is available" };
}