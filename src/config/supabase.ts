import { createClient } from '@supabase/supabase-js';

// Эти значения нужно будет заменить на реальные из вашего проекта Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Типы для базы данных
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          avatar_url?: string;
          updated_at?: string;
        };
      };
      tournaments: {
        Row: {
          id: string;
          name: string;
          description?: string;
          max_participants: number;
          status: 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED';
          creator_id: string;
          created_at: string;
          updated_at: string;
          start_date?: string;
          end_date?: string;
          tournament_type: 'SINGLES_ROUND_ROBIN' | 'DOUBLES' | 'ELIMINATION';
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          max_participants: number;
          status?: 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED';
          creator_id: string;
          created_at?: string;
          updated_at?: string;
          start_date?: string;
          end_date?: string;
          tournament_type?: 'SINGLES_ROUND_ROBIN' | 'DOUBLES' | 'ELIMINATION';
        };
        Update: {
          name?: string;
          description?: string;
          max_participants?: number;
          status?: 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED';
          updated_at?: string;
          start_date?: string;
          end_date?: string;
          tournament_type?: 'SINGLES_ROUND_ROBIN' | 'DOUBLES' | 'ELIMINATION';
        };
      };
      tournament_players: {
        Row: {
          id: string;
          tournament_id: string;
          user_id: string;
          position: number;
          is_waiting_list: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          user_id: string;
          position?: number;
          is_waiting_list?: boolean;
          joined_at?: string;
        };
        Update: {
          position?: number;
          is_waiting_list?: boolean;
        };
      };
      matches: {
        Row: {
          id: string;
          tournament_id: string;
          player1_id: string;
          player2_id: string;
          round: number;
          match_number: number;
          score1?: number;
          score2?: number;
          status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
          winner_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          player1_id: string;
          player2_id: string;
          round: number;
          match_number: number;
          score1?: number;
          score2?: number;
          status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
          winner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          score1?: number;
          score2?: number;
          status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
          winner_id?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables = Database['public']['Tables'];
export type Tournament = Tables['tournaments']['Row'];
export type TournamentInsert = Tables['tournaments']['Insert'];
export type TournamentUpdate = Tables['tournaments']['Update'];
export type User = Tables['users']['Row'];
export type UserInsert = Tables['users']['Insert'];
export type UserUpdate = Tables['users']['Update'];
export type Match = Tables['matches']['Row'];
export type MatchInsert = Tables['matches']['Insert'];
export type MatchUpdate = Tables['matches']['Update'];
export type TournamentPlayer = Tables['tournament_players']['Row'];
export type TournamentPlayerInsert = Tables['tournament_players']['Insert'];
export type TournamentPlayerUpdate = Tables['tournament_players']['Update'];
