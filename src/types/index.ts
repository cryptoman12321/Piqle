// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  photo?: string;
  city?: string;
  country?: string;
  skillLevel?: SkillLevel;
  hand?: Hand;
  isOnline: boolean;
  lastOnlineTime?: Date;
  createdAt: Date;
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum Hand {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

// Game Types
export interface Game {
  id: string;
  title: string;
  description?: string;
  format: GameFormat;
  maxPlayers: number;
  currentPlayers: number;
  skillLevel: SkillLevel;
  location: Location;
  startTime: Date;
  endTime?: Date;
  isPrivate: boolean;
  createdBy: string;
  players: GamePlayer[];
  status: GameStatus;
  createdAt: Date;
}

export enum GameFormat {
  SINGLES = 'SINGLES',
  DOUBLES = 'DOUBLES',
  OPEN_PLAY = 'OPEN_PLAY'
}

export enum GameStatus {
  UPCOMING = 'UPCOMING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface GamePlayer {
  userId: string;
  joinedAt: Date;
  isConfirmed: boolean;
}

// Court Types
export interface Court {
  id: string;
  name: string;
  location: Location;
  type: CourtType;
  surface: CourtSurface;
  isIndoor: boolean;
  isAvailable: boolean;
  pricePerHour?: number;
  amenities: string[];
  photos: string[];
}

export enum CourtType {
  PICKLEBALL = 'PICKLEBALL',
  PADEL = 'PADEL',
  MULTI_SPORT = 'MULTI_SPORT'
}

export enum CourtSurface {
  CONCRETE = 'CONCRETE',
  ASPHALT = 'ASPHALT',
  GRASS = 'GRASS',
  CLAY = 'CLAY',
  ARTIFICIAL_TURF = 'ARTIFICIAL_TURF'
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

// Club Types
export interface Club {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  coverPhoto?: string;
  location: Location;
  members: ClubMember[];
  events: ClubEvent[];
  createdAt: Date;
}

export interface ClubMember {
  userId: string;
  role: ClubRole;
  joinedAt: Date;
}

export enum ClubRole {
  MEMBER = 'MEMBER',
  ORGANIZER = 'ORGANIZER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

export interface ClubEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  type: EventType;
  maxParticipants?: number;
  currentParticipants: number;
  isPrivate: boolean;
}

export enum EventType {
  TOURNAMENT = 'TOURNAMENT',
  OPEN_PLAY = 'OPEN_PLAY',
  TRAINING = 'TRAINING',
  SOCIAL = 'SOCIAL'
}

// Tournament Types
export interface Tournament {
  id: string;
  name: string;
  description?: string;
  format: TournamentFormat;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  skillLevels: SkillLevel[];
  prizes?: string[];
  registrationDeadline: Date;
  status: TournamentStatus;
  clubId?: string;
  brackets?: TournamentBracket[];
}

export enum TournamentFormat {
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
  ROUND_ROBIN = 'ROUND_ROBIN',
  LADDER = 'LADDER'
}

export enum TournamentStatus {
  REGISTRATION = 'REGISTRATION',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface TournamentBracket {
  id: string;
  name: string;
  matches: TournamentMatch[];
  participants: string[];
}

export interface TournamentMatch {
  id: string;
  player1Id: string;
  player2Id: string;
  score1?: number;
  score2?: number;
  winnerId?: string;
  status: MatchStatus;
  scheduledTime?: Date;
}

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  GameDetails: { gameId: string };
  CourtDetails: { courtId: string };
  TournamentDetails: { tournamentId: string };
  ClubDetails: { clubId: string };
  Profile: { userId: string };
  CreateGame: undefined;
  CreateTournament: undefined;
  CreateClub: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  Games: undefined;
  Tournaments: undefined;
  Profile: undefined;
};

// API Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// UI Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
    };
    h3: {
      fontSize: number;
      fontWeight: string;
    };
    body: {
      fontSize: number;
      fontWeight: string;
    };
    caption: {
      fontSize: number;
      fontWeight: string;
    };
  };
}
