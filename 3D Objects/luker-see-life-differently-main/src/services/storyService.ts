import { supabase } from "@/lib/supabase";
import type { Story } from "@/types";

// Get stories with user info
export async function getStories(): Promise<Story[]> {
  try {
    const { data, error } = await supabase
      .from("stories")
      .select(`
        id,
        userId,
        images,
        viewed,
        createdAt
      `)
      .order("createdAt", { ascending: false })
      .limit(20);

    if (error) throw error;
    
    // Fetch user data separately to avoid type issues
    const storiesWithUsers = await Promise.all(
      (data as any[]).map(async (story) => {
        const user = await supabase
          .from("users")
          .select("id, username, displayName, avatar")
          .eq("id", story.userId)
          .single();
        
        return {
          ...story,
          user: user.data,
        } as Story;
      })
    );

    return storiesWithUsers;
  } catch (error) {
    console.error("Error fetching stories:", error);
    return [];
  }
}

// Get stories for a specific user
export async function getUserStories(userId: string): Promise<Story[]> {
  try {
    const { data, error } = await supabase
      .from("stories")
      .select(`
        id,
        userId,
        images,
        viewed,
        createdAt
      `)
      .eq("userId", userId)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    
    // Fetch user data separately
    const storiesWithUsers = await Promise.all(
      (data as any[]).map(async (story) => {
        const user = await supabase
          .from("users")
          .select("id, username, displayName, avatar")
          .eq("id", story.userId)
          .single();
        
        return {
          ...story,
          user: user.data,
        } as Story;
      })
    );

    return storiesWithUsers;
  } catch (error) {
    console.error("Error fetching user stories:", error);
    return [];
  }
}

// Create a new story
export async function createStory(userId: string, images: string[]): Promise<Story | null> {
  try {
    const { data, error } = await supabase
      .from("stories")
      .insert({
        userId,
        images,
        viewed: false,
        createdAt: new Date().toISOString(),
      })
      .select(`
        id,
        userId,
        images,
        viewed,
        createdAt
      `)
      .single();

    if (error) throw error;
    
    // Fetch user data
    const user = await supabase
      .from("users")
      .select("id, username, displayName, avatar")
      .eq("id", userId)
      .single();
    
    return {
      ...data,
      user: user.data,
    } as Story;
  } catch (error) {
    console.error("Error creating story:", error);
    return null;
  }
}

// Mark story as viewed
export async function markStoryAsViewed(storyId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("stories")
      .update({ viewed: true })
      .eq("id", storyId);

    if (error) throw error;
  } catch (error) {
    console.error("Error marking story as viewed:", error);
  }
}
