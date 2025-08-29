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
  isPrivate: boolean;
  createdBy: string;
  players: string[];
  status: GameStatus;
  createdAt: Date;
}

export interface Court {
  id: string;
  name: string;
  location: Location;
  type: CourtType;
  surface: CourtSurface;
  isIndoor: boolean;
  isAvailable: boolean;
  amenities: string[];
  photos: string[];
}

export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  address?: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  location: Location;
  logo?: string;
  coverPhoto?: string;
  members: ClubMember[];
  admins: string[];
  events: string[];
  createdAt: Date;
}

export interface ClubMember {
  userId: string;
  role: ClubRole;
  joinedAt: Date;
  isVerified: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  format: TournamentFormat;
  clubId: string;
  location: Location;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  maxParticipants: number;
  currentParticipants: number;
  skillLevel: SkillLevel;
  entryFee?: number;
  prizes?: Prize[];
  brackets: TournamentBracket[];
  status: TournamentStatus;
  isDUPR: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface TournamentBracket {
  id: string;
  name: string;
  type: BracketType;
  participants: string[];
  matches: TournamentMatch[];
  winner?: string;
}

export interface TournamentMatch {
  id: string;
  player1: string;
  player2: string;
  score1?: number;
  score2?: number;
  winner?: string;
  status: MatchStatus;
  scheduledTime?: Date;
  courtId?: string;
}

export interface Prize {
  place: number;
  amount: number;
  description: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  duprRating?: number;
  achievements: Achievement[];
  stats: UserStats;
  preferences: UserPreferences;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  tournamentsWon: number;
  totalPoints: number;
  averageScore: number;
}

export interface UserPreferences {
  preferredGameTime: string[];
  preferredLocations: string[];
  skillLevelRange: SkillLevel[];
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  gameInvites: boolean;
  tournamentUpdates: boolean;
  friendRequests: boolean;
  clubUpdates: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
  PROFESSIONAL = 'PROFESSIONAL'
}

export enum Hand {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  AMBIDEXTROUS = 'AMBIDEXTROUS'
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

export enum CourtType {
  PICKLEBALL = 'PICKLEBALL',
  TENNIS = 'TENNIS',
  PADEL = 'PADEL',
  MULTI_SPORT = 'MULTI_SPORT'
}

export enum CourtSurface {
  CONCRETE = 'CONCRETE',
  ASPHALT = 'ASPHALT',
  ARTIFICIAL_TURF = 'ARTIFICIAL_TURF',
  CLAY = 'CLAY',
  GRASS = 'GRASS'
}

export enum ClubRole {
  MEMBER = 'MEMBER',
  ORGANIZER = 'ORGANIZER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

export enum TournamentFormat {
  // Major League Pickleball (MiLP)
  MILP = 'MILP',
  // Single elimination formats
  SINGLES_KNOCKOUT = 'SINGLES_KNOCKOUT',
  DOUBLES_KNOCKOUT = 'DOUBLES_KNOCKOUT',
  // Round robin formats
  SINGLES_ROUND_ROBIN = 'SINGLES_ROUND_ROBIN',
  DOUBLES_ROUND_ROBIN = 'DOUBLES_ROUND_ROBIN',
  RANDOM_TEAMS_ROUND_ROBIN = 'RANDOM_TEAMS_ROUND_ROBIN',
  // Ladder formats
  INDIVIDUAL_LADDER = 'INDIVIDUAL_LADDER',
  LADDER_LEAGUE = 'LADDER_LEAGUE',
  // Additional formats mentioned in description
  SWISS_SYSTEM = 'SWISS_SYSTEM',
  CONSOLATION_BRACKET = 'CONSOLATION_BRACKET',
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
  ROUND_ROBIN_PLUS_KNOCKOUT = 'ROUND_ROBIN_PLUS_KNOCKOUT',
  TEAM_FORMAT = 'TEAM_FORMAT'
}

export enum BracketType {
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
  ROUND_ROBIN = 'ROUND_ROBIN',
  SWISS_SYSTEM = 'SWISS_SYSTEM',
  LADDER = 'LADDER',
  CONSOLATION = 'CONSOLATION'
}

export enum TournamentStatus {
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface RootStackParamList {
  Auth: undefined;
  Main: undefined;
  CourtDetails: { courtId: string };
  ClubDetails: { clubId: string };
  CreateGame: undefined;
  CreateTournament: undefined;
  CreateClub: undefined;
  [key: string]: undefined | { [key: string]: any };
}

export interface MainTabParamList {
  Home: undefined;
  Map: undefined;
  Games: undefined;
  Tournaments: undefined;
  Profile: undefined;
  [key: string]: undefined | { [key: string]: any };
}

export interface GamesStackParamList {
  GamesList: undefined;
  GameDetails: { gameId: string };
  [key: string]: undefined | { [key: string]: any };
}

export interface TournamentsStackParamList {
  TournamentsList: undefined;
  TournamentDetails: { tournamentId: string };
  [key: string]: undefined | { [key: string]: any };
}
