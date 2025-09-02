import { create } from 'zustand';
import { User } from '../types';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: Date;
  fromUser?: User;
  toUser?: User;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  user: User;
  friend: User;
  friendshipDate: Date;
  lastInteraction?: Date;
}

interface FriendsState {
  friends: Friend[];
  friendRequests: FriendRequest[];
  isLoading: boolean;
  error: string | null;
}

interface FriendsActions {
  // Friend management
  addFriend: (friendId: string) => void;
  removeFriend: (friendId: string) => void;
  getFriends: () => Friend[];
  getFriendById: (friendId: string) => Friend | undefined;
  
  // Friend requests
  sendFriendRequest: (toUserId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  getPendingRequests: () => FriendRequest[];
  
  // Data loading
  loadFriends: () => Promise<void>;
  loadFriendRequests: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type FriendsStore = FriendsState & FriendsActions;

export const useFriendsStore = create<FriendsStore>((set, get) => ({
  friends: [],
  friendRequests: [],
  isLoading: false,
  error: null,

  addFriend: (friendId) => {
    // This would typically make an API call
    // For now, we'll just update the local state
    set((state) => ({
      friends: [...state.friends],
    }));
  },

  removeFriend: (friendId) => {
    set((state) => ({
      friends: state.friends.filter(friend => friend.friendId !== friendId),
    }));
  },

  getFriends: () => {
    const { friends } = get();
    return friends;
  },

  getFriendById: (friendId) => {
    const { friends } = get();
    return friends.find(friend => friend.friendId === friendId);
  },

  sendFriendRequest: (toUserId) => {
    const newRequest: FriendRequest = {
      id: Date.now().toString(),
      fromUserId: 'currentUser', // In real app, this would be the current user's ID
      toUserId,
      status: 'PENDING',
      createdAt: new Date(),
    };

    set((state) => ({
      friendRequests: [newRequest, ...state.friendRequests],
    }));
  },

  acceptFriendRequest: (requestId) => {
    set((state) => {
      const request = state.friendRequests.find(req => req.id === requestId);
      if (!request) return state;

      // Remove the request
      const updatedRequests = state.friendRequests.filter(req => req.id !== requestId);
      
      // Add to friends list (mock data for now)
      const newFriend: Friend = {
        id: Date.now().toString(),
        userId: 'currentUser',
        friendId: request.fromUserId,
        user: {
          id: 'currentUser',
          email: 'current@user.com',
          firstName: 'Current',
          lastName: 'User',
          isOnline: true,
          createdAt: new Date(),
        } as User,
        friend: {
          id: request.fromUserId,
          email: 'friend@example.com',
          firstName: 'Friend',
          lastName: 'User',
          isOnline: false,
          createdAt: new Date(),
        } as User,
        friendshipDate: new Date(),
      };

      return {
        friendRequests: updatedRequests,
        friends: [newFriend, ...state.friends],
      };
    });
  },

  declineFriendRequest: (requestId) => {
    set((state) => ({
      friendRequests: state.friendRequests.filter(req => req.id !== requestId),
    }));
  },

  getPendingRequests: () => {
    const { friendRequests } = get();
    return friendRequests.filter(request => request.status === 'PENDING');
  },

  loadFriends: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real app this would come from API
      const mockFriends: Friend[] = [
        {
          id: '1',
          userId: 'currentUser',
          friendId: 'friend1',
          user: {
            id: 'currentUser',
            email: 'current@user.com',
            firstName: 'Current',
            lastName: 'User',
            isOnline: true,
            createdAt: new Date(),
          } as User,
          friend: {
            id: 'friend1',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe',
            city: 'New York',
            skillLevel: 'INTERMEDIATE',
            isOnline: true,
            lastOnlineTime: new Date(),
            createdAt: new Date(),
          } as User,
          friendshipDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: '2',
          userId: 'currentUser',
          friendId: 'friend2',
          user: {
            id: 'currentUser',
            email: 'current@user.com',
            firstName: 'Current',
            lastName: 'User',
            isOnline: true,
            createdAt: new Date(),
          } as User,
          friend: {
            id: 'friend2',
            email: 'sarah@example.com',
            firstName: 'Sarah',
            lastName: 'Wilson',
            city: 'Los Angeles',
            skillLevel: 'ADVANCED',
            isOnline: false,
            lastOnlineTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
          } as User,
          friendshipDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          lastInteraction: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: '3',
          userId: 'currentUser',
          friendId: 'friend3',
          user: {
            id: 'currentUser',
            email: 'current@user.com',
            firstName: 'Current',
            lastName: 'User',
            isOnline: true,
            createdAt: new Date(),
          } as User,
          friend: {
            id: 'friend3',
            email: 'mike@example.com',
            firstName: 'Mike',
            lastName: 'Johnson',
            city: 'Chicago',
            skillLevel: 'BEGINNER',
            isOnline: true,
            lastOnlineTime: new Date(),
            createdAt: new Date(),
          } as User,
          friendshipDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastInteraction: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: '4',
          userId: 'currentUser',
          friendId: 'friend4',
          user: {
            id: 'currentUser',
            email: 'current@user.com',
            firstName: 'Current',
            lastName: 'User',
            isOnline: true,
            createdAt: new Date(),
          } as User,
          friend: {
            id: 'friend4',
            email: '3',
            firstName: 'Andrew',
            lastName: 'Smith',
            city: 'New York',
            skillLevel: 'INTERMEDIATE',
            isOnline: true,
            lastOnlineTime: new Date(),
            createdAt: new Date(),
          } as User,
          friendshipDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          lastInteraction: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      ];
      
      set({ friends: mockFriends, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load friends', 
        isLoading: false 
      });
    }
  },

  loadFriendRequests: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data - in real app this would come from API
      const mockRequests: FriendRequest[] = [
        {
          id: '1',
          fromUserId: 'request1',
          toUserId: 'currentUser',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          fromUser: {
            id: 'request1',
            email: 'alex@example.com',
            firstName: 'Alex',
            lastName: 'Thompson',
            city: 'Miami',
            skillLevel: 'INTERMEDIATE',
            isOnline: false,
            lastOnlineTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
          } as User,
          toUser: {
            id: 'currentUser',
            email: 'current@user.com',
            firstName: 'Current',
            lastName: 'User',
            isOnline: true,
            createdAt: new Date(),
          } as User,
        },
        {
          id: '2',
          fromUserId: 'request2',
          toUserId: 'currentUser',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          fromUser: {
            id: 'request2',
            email: 'emma@example.com',
            firstName: 'Emma',
            lastName: 'Davis',
            city: 'Seattle',
            skillLevel: 'ADVANCED',
            isOnline: true,
            lastOnlineTime: new Date(),
            createdAt: new Date(),
          } as User,
          toUser: {
            id: 'currentUser',
            email: 'current@user.com',
            firstName: 'Current',
            lastName: 'User',
            isOnline: true,
            createdAt: new Date(),
          } as User,
        },
      ];
      
      set({ friendRequests: mockRequests, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load friend requests', 
        isLoading: false 
      });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
