import { supabase } from "@/lib/supabase";
import type { User } from "@/types";

// Get current logged-in user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) return null;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

// Get all users for suggestions/following
export async function getUsers(limit = 50): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .limit(limit);

    if (error) throw error;
    return data as User[];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}
