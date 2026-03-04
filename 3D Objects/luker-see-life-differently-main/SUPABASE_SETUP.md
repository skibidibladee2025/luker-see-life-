# Supabase Setup Guide

This application has been migrated from mock data to Supabase for full database and storage capabilities. Follow these steps to set up your Supabase instance.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Create a new project
3. Copy your project URL and anon key into `.env.local`:
   - `VITE_SUPABASE_URL` - Your project URL
   - `VITE_SUPABASE_ANON_KEY` - Your anonymous public key

## 2. Create Database Tables

In your Supabase dashboard, go to the SQL Editor and run the following queries to create the needed tables:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  displayName TEXT NOT NULL,
  avatar TEXT,
  banner TEXT,
  bio TEXT,
  posts INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  online BOOLEAN DEFAULT false,
  profileGallery TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Stories Table
```sql
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  images TEXT[] NOT NULL,
  viewed BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stories_userId ON stories(userId);
```

### Posts Table
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image TEXT NOT NULL,
  caption TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  comments JSONB DEFAULT '[]',
  liked BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_userId ON posts(userId);
```

### Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currentUserId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lastMessage TEXT,
  timestamp TEXT,
  unread INTEGER DEFAULT 0,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_currentUserId ON conversations(currentUserId);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversationId UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  senderId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  timestamp TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversationId ON messages(conversationId);
```

## 3. Set Up Storage Buckets

In the Supabase dashboard, go to Storage and create these public buckets:

- `avatars` - For user profile pictures
- `posts` - For post images
- `stories` - For story images
- `banners` - For user banner images

Make these buckets public so images can be accessed directly via URL.

## 4. Environment Variables

Create a `.env.local` file in the root directory with:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never commit `.env.local` to version control!

## 5. Authentication (Optional)

To enable user authentication:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable desired authentication methods (Email, Google, GitHub, etc.)
3. Update the auth service file to handle sign up/sign in
4. Set up auth policies (Row Level Security) for your tables

## 6. Row Level Security (RLS)

For production, enable RLS policies on your tables. Example for users table:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles
CREATE POLICY "Users can read all profiles"
ON users FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

## 7. Start Your Development Server

```bash
npm run dev
```

## Files Structure

- `src/lib/supabase.ts` - Supabase client initialization
- `src/types/index.ts` - TypeScript types for data models
- `src/services/` - Service functions for each data type:
  - `userService.ts` - User operations
  - `storyService.ts` - Story operations
  - `postService.ts` - Post operations
  - `messageService.ts` - Message operations
  - `galleryService.ts` - Gallery and file uploads

## API Methods Available

### Users
- `getCurrentUser()` - Get the currently logged-in user
- `getUsers()` - Get all users
- `getUserById()` - Get user by ID
- `updateUserProfile()` - Update user profile

### Stories
- `getStories()` - Get all stories
- `getUserStories()` - Get stories for a specific user
- `createStory()` - Create new story
- `markStoryAsViewed()` - Mark story as viewed

### Posts
- `getFeedPosts()` - Get posts for feed
- `getUserPosts()` - Get user's posts
- `createPost()` - Create new post
- `togglePostLike()` - Like/unlike a post

### Messages
- `getConversations()` - Get user's conversations
- `getConversation()` - Get specific conversation
- `getMessages()` - Get messages for a conversation
- `sendMessage()` - Send a message
- `createConversation()` - Start new conversation
- `markConversationAsRead()` - Mark conversation as read

### Gallery
- `getUserGallery()` - Get user's profile gallery
- `addToGallery()` - Add image to gallery
- `removeFromGallery()` - Remove image from gallery
- `uploadImage()` - Upload image to storage
- `deleteImage()` - Delete image from storage

## Next Steps

1. Set up your Supabase project and copy the credentials
2. Create the database tables using the SQL provided above
3. Add your credentials to `.env.local`
4. Start developing!

For more information, visit [Supabase Documentation](https://supabase.com/docs)
