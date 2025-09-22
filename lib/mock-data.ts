import type {
  User,
  Post,
  Comment,
  Follow,
  Message,
  Conversation,
  Notification,
  City,
} from './types'

// Mock Users - Arabic names and tourism interests
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'abod',
    displayName: 'أبود',
    avatar: '/placeholder-user.jpg',
    bio: 'هذا حساب تجريبي',
    coverPhoto: '/placeholder.jpg',
    isPrivate: false,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    isVerified: false,
    joinedAt: '2023-01-15',
    interests: ['سياحة'],
  },
  {
    id: '2',
    username: 'fatima_explorer',
    displayName: 'فاطمة المستكشفة',
    avatar: '/arabic-woman-hijab-profile.jpg',
    bio: 'أحب اكتشاف الثقافة الروسية والأماكن التاريخية 📸',
    coverPhoto: '/hermitage-museum.png',
    isPrivate: false,
    followersCount: 2100,
    followingCount: 650,
    postsCount: 78,
    isVerified: true,
    joinedAt: '2022-11-20',
    interests: ['متاحف', 'فن', 'ثقافة', 'تاريخ'],
  },
  {
    id: '3',
    username: 'omar_foodie',
    displayName: 'عمر الطعام',
    avatar: '/arabic-man-chef-profile.jpg',
    bio: 'خبير في الطعام الروسي والحلال 🍽️ | دليلك للمطاعم الحلال',
    coverPhoto: '/russian-food-borscht.jpg',
    isPrivate: false,
    followersCount: 3200,
    followingCount: 420,
    postsCount: 156,
    isVerified: true,
    joinedAt: '2022-08-10',
    interests: ['طعام', 'مطاعم', 'حلال', 'طبخ'],
  },
  {
    id: '4',
    username: 'layla_photographer',
    displayName: 'ليلى المصورة',
    avatar: '/arabic-woman-photographer-profile.jpg',
    bio: 'مصورة محترفة | أوثق جمال روسيا بعدستي 📷',
    coverPhoto: '/winter-palace-snow.jpg',
    isPrivate: false,
    followersCount: 5600,
    followingCount: 890,
    postsCount: 234,
    isVerified: true,
    joinedAt: '2021-12-05',
    interests: ['تصوير', 'طبيعة', 'معمار', 'فن'],
  },
  {
    id: '5',
    username: 'hassan_adventure',
    displayName: 'حسن المغامر',
    avatar: '/arabic-man-adventure-profile.jpg',
    bio: 'مغامر ومتسلق جبال | سيبيريا والقوقاز 🏔️',
    coverPhoto: '/siberian-mountains.jpg',
    isPrivate: false,
    followersCount: 1800,
    followingCount: 1200,
    postsCount: 89,
    isVerified: false,
    joinedAt: '2023-03-22',
    interests: ['مغامرات', 'جبال', 'طبيعة', 'رياضة'],
  },
  {
    id: '6',
    username: 'sara_culture',
    displayName: 'سارة الثقافة',
    avatar: '/arabic-woman-cultural-profile.jpg',
    bio: 'باحثة في الثقافة الروسية | أحب الباليه والأوبرا 🎭',
    coverPhoto: '/bolshoi-theatre.jpg',
    isPrivate: true,
    followersCount: 980,
    followingCount: 340,
    postsCount: 67,
    isVerified: false,
    joinedAt: '2023-05-18',
    interests: ['ثقافة', 'باليه', 'موسيقى', 'مسرح'],
  },
  {
    id: '7',
    username: 'khalid_business',
    displayName: 'خالد الأعمال',
    avatar: '/arabic-businessman-profile.jpg',
    bio: 'رجل أعمال | أسافر لروسيا للعمل والسياحة 💼',
    coverPhoto: '/moscow-city-business.jpg',
    isPrivate: false,
    followersCount: 2800,
    followingCount: 560,
    postsCount: 123,
    isVerified: true,
    joinedAt: '2022-06-30',
    interests: ['أعمال', 'فنادق', 'مؤتمرات', 'شبكات'],
  },
  {
    id: '8',
    username: 'nour_student',
    displayName: 'نور الطالبة',
    avatar: '/arabic-student-woman-profile.jpg',
    bio: 'طالبة طب في موسكو | أشارككم تجربتي الدراسية 📚',
    coverPhoto: '/moscow-university.jpg',
    isPrivate: false,
    followersCount: 1450,
    followingCount: 780,
    postsCount: 92,
    isVerified: false,
    joinedAt: '2023-09-01',
    interests: ['دراسة', 'طب', 'جامعة', 'طلاب'],
  },
]

