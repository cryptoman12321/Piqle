import { User, SkillLevel, Hand } from '../types';

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  skillLevel: string;
  isOnline: boolean;
  lastOnlineTime: Date;
  city?: string;
  photo?: string;
}

export interface UserInvite {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  gameId?: string;
  tournamentId?: string;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: Date;
}

// Расширенная база пользователей для демонстрации
const mockUsers: User[] = [
  {
    id: 'user1',
    email: '2',
    firstName: 'Sol',
    lastName: 'Shats',
    city: 'New York',
    country: 'USA',
    skillLevel: SkillLevel.INTERMEDIATE,
    hand: Hand.RIGHT,
    isOnline: true,
    lastOnlineTime: new Date(),
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'user2',
    email: '1',
    firstName: 'Vlad',
    lastName: 'Shetinin',
    city: 'Moscow',
    country: 'Russia',
    skillLevel: SkillLevel.ADVANCED,
    hand: Hand.RIGHT,
    isOnline: true,
    lastOnlineTime: new Date(),
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'user3',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    city: 'Los Angeles',
    country: 'USA',
    skillLevel: SkillLevel.BEGINNER,
    hand: Hand.LEFT,
    isOnline: false,
    lastOnlineTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'user4',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    city: 'Chicago',
    country: 'USA',
    skillLevel: SkillLevel.INTERMEDIATE,
    hand: Hand.RIGHT,
    isOnline: true,
    lastOnlineTime: new Date(),
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'user5',
    email: 'mike@example.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    city: 'Boston',
    country: 'USA',
    skillLevel: SkillLevel.PROFESSIONAL,
    hand: Hand.RIGHT,
    isOnline: true,
    lastOnlineTime: new Date(),
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'user6',
    email: 'sarah@example.com',
    firstName: 'Sarah',
    lastName: 'Wilson',
    city: 'Seattle',
    country: 'USA',
    skillLevel: SkillLevel.ADVANCED,
    hand: Hand.LEFT,
    isOnline: false,
    lastOnlineTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    createdAt: new Date('2024-01-25'),
  },
];

class UserService {
  private users = new Map<string, User>(mockUsers.map(user => [user.id, user]));
  private invites = new Map<string, UserInvite>();

  // Получить всех пользователей
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Поиск пользователей
  searchUsers(query: string): UserSearchResult[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.users.values())
      .filter(user => 
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm)
      )
      .map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        skillLevel: user.skillLevel || 'Unknown',
        isOnline: user.isOnline,
        lastOnlineTime: user.lastOnlineTime || new Date(),
        city: user.city,
        photo: user.photo,
      }));
  }

  // Получить пользователя по ID
  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  // Получить пользователя по email
  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  // Получить онлайн пользователей
  getOnlineUsers(): User[] {
    return Array.from(this.users.values()).filter(user => user.isOnline);
  }

  // Получить пользователей по уровню навыков
  getUsersBySkillLevel(skillLevel: SkillLevel): User[] {
    return Array.from(this.users.values()).filter(user => user.skillLevel === skillLevel);
  }

  // Получить пользователей по городу
  getUsersByCity(city: string): User[] {
    return Array.from(this.users.values()).filter(user => 
      user.city?.toLowerCase().includes(city.toLowerCase())
    );
  }

  // Обновить статус пользователя
  updateUserStatus(userId: string, isOnline: boolean): void {
    const user = this.users.get(userId);
    if (user) {
      user.isOnline = isOnline;
      user.lastOnlineTime = new Date();
    }
  }

  // Добавить нового пользователя
  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  // Обновить пользователя
  updateUser(userId: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  // Отправить приглашение
  sendInvite(invite: Omit<UserInvite, 'id' | 'status' | 'createdAt'>): UserInvite {
    const newInvite: UserInvite = {
      ...invite,
      id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'PENDING',
      createdAt: new Date(),
    };
    this.invites.set(newInvite.id, newInvite);
    return newInvite;
  }

  // Получить приглашения пользователя
  getUserInvites(userId: string): UserInvite[] {
    return Array.from(this.invites.values()).filter(invite => invite.toUserId === userId);
  }

  // Ответить на приглашение
  respondToInvite(inviteId: string, response: 'ACCEPTED' | 'DECLINED'): UserInvite | undefined {
    const invite = this.invites.get(inviteId);
    if (invite) {
      invite.status = response;
      this.invites.set(inviteId, invite);
      return invite;
    }
    return undefined;
  }

  // Получить друзей пользователя (для демонстрации возвращаем случайных пользователей)
  getUserFriends(userId: string): User[] {
    const allUsers = Array.from(this.users.values());
    const otherUsers = allUsers.filter(user => user.id !== userId);
    // Возвращаем случайных 3-5 пользователей как "друзей"
    return otherUsers.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 3);
  }

  // Получить пользователей, которые недавно играли
  getRecentPlayers(userId: string): User[] {
    const allUsers = Array.from(this.users.values());
    const otherUsers = allUsers.filter(user => user.id !== userId);
    // Возвращаем случайных 2-4 пользователей как "недавних игроков"
    return otherUsers.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 2);
  }

  // Симуляция получения пользователей из API
  async fetchUsers(query?: string): Promise<UserSearchResult[]> {
    // Симуляция задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (query) {
      return this.searchUsers(query);
    }
    
    return Array.from(this.users.values()).map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      skillLevel: user.skillLevel || 'Unknown',
      isOnline: user.isOnline,
      lastOnlineTime: user.lastOnlineTime || new Date(),
      city: user.city,
      photo: user.photo,
    }));
  }

  // Симуляция отправки приглашения через API
  async sendGameInvite(invite: Omit<UserInvite, 'id' | 'status' | 'createdAt'>): Promise<UserInvite> {
    // Симуляция задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return this.sendInvite(invite);
  }
}

// Создаем единственный экземпляр сервиса
export const userService = new UserService();
