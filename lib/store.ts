"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Post, Comment, Follow, Notification, Conversation } from "./types"
import { mockUsers, mockPosts, mockComments, mockFollows, mockNotifications, mockConversations } from "./mock-data"

interface AppState {
  // Current user
  currentUser: User | null
  setCurrentUser: (user: User | null) => void

  // Posts
  posts: Post[]
  likePost: (postId: string) => void
  savePost: (postId: string) => void
  addPost: (post: Omit<Post, "id" | "createdAt" | "likesCount" | "commentsCount" | "isLiked" | "isSaved">) => void

  // Comments
  comments: Comment[]
  addComment: (comment: Omit<Comment, "id" | "createdAt" | "likesCount" | "isLiked">) => void
  likeComment: (commentId: string) => void

  // Follows
  follows: Follow[]
  followUser: (followingId: string) => void
  unfollowUser: (followingId: string) => void
  acceptFollowRequest: (followId: string) => void
  rejectFollowRequest: (followId: string) => void

  // Notifications
  notifications: Notification[]
  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void

  // Conversations
  conversations: Conversation[]
  markConversationAsRead: (conversationId: string) => void

  // UI State
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: mockUsers[0], // Default to first user for demo
      posts: mockPosts,
      comments: mockComments,
      follows: mockFollows,
      notifications: mockNotifications,
      conversations: mockConversations,
      activeTab: "home",

      // Actions
      setCurrentUser: (user) => set({ currentUser: user }),

      likePost: (postId) =>
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: !post.isLiked,
                  likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
                }
              : post,
          ),
        })),

      savePost: (postId) =>
        set((state) => ({
          posts: state.posts.map((post) => (post.id === postId ? { ...post, isSaved: !post.isSaved } : post)),
        })),

      addPost: (newPost) =>
        set((state) => {
          const post: Post = {
            ...newPost,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            likesCount: 0,
            commentsCount: 0,
            isLiked: false,
            isSaved: false,
          }
          return { posts: [post, ...state.posts] }
        }),

      addComment: (newComment) =>
        set((state) => {
          const comment: Comment = {
            ...newComment,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            likesCount: 0,
            isLiked: false,
          }

          // Update post comments count
          const updatedPosts = state.posts.map((post) =>
            post.id === newComment.postId ? { ...post, commentsCount: post.commentsCount + 1 } : post,
          )

          return {
            comments: [...state.comments, comment],
            posts: updatedPosts,
          }
        }),

      likeComment: (commentId) =>
        set((state) => ({
          comments: state.comments.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likesCount: comment.isLiked ? comment.likesCount - 1 : comment.likesCount + 1,
                }
              : comment,
          ),
        })),

      followUser: (followingId) =>
        set((state) => {
          const currentUser = state.currentUser
          if (!currentUser) return state

          const targetUser = mockUsers.find((u) => u.id === followingId)
          if (!targetUser) return state

          const newFollow: Follow = {
            id: Date.now().toString(),
            followerId: currentUser.id,
            followingId,
            status: targetUser.isPrivate ? "pending" : "accepted",
            createdAt: new Date().toISOString(),
          }

          return { follows: [...state.follows, newFollow] }
        }),

      unfollowUser: (followingId) =>
        set((state) => {
          const currentUser = state.currentUser
          if (!currentUser) return state

          return {
            follows: state.follows.filter(
              (follow) => !(follow.followerId === currentUser.id && follow.followingId === followingId),
            ),
          }
        }),

      acceptFollowRequest: (followId) =>
        set((state) => ({
          follows: state.follows.map((follow) =>
            follow.id === followId ? { ...follow, status: "accepted" as const } : follow,
          ),
        })),

      rejectFollowRequest: (followId) =>
        set((state) => ({
          follows: state.follows.filter((follow) => follow.id !== followId),
        })),

      markNotificationAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === notificationId ? { ...notification, isRead: true } : notification,
          ),
        })),

      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            isRead: true,
          })),
        })),

      addNotification: (newNotification) =>
        set((state) => {
          const notification: Notification = {
            ...newNotification,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          }
          return { notifications: [notification, ...state.notifications] }
        }),

      markConversationAsRead: (conversationId) =>
        set((state) => ({
          conversations: state.conversations.map((conversation) =>
            conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
          ),
        })),

      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "arabic-tourism-social-storage",
      partialize: (state) => ({
        currentUser: state.currentUser,
        posts: state.posts,
        comments: state.comments,
        follows: state.follows,
        notifications: state.notifications,
        conversations: state.conversations,
      }),
    },
  ),
)
