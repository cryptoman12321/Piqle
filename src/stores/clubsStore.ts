import { create } from 'zustand';

export interface ClubLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  courtCount: number;
  courtTypes: string[];
  amenities: string[];
  photos: string[];
}

export interface ClubMember {
  userId: string;
  userName: string;
  userPhoto?: string;
  role: 'OWNER' | 'ADMIN' | 'ORGANIZER' | 'MEMBER';
  joinedAt: Date;
  isVerified: boolean;
  lastActive: Date;
  memberSince: Date;
  totalEvents: number;
  totalGames: number;
}

export interface ClubEvent {
  id: string;
  title: string;
  description: string;
  type: 'TOURNAMENT' | 'OPEN_PLAY' | 'TRAINING' | 'SOCIAL' | 'COMPETITION';
  startDate: Date;
  endDate: Date;
  location: ClubLocation;
  maxParticipants: number;
  currentParticipants: number;
  participants: string[]; // User IDs
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logo?: string;
  coverPhoto?: string;
  location: ClubLocation;
  category: 'RECREATIONAL' | 'COMPETITIVE' | 'MIXED' | 'ELITE' | 'BEGINNER_FRIENDLY';
  skillLevels: string[];
  membershipType: 'FREE' | 'PAID' | 'INVITATION_ONLY' | 'APPLICATION_REQUIRED';
  membershipFee?: number;
  maxMembers: number;
  currentMembers: number;
  members: ClubMember[];
  events: ClubEvent[];
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  contactInfo: {
    email?: string;
    phone?: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  rules: string[];
  achievements: string[];
  stats: {
    totalGames: number;
    totalTournaments: number;
    totalEvents: number;
    averageRating: number;
    totalMembers: number;
  };
}

export interface ClubInvitation {
  id: string;
  clubId: string;
  clubName: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  role: 'MEMBER' | 'ORGANIZER' | 'ADMIN';
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  expiresAt: Date;
  createdAt: Date;
}

export interface ClubApplication {
  id: string;
  clubId: string;
  clubName: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  message: string;
  skillLevel: string;
  experience: string;
  availability: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface ClubsState {
  clubs: Club[];
  userClubs: Club[];
  clubInvitations: ClubInvitation[];
  clubApplications: ClubApplication[];
  selectedClub: Club | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  selectedLocation: string | null;
}

interface ClubsActions {
  // Club management
  createClub: (clubData: Omit<Club, 'id' | 'createdAt' | 'updatedAt' | 'members' | 'events' | 'stats'>) => string;
  updateClub: (clubId: string, updates: Partial<Club>) => void;
  deleteClub: (clubId: string) => void;
  setSelectedClub: (club: Club | null) => void;
  
  // Member management
  addMember: (clubId: string, memberData: Omit<ClubMember, 'joinedAt' | 'lastActive' | 'memberSince'>) => void;
  removeMember: (clubId: string, userId: string) => void;
  updateMemberRole: (clubId: string, userId: string, newRole: ClubMember['role']) => void;
  verifyMember: (clubId: string, userId: string) => void;
  
  // Event management
  createClubEvent: (clubId: string, eventData: Omit<ClubEvent, 'id' | 'createdAt'>) => void;
  updateClubEvent: (clubId: string, eventId: string, updates: Partial<ClubEvent>) => void;
  deleteClubEvent: (clubId: string, eventId: string) => void;
  joinClubEvent: (clubId: string, eventId: string, userId: string) => void;
  leaveClubEvent: (clubId: string, eventId: string, userId: string) => void;
  
  // Invitations and applications
  sendClubInvitation: (invitationData: Omit<ClubInvitation, 'id' | 'status' | 'createdAt'>) => void;
  respondToInvitation: (invitationId: string, response: 'ACCEPTED' | 'DECLINED') => void;
  submitClubApplication: (applicationData: Omit<ClubApplication, 'id' | 'status' | 'createdAt'>) => void;
  reviewApplication: (applicationId: string, decision: 'APPROVED' | 'REJECTED', reviewedBy: string) => void;
  
