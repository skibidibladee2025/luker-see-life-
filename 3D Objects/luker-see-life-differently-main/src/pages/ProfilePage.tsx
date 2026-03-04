import { motion } from "framer-motion";
import { ArrowLeft, Settings, Grid3X3, Bookmark, Heart, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentUser, getUserPosts } from "@/services/userService";
import { getUserGallery } from "@/services/galleryService";
import type { User, Post } from "@/types";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [profileGallery, setProfileGallery] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        if (user) {
          const [posts, gallery] = await Promise.all([
            getUserPosts(user.id),
            getUserGallery(user.id),
          ]);
          setUserPosts(posts);
          setProfileGallery(gallery);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const formatCount = (n?: number) => {
    if (!n) return "0";
    return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      ) : !currentUser ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">User not found</p>
        </div>
      ) : (
        <>
          {/* Banner */}
          <div className="relative h-52 sm:h-64">
            <img
              src={currentUser.banner}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <Link to="/feed" className="p-2 rounded-xl glass text-foreground">
                <ArrowLeft size={20} />
              </Link>
              <button className="p-2 rounded-xl glass text-foreground">
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
            <div className="flex flex-col items-center sm:flex-row sm:items-end gap-4">
              <motion.div
                className="story-ring"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="rounded-full p-1 bg-background">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.displayName}
                    className="w-28 h-28 rounded-full object-cover"
                  />
                </div>
              </motion.div>

              <div className="flex-1 text-center sm:text-left sm:pb-2">
                <h1 className="text-xl font-bold">{currentUser.displayName}</h1>
                <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
              </div>

              <div className="flex gap-2">
                <motion.button
                  className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Edit Profile
                </motion.button>
                <button className="p-2 rounded-xl bg-secondary text-foreground">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* Bio */}
            {currentUser.bio && (
              <p className="text-sm mt-4 text-center sm:text-left leading-relaxed">
                {currentUser.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-8 mt-5">
              {[
                { label: "Posts", value: currentUser.posts },
                { label: "Followers", value: currentUser.followers },
                { label: "Following", value: currentUser.following },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-lg font-bold">{formatCount(stat.value)}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border mt-6">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative ${
                  activeTab === "posts" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Grid3X3 size={16} />
                Posts
                {activeTab === "posts" && (
                  <motion.div className="absolute bottom-0 inset-x-0 h-0.5 gradient-primary" layoutId="profile-tab" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative ${
                  activeTab === "saved" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Bookmark size={16} />
                Saved
                {activeTab === "saved" && (
                  <motion.div className="absolute bottom-0 inset-x-0 h-0.5 gradient-primary" layoutId="profile-tab" />
                )}
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-3 gap-1 mt-1">
              {profileGallery.map((img, i) => (
                <motion.div
                  key={i}
                  className="aspect-square relative group cursor-pointer overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Heart size={24} className="text-foreground" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
