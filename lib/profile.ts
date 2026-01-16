import { createClient } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get user profile
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Create or update user profile
 */
export async function upsertProfile(
  userId: string,
  updates: { username?: string; avatar_url?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Validate username if provided
  if (updates.username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(updates.username)) {
      return {
        success: false,
        error: "Username must be 3-20 characters, letters, numbers, and underscores only",
      };
    }

    // Check if username is taken
    const { data: existing } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("username", updates.username)
      .neq("user_id", userId)
      .single();

    if (existing) {
      return { success: false, error: "Username is already taken" };
    }
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    }
  );

  if (error) {
    console.error("Profile update error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  const supabase = createClient();

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" };
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { error: "Image must be less than 2MB" };
  }

  // Generate unique filename
  const ext = file.name.split(".").pop();
  const filename = `${userId}-${Date.now()}.${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("Avatar upload error:", uploadError);
    return { error: "Failed to upload image" };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filename);

  return { url: urlData.publicUrl };
}

/**
 * Delete old avatar
 */
export async function deleteAvatar(avatarUrl: string): Promise<void> {
  const supabase = createClient();

  // Extract filename from URL
  const parts = avatarUrl.split("/");
  const filename = parts[parts.length - 1];

  if (filename) {
    await supabase.storage.from("avatars").remove([filename]);
  }
}
