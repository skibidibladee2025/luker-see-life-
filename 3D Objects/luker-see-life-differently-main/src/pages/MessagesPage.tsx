import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Smile, Phone, Video, MoreVertical, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrentUser, getUsers } from "@/services/userService";
import { getConversations, sendMessage as sendMessageApi, markConversationAsRead, getMessages } from "@/services/messageService";
import type { User, Conversation, Message } from "@/types";

const MessagesPage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        if (user) {
          const convos = await getConversations(user.id);
          setConversations(convos);
          // Auto-select first conversation
          if (convos.length > 0) {
            selectConvo(convos[0]);
          }
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConvo) {
      const loadMessages = async () => {
        const messages = await getMessages(activeConvo.id);
        setLocalMessages(messages);
        // Mark as read
        await markConversationAsRead(activeConvo.id);
      };
      loadMessages();
    }
  }, [activeConvo?.id]);

  const selectConvo = (convo: Conversation) => {
    setActiveConvo(convo);
    setShowChat(true);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !activeConvo || !currentUser) return;

    try {
      const message = await sendMessageApi(activeConvo.id, currentUser.id, messageText);
      if (message) {
        setLocalMessages((prev) => [...prev, message]);
      }
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Conversation List */}
      <div className={`w-full md:w-96 border-r border-border flex flex-col ${showChat ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Link to="/feed" className="text-xl font-bold gradient-text">Messages</Link>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search conversations"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading conversations...
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((convo) => (
              <motion.button
                key={convo.id}
                onClick={() => selectConvo(convo)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors ${
                  activeConvo?.id === convo.id ? "bg-secondary" : ""
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative flex-shrink-0">
                  <img src={convo.user.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  {convo.user.online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-online ring-2 ring-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate">{convo.user.displayName}</p>
                    <span className="text-[11px] text-muted-foreground flex-shrink-0">{convo.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                </div>
                {convo.unread > 0 && (
                  <span className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0">
                    {convo.unread}
                  </span>
                )}
              </motion.button>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No conversations yet.
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col ${showChat ? "flex" : "hidden md:flex"}`}>
        {activeConvo && currentUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border glass-strong">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowChat(false)}
                  className="md:hidden p-1 text-muted-foreground"
                >
                  <ArrowLeft size={20} />
                </button>
                <img src={activeConvo.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold">{activeConvo.user.displayName}</p>
                  <p className="text-[11px] text-online">
                    {activeConvo.user.online ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
                  <Phone size={18} />
                </button>
                <button className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
                  <Video size={18} />
                </button>
                <button className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {localMessages.map((msg, i) => {
                const isSender = msg.senderId === currentUser.id;
                return (
                  <motion.div
                    key={msg.id}
                    className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        isSender
                          ? "gradient-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                      <p className={`text-[10px] mt-1 ${isSender ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              {activeConvo.user.online && (
                <div className="flex justify-start">
                  <div className="bg-secondary px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot-1" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot-2" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot-3" />
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Smile size={22} />
                </button>
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                <motion.button
                  onClick={sendMessage}
                  className="p-2.5 rounded-xl gradient-primary text-primary-foreground"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
