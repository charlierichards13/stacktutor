/**
 * Hand-written types for the StackTutor Supabase schema.
 * Mirrors supabase/migrations/20260602220408_create_initial_schema.sql —
 * keep both in sync when the schema changes.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Allowed values for code_reviews.language (CHECK constraint). */
export type ReviewLanguage = 'java' | 'python' | 'cpp' | 'typescript';

/** Allowed values for code_reviews.review_mode (CHECK constraint). */
export type ReviewMode =
  | 'find_bugs'
  | 'explain_code'
  | 'generate_tests'
  | 'check_complexity'
  | 'security_review'
  | 'hint_mode';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      code_reviews: {
        Row: {
          id: string;
          user_id: string;
          language: ReviewLanguage;
          review_mode: ReviewMode;
          code_input: string;
          ai_response: Json;
          summary: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          language: ReviewLanguage;
          review_mode: ReviewMode;
          code_input: string;
          ai_response: Json;
          summary?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          language?: ReviewLanguage;
          review_mode?: ReviewMode;
          code_input?: string;
          ai_response?: Json;
          summary?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      review_feedback: {
        Row: {
          id: string;
          review_id: string;
          user_id: string;
          rating: number;
          feedback_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          user_id: string;
          rating: number;
          feedback_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          user_id?: string;
          rating?: number;
          feedback_text?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
