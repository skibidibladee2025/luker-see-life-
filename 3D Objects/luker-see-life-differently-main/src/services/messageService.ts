import { supabase } from "@/lib/supabase";
import type { Conversation, Message } from "@/types";

// Get user's conversations
export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        id,
        userId,
        lastMessage,
        timestamp,
        unread,
        messages
      `)
      .eq("currentUserId", userId)
      .order("timestamp", { ascending: false });

    if (error) throw error;
    
    // Fetch user data for each conversation
    const conversationsWithUsers = await Promise.all(
      (data as any[]).map(async (convo) => {
        const user = await supabase
          .from("users")
          .select("id, username, displayName, avatar, online")
          .eq("id", convo.userId)
          .single();
        
        return {
          ...convo,
          user: user.data,
        } as Conversation;
      })
    );

    return conversationsWithUsers;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

// Get a specific conversation
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        id,
        userId,
        lastMessage,
        timestamp,
        unread,
        messages
      `)
      .eq("id", conversationId)
      .single();

    if (error) throw error;
    
    // Fetch user data
    const user = await supabase
      .from("users")
      .select("id, username, displayName, avatar, online")
      .eq("id", data.userId)
      .single();
    
    return {
      ...data,
      user: user.data,
    } as Conversation;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return null;
  }
}

// Get messages for a conversation
export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("id,senderId,text,timestamp")
      .eq("conversationId", conversationId)
      .order("timestamp", { ascending: true })
      .limit(100);

    if (error) throw error;
    return data as Message[];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<Message | null> {
  try {
    const now = new Date();
    const timestamp = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversationId,
        senderId,
        text,
        timestamp,
        createdAt: now.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation's last message
    await updateConversationLastMessage(conversationId, text, timestamp);

    return data as Message;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}

// Update conversation's last message
async function updateConversationLastMessage(
  conversationId: string,
  lastMessage: string,
  timestamp: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("conversations")
      .update({
        lastMessage,
        timestamp,
      })
      .eq("id", conversationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating conversation:", error);
  }
}

// Mark conversation as read
export async function markConversationAsRead(conversationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("conversations")
      .update({ unread: 0 })
      .eq("id", conversationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error marking conversation as read:", error);
  }
}

// Create a new conversation
export async function createConversation(
  currentUserId: string,
  otherUserId: string,
  initialMessage: string
): Promise<Conversation | null> {
  try {
    const now = new Date().toISOString();
    const timestamp = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        currentUserId,
        userId: otherUserId,
        lastMessage: initialMessage,
        timestamp,
        unread: 0,
      })
      .select(`
        id,
        userId,
        lastMessage,
        timestamp,
        unread,
        messages
      `)
      .single();

    if (error) throw error;
    
    // Fetch user data
    const user = await supabase
      .from("users")
      .select("id, username, displayName, avatar, online")
      .eq("id", otherUserId)
      .single();
    
    return {
      ...data,
      user: user.data,
    } as Conversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
}
