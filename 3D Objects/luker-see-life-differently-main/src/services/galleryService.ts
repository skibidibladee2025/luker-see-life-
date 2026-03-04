import { supabase } from "@/lib/supabase";

// Get user's profile gallery (saved posts/photos)
export async function getUserGallery(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("profileGallery")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data?.profileGallery || [];
  } catch (error) {
    console.error("Error fetching user gallery:", error);
    return [];
  }
}

// Add image to gallery
export async function addToGallery(userId: string, imageUrl: string): Promise<string[] | null> {
  try {
    const gallery = await getUserGallery(userId);
    const updatedGallery = [imageUrl, ...gallery];

    const { data, error } = await supabase
      .from("users")
      .update({ profileGallery: updatedGallery })
      .eq("id", userId)
      .select("profileGallery")
      .single();

    if (error) throw error;
    return data?.profileGallery || [];
  } catch (error) {
    console.error("Error adding to gallery:", error);
    return null;
  }
}

// Remove image from gallery
export async function removeFromGallery(userId: string, imageUrl: string): Promise<string[] | null> {
  try {
    const gallery = await getUserGallery(userId);
    const updatedGallery = gallery.filter(img => img !== imageUrl);

    const { data, error } = await supabase
      .from("users")
      .update({ profileGallery: updatedGallery })
      .eq("id", userId)
      .select("profileGallery")
      .single();

    if (error) throw error;
    return data?.profileGallery || [];
  } catch (error) {
    console.error("Error removing from gallery:", error);
    return null;
  }
}

// Upload image to Supabase Storage
export async function uploadImage(
  bucket: string,
  filePath: string,
  file: File
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

// Delete image from storage
export async function deleteImage(bucket: string, filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}
