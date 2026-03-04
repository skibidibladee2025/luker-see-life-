import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, MessageCircle, Home, Compass, PlusSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import StoryBar from "@/components/feed/StoryBar";
import PostCard from "@/components/feed/PostCard";
import StoriesViewer from "@/components/feed/StoriesViewer";
import SkeletonPost from "@/components/feed/SkeletonPost";
import { getCurrentUser } from "@/services/userService";
import { getStories } from "@/services/storyService";
import { getFeedPosts, togglePostLike } from "@/services/postService";
import type { User, Story, Post } from "@/types";

const FeedPage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<number | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [user, storiesData, postsData] = await Promise.all([
          getCurrentUser(),
          getStories(),
          getFeedPosts(),
        ]);
        setCurrentUser(user);
        setStories(storiesData);
        setFeedPosts(postsData);
      } catch (error) {
        console.error("Error loading feed data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleLike = async (postId: string) => {
    const post = feedPosts.find(p => p.id === postId);
    if (!post) return;

    const updatedPost = await togglePostLike(postId, post.likes, post.liked);
    if (updatedPost) {
      setFeedPosts((prev) =>
        prev.map((p) => (p.id === postId ? updatedPost : p))
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 glass-strong">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/feed" className="text-xl font-black gradient-text">
            Luker
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/feed" className="p-2.5 rounded-xl hover:bg-secondary transition-colors">
              <Home size={20} className="text-foreground" />
            </Link>
            <button className="p-2.5 rounded-xl hover:bg-secondary transition-colors relative">
              <Bell size={20} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full gradient-primary" />
            </button>
            <Link to="/messages" className="p-2.5 rounded-xl hover:bg-secondary transition-colors relative">
              <MessageCircle size={20} className="text-muted-foreground" />
              <span className="absolute -top-0 -right-0 w-4.5 h-4.5 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">3</span>
            </Link>
            <Link to="/profile" className="ml-1">
              {currentUser && (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-border"
                />
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {/* Story Bar */}
        <StoryBar stories={stories} onStoryClick={setActiveStory} />

        {/* Posts */}
        <div className="pb-20">
          {isLoading ? (
            <>
              <SkeletonPost />
              <SkeletonPost />
            </>
          ) : feedPosts.length > 0 ? (
            <AnimatePresence>
              {feedPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <PostCard post={post} onLike={toggleLike} />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Start following people to see their posts!</p>
            </div>
          )}
          {showSkeleton && <SkeletonPost />}
        </div>
      </div>

      {/* Bottom Nav (Mobile) */}
      <div className="fixed bottom-0 inset-x-0 z-40 glass-strong lg:hidden">
        <div className="flex items-center justify-around py-2">
          <Link to="/feed" className="p-3 text-foreground"><Home size={22} /></Link>
          <button className="p-3 text-muted-foreground"><Compass size={22} /></button>
          <button className="p-3 text-muted-foreground"><PlusSquare size={22} /></button>
          <Link to="/messages" className="p-3 text-muted-foreground"><MessageCircle size={22} /></Link>
          <Link to="/profile" className="p-3">
            {currentUser && (
              <img src={currentUser.avatar} alt="" className="w-7 h-7 rounded-full object-cover ring-2 ring-border" />
            )}
          </Link>
        </div>
      </div>

      {/* Stories Viewer */}
      <AnimatePresence>
        {activeStory !== null && (
          <StoriesViewer
            stories={stories}
            initialIndex={activeStory}
            onClose={() => setActiveStory(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedPage;
