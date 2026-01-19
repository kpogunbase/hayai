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
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Please upload a JPEG, PNG, GIF, or WebP image" };
  }

  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return { error: `Image is ${sizeMB}MB. Maximum size is 2MB.` };
  }

  // Validate dimensions (optional but helpful)
  try {
    const dimensions = await getImageDimensions(file);
    if (dimensions.width < 50 || dimensions.height < 50) {
      return { error: "Image is too small. Minimum size is 50x50 pixels." };
    }
    if (dimensions.width > 4096 || dimensions.height > 4096) {
      return { error: "Image is too large. Maximum size is 4096x4096 pixels." };
    }
  } catch {
    // If we can't read dimensions, continue with upload
    console.warn("Could not validate image dimensions");
  }

  // Generate unique filename with sanitized extension
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? ext : "jpg";
  const filename = `${userId}-${Date.now()}.${safeExt}`;

  try {
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);

      // Provide specific error messages
      if (uploadError.message?.includes("not configured") || uploadError.message?.includes("CONFIG_ERROR")) {
        return { error: "Avatar storage is not configured. Please contact support." };
      }
      if (uploadError.message?.includes("Bucket not found")) {
        return { error: "Avatar storage bucket not found. Please contact support." };
      }
      if (uploadError.message?.includes("exceeded") || uploadError.message?.includes("quota")) {
        return { error: "Storage quota exceeded. Please try a smaller image." };
      }
      if (uploadError.message?.includes("permission") || uploadError.message?.includes("policy")) {
        return { error: "Permission denied. Please sign in again." };
      }

      return { error: `Upload failed: ${uploadError.message || "Unknown error"}` };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filename);

    if (!urlData?.publicUrl) {
      return { error: "Failed to get image URL. Please try again." };
    }

    return { url: urlData.publicUrl };
  } catch (err) {
    console.error("Unexpected avatar upload error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Helper to get image dimensions
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
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
