import { supabase } from "@/lib/supabase";
import type { Post } from "@/types";

// Get feed posts
export async function getFeedPosts(limit = 20): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        userId,
        image,
        caption,
        likes,
        comments,
        createdAt,
        liked
      `)
      .order("createdAt", { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Fetch user data for each post
    const postsWithUsers = await Promise.all(
      (data as any[]).map(async (post) => {
        const user = await supabase
          .from("users")
          .select("id, username, displayName, avatar")
          .eq("id", post.userId)
          .single();
        
        return {
          ...post,
          user: user.data,
          timestamp: getTimeAgo(post.createdAt),
        } as Post;
      })
    );

    return postsWithUsers;
  } catch (error) {
    console.error("Error fetching feed posts:", error);
    return [];
  }
}

// Get user's posts
export async function getUserPosts(userId: string): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        userId,
        image,
        caption,
        likes,
        comments,
        createdAt,
        liked
      `)
      .eq("userId", userId)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    
    // Fetch user once and reuse for all posts
    const user = await supabase
      .from("users")
      .select("id, username, displayName, avatar")
      .eq("id", userId)
      .single();
    
    return (data as any[]).map(post => ({
      ...post,
      user: user.data,
      timestamp: getTimeAgo(post.createdAt),
    })) as Post[];
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }
}

// Create a new post
export async function createPost(
  userId: string,
  image: string,
  caption: string
): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        userId,
        image,
        caption,
        likes: 0,
        comments: [],
        createdAt: new Date().toISOString(),
        liked: false,
      })
      .select(`
        id,
        userId,
        image,
        caption,
        likes,
        comments,
        createdAt,
        liked
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
      timestamp: getTimeAgo(data.createdAt),
    } as Post;
  } catch (error) {
    console.error("Error creating post:", error);
    return null;
  }
}

// Toggle like on post
export async function togglePostLike(postId: string, currentLikes: number, isLiked: boolean): Promise<Post | null> {
  try {
    const newLikesCount = isLiked ? currentLikes - 1 : currentLikes + 1;
    
    const { data, error } = await supabase
      .from("posts")
      .update({
        likes: newLikesCount,
        liked: !isLiked,
      })
      .eq("id", postId)
      .select(`
        id,
        userId,
        image,
        caption,
        likes,
        comments,
        createdAt,
        liked
      `)
      .single();

    if (error) throw error;
    
    // Fetch user data
    const user = await supabase
      .from("users")
      .select("id, username, displayName, avatar")
      .eq("id", data.userId)
      .single();
    
    return {
      ...data,
      user: user.data,
      timestamp: getTimeAgo(data.createdAt),
    } as Post;
  } catch (error) {
    console.error("Error toggling like:", error);
    return null;
  }
}

// Helper function to format time
function getTimeAgo(createdAt: string): string {
  const now = new Date();
  const postTime = new Date(createdAt);
  const diffInSeconds = Math.floor((now.getTime() - postTime.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return postTime.toLocaleDateString();
}
