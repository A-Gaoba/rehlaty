export interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  bio: string
  coverPhoto: string
  isPrivate: boolean
  followersCount: number
  followingCount: number
  postsCount: number
  isVerified: boolean
  joinedAt: string
  interests: string[]
}

export interface Post {
  id: string
  userId: string
  user: User
  caption: string
  image: string
  location: {
    name: string
    city: string
    coordinates: [number, number]
  }
  rating: number
  likesCount: number
  commentsCount: number
  isLiked: boolean
  isSaved: boolean
  createdAt: string
  hashtags: string[]
}

export interface Comment {
  id: string
  postId: string
  userId: string
  user: User
  content: string
  likesCount: number
  isLiked: boolean
  createdAt: string
  replies?: Comment[]
  parentId?: string
}

export interface Follow {
  id: string
  followerId: string
  followingId: string
  status: "accepted" | "pending"
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: "text" | "image"
  isRead: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  participants: User[]
  lastMessage: Message
  unreadCount: number
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: "like" | "comment" | "follow" | "follow_request" | "message"
  fromUser: User
  post?: Post
  message: string
  isRead: boolean
  createdAt: string
}

export interface City {
  id: string
  name: string
  nameAr: string
  image: string
  postsCount: number
  averageRating: number
  coordinates: [number, number]
}
