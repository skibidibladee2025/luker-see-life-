export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  banner?: string;
  bio?: string;
  posts?: number;
  followers?: number;
  following?: number;
  online?: boolean;
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  images: string[];
  viewed: boolean;
  createdAt?: string;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  image: string;
  caption: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  liked: boolean;
}

export interface Comment {
  user: User;
  text: string;
}

export interface Conversation {
  id: string;
  userId: string;
  user: User;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}