// Mock Cities in Russia
export const mockCities: City[] = [
  {
    id: '1',
    name: 'Moscow',
    nameAr: 'موسكو',
    image: '/placeholder.svg?height=200&width=300',
    postsCount: 1250,
    averageRating: 4.7,
    coordinates: [55.7558, 37.6176],
  },
  {
    id: '2',
    name: 'Saint Petersburg',
    nameAr: 'سانت بطرسبرغ',
    image: '/placeholder.svg?height=200&width=300',
    postsCount: 890,
    averageRating: 4.8,
    coordinates: [59.9311, 30.3609],
  },
  {
    id: '3',
    name: 'Sochi',
    nameAr: 'سوتشي',
    image: '/placeholder.svg?height=200&width=300',
    postsCount: 456,
    averageRating: 4.5,
    coordinates: [43.6028, 39.7342],
  },
  {
    id: '4',
    name: 'Kazan',
    nameAr: 'قازان',
    image: '/placeholder.svg?height=200&width=300',
    postsCount: 234,
    averageRating: 4.6,
    coordinates: [55.8304, 49.0661],
  },
]

// Mock Posts with Russian tourism locations
export const mockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    user: mockUsers[0],
    caption:
      'زيارة مذهلة للكرملين في موسكو! المكان يحكي تاريخ روسيا العريق 🏰 #موسكو #كرملين #سياحة',
    image: '/placeholder.svg?height=400&width=400',
    location: {
      name: 'الكرملين',
      city: 'موسكو',
      coordinates: [55.752, 37.6175],
    },
    rating: 5,
    likesCount: 234,
    commentsCount: 45,
    isLiked: false,
    isSaved: true,
    createdAt: '2024-01-15T10:30:00Z',
    hashtags: ['موسكو', 'كرملين', 'سياحة', 'تاريخ'],
  },
  {
    id: '2',
    userId: '2',
    user: mockUsers[1],
    caption:
      'متحف الهيرميتاج في سانت بطرسبرغ - كنز من الفن والثقافة! قضيت يوماً كاملاً هنا ولم أشبع 🎨',
    image: '/placeholder.svg?height=400&width=400',
    location: {
      name: 'متحف الهيرميتاج',
      city: 'سانت بطرسبرغ',
      coordinates: [59.9398, 30.3146],
    },
    rating: 5,
    likesCount: 456,
    commentsCount: 78,
    isLiked: true,
    isSaved: false,
    createdAt: '2024-01-14T14:20:00Z',
    hashtags: ['سانت_بطرسبرغ', 'هيرميتاج', 'فن', 'متاحف'],
  },
  {
    id: '3',
    userId: '3',
    user: mockUsers[2],
    caption: 'أفضل مطعم حلال في موسكو! البورش الروسي هنا لذيذ جداً والخدمة ممتازة 🍲',
    image: '/placeholder.svg?height=400&width=400',
    location: {
      name: 'مطعم القوقاز',
      city: 'موسكو',
      coordinates: [55.7558, 37.6176],
    },
    rating: 4,
    likesCount: 189,
    commentsCount: 32,
    isLiked: false,
    isSaved: true,
    createdAt: '2024-01-13T19:45:00Z',
    hashtags: ['طعام', 'حلال', 'مطعم', 'بورش'],
  },
  {
    id: '4',
    userId: '4',
    user: mockUsers[3],
    caption: 'شروق الشمس على نهر نيفا في سانت بطرسبرغ - منظر لا يُنسى! 🌅',
    image: '/placeholder.svg?height=400&width=400',
    location: {
      name: 'نهر نيفا',
      city: 'سانت بطرسبرغ',
      coordinates: [59.9311, 30.3609],
    },
    rating: 5,
    likesCount: 678,
    commentsCount: 89,
    isLiked: true,
    isSaved: true,
    createdAt: '2024-01-12T06:15:00Z',
    hashtags: ['تصوير', 'شروق', 'نيفا', 'طبيعة'],
  },
  {
    id: '5',
    userId: '5',
    user: mockUsers[4],
    caption: 'مغامرة تسلق في جبال القوقاز قرب سوتشي! التحدي كان صعباً لكن المنظر يستحق 🏔️',
    image: '/placeholder.svg?height=400&width=400',
    location: {
      name: 'جبال القوقاز',
      city: 'سوتشي',
      coordinates: [43.6028, 39.7342],
    },
    rating: 5,
    likesCount: 345,
    commentsCount: 56,
    isLiked: false,
    isSaved: false,
    createdAt: '2024-01-11T16:30:00Z',
    hashtags: ['مغامرة', 'تسلق', 'قوقاز', 'طبيعة'],
  },
]

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: '1',
    postId: '1',
    userId: '2',
    user: mockUsers[1],
    content: 'مكان رائع! زرته العام الماضي وكان تجربة لا تُنسى',
    likesCount: 12,
    isLiked: false,
    createdAt: '2024-01-15T11:00:00Z',
  },
  {
    id: '2',
    postId: '1',
    userId: '3',
    user: mockUsers[2],
    content: 'هل تنصح بالجولة المرشدة أم الزيارة الحرة؟',
    likesCount: 5,
    isLiked: true,
    createdAt: '2024-01-15T11:15:00Z',
  },
  {
    id: '3',
    postId: '2',
    userId: '1',
    user: mockUsers[0],
    content: 'متحف مذهل! كم من الوقت احتجت لزيارته كاملاً؟',
    likesCount: 8,
    isLiked: false,
    createdAt: '2024-01-14T15:00:00Z',
  },
]