  // Search and filtering
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedLocation: (location: string | null) => void;
  getFilteredClubs: () => Club[];
  
  // Data loading
  loadClubs: () => Promise<void>;
  loadUserClubs: () => Promise<void>;
  loadClubInvitations: () => Promise<void>;
  loadClubApplications: () => Promise<void>;
  
  // Utility
  getClubById: (id: string) => Club | undefined;
  getUserRoleInClub: (clubId: string, userId: string) => ClubMember['role'] | null;
  canUserManageClub: (clubId: string, userId: string) => boolean;
  canUserCreateEvents: (clubId: string, userId: string) => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type ClubsStore = ClubsState & ClubsActions;

export const useClubsStore = create<ClubsStore>((set, get) => ({
  clubs: [],
  userClubs: [],
  clubInvitations: [],
  clubApplications: [],
  selectedClub: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
  selectedLocation: null,

  createClub: (clubData) => {
    const id = `club_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newClub: Club = {
      ...clubData,
      id,
      members: [{
        userId: clubData.members[0]?.userId || 'currentUser',
        userName: clubData.members[0]?.userName || 'Current User',
        userPhoto: clubData.members[0]?.userPhoto,
        role: 'OWNER',
        joinedAt: new Date(),
        isVerified: true,
        lastActive: new Date(),
        memberSince: new Date(),
        totalEvents: 0,
        totalGames: 0,
      }],
      events: [],
      stats: {
        totalGames: 0,
        totalTournaments: 0,
        totalEvents: 0,
        averageRating: 0,
        totalMembers: 1,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      clubs: [newClub, ...state.clubs],
      userClubs: [newClub, ...state.userClubs],
    }));

    return id;
  },

  updateClub: (clubId, updates) => {
    set((state) => ({
      clubs: state.clubs.map((club) =>
        club.id === clubId
          ? { ...club, ...updates, updatedAt: new Date() }
          : club
      ),
      userClubs: state.userClubs.map((club) =>
        club.id === clubId
          ? { ...club, ...updates, updatedAt: new Date() }
          : club
      ),
      selectedClub: state.selectedClub?.id === clubId
        ? { ...state.selectedClub, ...updates, updatedAt: new Date() }
        : state.selectedClub,
    }));
  },

  deleteClub: (clubId) => {
    set((state) => ({
      clubs: state.clubs.filter((club) => club.id !== clubId),
      userClubs: state.userClubs.filter((club) => club.id !== clubId),
      selectedClub: state.selectedClub?.id === clubId ? null : state.selectedClub,
    }));
  },

  setSelectedClub: (club) => {
    set({ selectedClub: club });
  },

  addMember: (clubId, memberData) => {
    const newMember: ClubMember = {
      ...memberData,
      joinedAt: new Date(),
      lastActive: new Date(),
      memberSince: new Date(),
      totalEvents: 0,
      totalGames: 0,
    };

    set((state) => ({
      clubs: state.clubs.map((club) =>
        club.id === clubId
          ? { 
              ...club, 
              members: [...club.members, newMember],
              currentMembers: club.currentMembers + 1,
              updatedAt: new Date(),
            }
          : club
      ),
      userClubs: state.userClubs.map((club) =>
        club.id === clubId
          ? { 
              ...club, 
              members: [...club.members, newMember],
              currentMembers: club.currentMembers + 1,
              updatedAt: new Date(),
            }
          : club
      ),
    }));
  },

  removeMember: (clubId, userId) => {
    set((state) => ({
      clubs: state.clubs.map((club) =>
        club.id === clubId
          ? { 
              ...club, 
              members: club.members.filter((member) => member.userId !== userId),
              currentMembers: Math.max(0, club.currentMembers - 1),
              updatedAt: new Date(),
            }
          : club
      ),
      userClubs: state.userClubs.map((club) =>
        club.id === clubId
          ? { 
              ...club, 
              members: club.members.filter((member) => member.userId !== userId),
              currentMembers: Math.max(0, club.currentMembers - 1),
              updatedAt: new Date(),
            }
          : club
      ),
    }));
  },

  updateMemberRole: (clubId, userId, newRole) => {
    set((state) => ({
      clubs: state.clubs.map((club) =>
        club.id === clubId
          ? {
              ...club,
              members: club.members.map((member) =>
                member.userId === userId ? { ...member, role: newRole } : member
              ),
              updatedAt: new Date(),
            }
          : club
      ),
      userClubs: state.userClubs.map((club) =>
        club.id === clubId
          ? {
              ...club,
              members: club.members.map((member) =>
                member.userId === userId ? { ...member, role: newRole } : member
              ),
              updatedAt: new Date(),
            }
          : club
      ),
    }));
  },

  verifyMember: (clubId, userId) => {
    set((state) => ({
      clubs: state.clubs.map((club) =>
        club.id === clubId
          ? {
              ...club,
              members: club.members.map((member) =>
                member.userId === userId ? { ...member, isVerified: true } : member
              ),
              updatedAt: new Date(),
            }
          : club
      ),
      userClubs: state.userClubs.map((club) =>
        club.id === clubId
          ? {
              ...club,
              members: club.members.map((member) =>
                member.userId === userId ? { ...member, isVerified: true } : member
              ),
              updatedAt: new Date(),
            }
          : club
      ),
    }));
  },

  createClubEvent: (clubId, eventData) => {
    const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEvent: ClubEvent = {
      ...eventData,
      id,
      createdAt: new Date(),
    };

    set((state) => ({
      clubs: state.clubs.map((club) =>
        club.id === clubId
          ? { 
              ...club, 
              events: [...club.events, newEvent],
              stats: {
                ...club.stats,
                totalEvents: club.stats.totalEvents + 1,
              },
              updatedAt: new Date(),
            }
          : club
      ),
      userClubs: state.userClubs.map((club) =>
        club.id === clubId
          ? { 
              ...club, 
              events: [...club.events, newEvent],
              stats: {
                ...club.stats,
                totalEvents: club.stats.totalEvents + 1,
              },
              updatedAt: new Date(),
            }
          : club
      ),
    }));
  },

  updateClubEvent: (clubId, eventId, updates) => {
    set((state) => ({
      clubs: state.clubs.map((club) =>
        club.id === clubId
          ? {
              ...club,
              events: club.events.map((event) =>
                event.id === eventId ? { ...event, ...updates } : event
              ),
              updatedAt: new Date(),
            }
          : club
      ),
      userClubs: state.userClubs.map((club) =>
        club.id === clubId
          ? {
              ...club,
              events: club.events.map((event) =>
                event.id === eventId ? { ...event, ...updates } : event
              ),
              updatedAt: new Date(),
            }
          : club
      ),
    }));
  },

  deleteClubEvent: (clubId, eventId) => {
    set((state) => ({
      clubs: state.clubs.map((club) =>
        club.id === clubId
          ? {
              ...club,
              events: club.events.filter((event) => event.id !== eventId),
              stats: {
                ...club.stats,
                totalEvents: Math.max(0, club.stats.totalEvents - 1),
              },
              updatedAt: new Date(),
            }
          : club
      ),
      userClubs: state.userClubs.map((club) =>
        club.id === clubId
          ? {
              ...club,
              events: club.events.filter((event) => event.id !== eventId),
              stats: {
                ...club.stats,
                totalEvents: Math.max(0, club.stats.totalEvents - 1),
              },
              updatedAt: new Date(),
            }
          : club
      ),
    }));
  },

  joinClubEvent: (clubId, eventId, userId) => {
    set((state) => ({
      clubs: state.clubs.map((club) =>
        club.id === clubId
          ? {
              ...club,
              events: club.events.map((event) =>
                event.id === eventId
                  ? {
                      ...event,
                      participants: [...event.participants, userId],
                      currentParticipants: event.currentParticipants + 1,
                    }
                  : event
              ),
              updatedAt: new Date(),
            }
          : club
      ),
      userClubs: state.userClubs.map((club) =>
        club.id === clubId
          ? {
              ...club,
              events: club.events.map((event) =>
                event.id === eventId
                  ? {
                      ...event,
                      participants: [...event.participants, userId],
                      currentParticipants: event.currentParticipants + 1,
                    }
                  : event
              ),
              updatedAt: new Date(),
            }
          : club
      ),
    }));
  },

  leaveClubEvent: (clubId, eventId, userId) => {
    set((state) => ({
      clubs: state.clubs.map((club) =>
        club.id === clubId
          ? {
              ...club,
              events: club.events.map((event) =>
                event.id === eventId
                  ? {
                      ...event,
                      participants: event.participants.filter((id) => id !== userId),
                      currentParticipants: Math.max(0, event.currentParticipants - 1),
                    }
                  : event
              ),
              updatedAt: new Date(),
            }
          : club
      ),
      userClubs: state.userClubs.map((club) =>
        club.id === clubId
          ? {
              ...club,
              events: club.events.map((event) =>
                event.id === eventId
                  ? {
                      ...event,
                      participants: event.participants.filter((id) => id !== userId),
                      currentParticipants: Math.max(0, event.currentParticipants - 1),
                    }
                  : event
              ),
              updatedAt: new Date(),
            }
          : club
      ),
    }));
  },

  sendClubInvitation: (invitationData) => {
    const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newInvitation: ClubInvitation = {
      ...invitationData,
      id,
      status: 'PENDING',
      createdAt: new Date(),
    };

    set((state) => ({
      clubInvitations: [...state.clubInvitations, newInvitation],
    }));
  },

  respondToInvitation: (invitationId, response) => {
    set((state) => ({
      clubInvitations: state.clubInvitations.map((invitation) =>
        invitation.id === invitationId
          ? { ...invitation, status: response }
          : invitation
      ),
    }));
  },

  submitClubApplication: (applicationData) => {
    const id = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newApplication: ClubApplication = {
      ...applicationData,
      id,
      status: 'PENDING',
      createdAt: new Date(),
    };

    set((state) => ({
      clubApplications: [...state.clubApplications, newApplication],
    }));
  },

  reviewApplication: (applicationId, decision, reviewedBy) => {
    set((state) => ({
      clubApplications: state.clubApplications.map((application) =>
        application.id === applicationId
          ? { 
              ...application, 
              status: decision, 
              reviewedBy, 
              reviewedAt: new Date() 
            }
          : application
      ),
    }));
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),

  getFilteredClubs: () => {
    const { clubs, searchQuery, selectedCategory, selectedLocation } = get();
    let filtered = clubs;

    if (searchQuery.trim()) {
      filtered = filtered.filter((club) =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.location.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((club) => club.category === selectedCategory);
    }

    if (selectedLocation) {
      filtered = filtered.filter((club) => club.location.city === selectedLocation);
    }

    return filtered.sort((a, b) => {
      // Sort by verification status first, then by member count
      if (a.isVerified !== b.isVerified) {
        return b.isVerified ? 1 : -1;
      }
      return b.currentMembers - a.currentMembers;
    });
  },

  loadClubs: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock clubs data - in real app this would come from API
      const mockClubs: Club[] = [
        {
          id: 'club_1',
          name: 'Central Park Pickleball Club',
          description: 'Premier pickleball club in the heart of Central Park. We welcome players of all skill levels and host regular tournaments and social events.',
          logo: 'https://example.com/central-park-logo.jpg',
          coverPhoto: 'https://example.com/central-park-cover.jpg',
          location: {
            id: 'loc_1',
            name: 'Central Park Courts',
            address: '123 Central Park West',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            latitude: 40.7829,
            longitude: -73.9654,
            courtCount: 8,
            courtTypes: ['Outdoor', 'Hard Court'],
            amenities: ['Parking', 'Restrooms', 'Pro Shop', 'Lighting'],
            photos: ['https://example.com/court1.jpg', 'https://example.com/court2.jpg'],
          },
          category: 'MIXED',
          skillLevels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
          membershipType: 'PAID',
          membershipFee: 50,
          maxMembers: 200,
          currentMembers: 156,
          members: [
            {
              userId: 'user1',
              userName: 'John Smith',
              userPhoto: 'https://example.com/john.jpg',
              role: 'OWNER',
              joinedAt: new Date('2023-01-15'),
              isVerified: true,
              lastActive: new Date(),
              memberSince: new Date('2023-01-15'),
              totalEvents: 45,
              totalGames: 120,
            },
            {
              userId: 'user2',
              userName: 'Sarah Johnson',
              userPhoto: 'https://example.com/sarah.jpg',
              role: 'ADMIN',
              joinedAt: new Date('2023-02-01'),
              isVerified: true,
              lastActive: new Date(),
              memberSince: new Date('2023-02-01'),
              totalEvents: 38,
              totalGames: 95,
            },
          ],
          events: [
            {
              id: 'event_1',
              title: 'Summer Tournament 2024',
              description: 'Annual summer tournament for all skill levels',
              type: 'TOURNAMENT',
              startDate: new Date('2024-07-15'),
              endDate: new Date('2024-07-17'),
              location: {
                id: 'loc_1',
                name: 'Central Park Courts',
                address: '123 Central Park West',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                latitude: 40.7829,
                longitude: -73.9654,
                courtCount: 8,
                courtTypes: ['Outdoor', 'Hard Court'],
                amenities: ['Parking', 'Restrooms', 'Pro Shop', 'Lighting'],
                photos: ['https://example.com/court1.jpg', 'https://example.com/court2.jpg'],
              },
              maxParticipants: 64,
              currentParticipants: 48,
              participants: ['user1', 'user2', 'user3'],
              isActive: true,
              createdBy: 'user1',
              createdAt: new Date('2024-01-15'),
            },
          ],
          isActive: true,
          isVerified: true,
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date(),
          contactInfo: {
            email: 'info@centralparkpickleball.com',
            phone: '+1-555-0123',
            website: 'https://centralparkpickleball.com',
            socialMedia: {
              facebook: 'centralparkpickleball',
              instagram: 'centralparkpickleball',
            },
          },
          rules: [
            'Respect all players and officials',
            'Follow court etiquette',
            'No food or drinks on courts',
            'Proper footwear required',
          ],
          achievements: [
            'Best Club 2023 - NYC Pickleball Association',
            'Tournament Excellence Award 2023',
            'Community Service Recognition 2023',
          ],
          stats: {
            totalGames: 1250,
            totalTournaments: 12,
            totalEvents: 45,
            averageRating: 4.8,
            totalMembers: 156,
          },
        },
        {
          id: 'club_2',
          name: 'Brooklyn Elite Pickleball',
          description: 'Competitive pickleball club for advanced players. Focus on tournament preparation and skill development.',
          logo: 'https://example.com/brooklyn-elite-logo.jpg',
          coverPhoto: 'https://example.com/brooklyn-elite-cover.jpg',
          location: {
            id: 'loc_2',
            name: 'Brooklyn Sports Complex',
            address: '456 Atlantic Avenue',
            city: 'Brooklyn',
            state: 'NY',
            country: 'USA',
            latitude: 40.6895,
            longitude: -73.9881,
            courtCount: 6,
            courtTypes: ['Indoor', 'Hard Court'],
            amenities: ['Parking', 'Restrooms', 'Pro Shop', 'Locker Rooms', 'Café'],
            photos: ['https://example.com/brooklyn1.jpg', 'https://example.com/brooklyn2.jpg'],
          },
          category: 'COMPETITIVE',
          skillLevels: ['ADVANCED', 'ELITE'],
          membershipType: 'INVITATION_ONLY',
          maxMembers: 100,
          currentMembers: 78,
          members: [
            {
              userId: 'user3',
              userName: 'Mike Wilson',
              userPhoto: 'https://example.com/mike.jpg',
              role: 'OWNER',
              joinedAt: new Date('2022-06-01'),
              isVerified: true,
              lastActive: new Date(),
              memberSince: new Date('2022-06-01'),
              totalEvents: 52,
              totalGames: 180,
            },
          ],
          events: [],
          isActive: true,
          isVerified: true,
          createdAt: new Date('2022-06-01'),
          updatedAt: new Date(),
          contactInfo: {
            email: 'info@brooklynelitepickleball.com',
            phone: '+1-555-0456',
            website: 'https://brooklynelitepickleball.com',
          },
          rules: [
            'Advanced skill level required',
            'Tournament-focused training',
            'Strict attendance policy',
            'Performance-based membership',
          ],
          achievements: [
            'Regional Champions 2023',
            'National Tournament Winners 2023',
            'Elite Training Program Recognition',
          ],
          stats: {
            totalGames: 890,
            totalTournaments: 8,
            totalEvents: 52,
            averageRating: 4.9,
            totalMembers: 78,
          },
        },
      ];
      
      set({ 
        clubs: mockClubs, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load clubs', 
        isLoading: false 
      });
    }
  },

  loadUserClubs: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, this would load clubs where the user is a member
      // For now, we'll use the same mock data
      const { clubs } = get();
      set({ 
        userClubs: clubs.filter(club => 
          club.members.some(member => member.userId === 'currentUser')
        ),
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load user clubs', 
        isLoading: false 
      });
    }
  },

  loadClubInvitations: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock invitations data
      const mockInvitations: ClubInvitation[] = [
        {
          id: 'inv_1',
          clubId: 'club_1',
          clubName: 'Central Park Pickleball Club',
          fromUserId: 'user1',
          fromUserName: 'John Smith',
          toUserId: 'currentUser',
          toUserName: 'Current User',
          role: 'MEMBER',
          message: 'We\'d love to have you join our club!',
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          createdAt: new Date(),
        },
      ];
      
      set({ 
        clubInvitations: mockInvitations, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load club invitations', 
        isLoading: false 
      });
    }
  },

  loadClubApplications: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock applications data
      const mockApplications: ClubApplication[] = [
        {
          id: 'app_1',
          clubId: 'club_2',
          clubName: 'Brooklyn Elite Pickleball',
          userId: 'user4',
          userName: 'Lisa Brown',
          userPhoto: 'https://example.com/lisa.jpg',
          message: 'I\'m an advanced player looking to join a competitive club.',
          skillLevel: 'ADVANCED',
          experience: '5 years of competitive play',
          availability: ['Weekdays', 'Weekends'],
          status: 'PENDING',
          createdAt: new Date(),
        },
      ];
      
      set({ 
        clubApplications: mockApplications, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load club applications', 
        isLoading: false 
      });
    }
  },

  getClubById: (id) => {
    const { clubs } = get();
    return clubs.find((club) => club.id === id);
  },

  getUserRoleInClub: (clubId, userId) => {
    const { clubs } = get();
    const club = clubs.find((c) => c.id === clubId);
    const member = club?.members.find((m) => m.userId === userId);
    return member?.role || null;
  },

  canUserManageClub: (clubId, userId) => {
    const role = get().getUserRoleInClub(clubId, userId);
    return role === 'OWNER' || role === 'ADMIN';
  },

  canUserCreateEvents: (clubId, userId) => {
    const role = get().getUserRoleInClub(clubId, userId);
    return role === 'OWNER' || role === 'ADMIN' || role === 'ORGANIZER';
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));