// Mock Follow relationships
export const mockFollows: Follow[] = [
  {
    id: '1',
    followerId: '1',
    followingId: '2',
    status: 'accepted',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    followerId: '1',
    followingId: '3',
    status: 'accepted',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    followerId: '2',
    followingId: '1',
    status: 'accepted',
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    followerId: '2',
    followingId: '4',
    status: 'accepted',
    createdAt: '2024-01-04T00:00:00Z',
  },
  {
    id: '5',
    followerId: '3',
    followingId: '1',
    status: 'pending',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: '6',
    followerId: '4',
    followingId: '6',
    status: 'pending',
    createdAt: '2024-01-06T00:00:00Z',
  },
]

// Mock Messages and Conversations
export const mockMessages: Message[] = [
  {
    id: '1',
    conversationId: '1',
    senderId: '1',
    content: 'مرحباً! شاهدت منشورك عن الكرملين، هل يمكنك إعطائي نصائح للزيارة؟',
    type: 'text',
    isRead: true,
    createdAt: '2024-01-15T12:00:00Z',
  },
  {
    id: '2',
    conversationId: '1',
    senderId: '2',
    content: 'أهلاً وسهلاً! بالطبع، أنصحك بحجز التذاكر مسبقاً والذهاب صباحاً',
    type: 'text',
    isRead: true,
    createdAt: '2024-01-15T12:05:00Z',
  },
  {
    id: '3',
    conversationId: '1',
    senderId: '1',
    content: 'شكراً جزيلاً! وما رأيك في الجولة المرشدة؟',
    type: 'text',
    isRead: false,
    createdAt: '2024-01-15T12:10:00Z',
  },
]

export const mockConversations: Conversation[] = [
  {
    id: '1',
    participants: [mockUsers[0], mockUsers[1]],
    lastMessage: mockMessages[2],
    unreadCount: 1,
    updatedAt: '2024-01-15T12:10:00Z',
  },
  {
    id: '2',
    participants: [mockUsers[0], mockUsers[2]],
    lastMessage: {
      id: '4',
      conversationId: '2',
      senderId: '3',
      content: 'هل جربت المطعم الجديد في الحي الأحمر؟',
      type: 'text',
      isRead: true,
      createdAt: '2024-01-14T18:30:00Z',
    },
    unreadCount: 0,
    updatedAt: '2024-01-14T18:30:00Z',
  },
]

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'like',
    fromUser: mockUsers[1],
    post: mockPosts[0],
    message: 'أعجبت بمنشورك',
    isRead: false,
    createdAt: '2024-01-15T13:00:00Z',
  },
  {
    id: '2',
    userId: '1',
    type: 'comment',
    fromUser: mockUsers[2],
    post: mockPosts[0],
    message: 'علقت على منشورك',
    isRead: false,
    createdAt: '2024-01-15T11:15:00Z',
  },
  {
    id: '3',
    userId: '1',
    type: 'follow',
    fromUser: mockUsers[3],
    message: 'بدأت بمتابعتك',
    isRead: true,
    createdAt: '2024-01-14T16:20:00Z',
  },
  {
    id: '4',
    userId: '1',
    type: 'follow_request',
    fromUser: mockUsers[5],
    message: 'طلبت متابعتك',
    isRead: false,
    createdAt: '2024-01-13T14:45:00Z',
  },
]

// Helper functions for mock data manipulation
export const getMockUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id)
}

export const getMockPostsByUserId = (userId: string): Post[] => {
  return mockPosts.filter((post) => post.userId === userId)
}

export const getMockFollowersCount = (userId: string): number => {
  return mockFollows.filter(
    (follow) => follow.followingId === userId && follow.status === 'accepted',
  ).length
}

export const getMockFollowingCount = (userId: string): number => {
  return mockFollows.filter(
    (follow) => follow.followerId === userId && follow.status === 'accepted',
  ).length
}

export const isFollowing = (followerId: string, followingId: string): boolean => {
  return mockFollows.some(
    (follow) =>
      follow.followerId === followerId &&
      follow.followingId === followingId &&
      follow.status === 'accepted',
  )
}

export const hasPendingFollowRequest = (followerId: string, followingId: string): boolean => {
  return mockFollows.some(
    (follow) =>
      follow.followerId === followerId &&
      follow.followingId === followingId &&
      follow.status === 'pending',
  )
}

export const getMockCommentsForPost = (postId: string): Comment[] => {
  return mockComments.filter((comment) => comment.postId === postId)
}

export const getUnreadNotificationsCount = (userId: string): number => {
  return mockNotifications.filter(
    (notification) => notification.userId === userId && !notification.isRead,
  ).length
}

export const getTotalUnreadMessagesCount = (userId: string): number => {
  return mockConversations
    .filter((conversation) =>
      conversation.participants.some((participant) => participant.id === userId),
    )
    .reduce((total, conversation) => total + conversation.unreadCount, 0)
}
