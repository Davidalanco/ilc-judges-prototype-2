export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      attorney_conversations: {
        Row: {
          analysis: Json | null
          analysis_result: Json | null
          case_id: string | null
          created_at: string | null
          duration_seconds: number | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          id: string
          key_issues: Json | null
          s3_key: string | null
          s3_url: string | null
          speaker_count: number | null
          speakers: Json | null
          status: string | null
          transcript: string | null
          transcript_quality: number | null
          transcription_status: string | null
          transcription_text: string | null
          updated_at: string | null
          upload_status: string | null
          user_id: string | null
        }
        Insert: {
          analysis?: Json | null
          analysis_result?: Json | null
          case_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          key_issues?: Json | null
          s3_key?: string | null
          s3_url?: string | null
          speaker_count?: number | null
          speakers?: Json | null
          status?: string | null
          transcript?: string | null
          transcript_quality?: number | null
          transcription_status?: string | null
          transcription_text?: string | null
          updated_at?: string | null
          upload_status?: string | null
          user_id?: string | null
        }
        Update: {
          analysis?: Json | null
          analysis_result?: Json | null
          case_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          key_issues?: Json | null
          s3_key?: string | null
          s3_url?: string | null
          speaker_count?: number | null
          speakers?: Json | null
          status?: string | null
          transcript?: string | null
          transcript_quality?: number | null
          transcription_status?: string | null
          transcription_text?: string | null
          updated_at?: string | null
          upload_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attorney_conversations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attorney_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      brief_section_chats: {
        Row: {
          case_id: string | null
          content: string | null
          created_at: string | null
          id: string
          role: string | null
          section_id: string | null
        }
        Insert: {
          case_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          section_id?: string | null
        }
        Update: {
          case_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          section_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brief_section_chats_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      briefs: {
        Row: {
          case_id: string | null
          content: string | null
          created_at: string | null
          custom_sections: Json | null
          id: string
          persuasion_scores: Json | null
          sections: Json | null
          status: string | null
          updated_at: string | null
          version: number | null
          word_count: number | null
        }
        Insert: {
          case_id?: string | null
          content?: string | null
          created_at?: string | null
          custom_sections?: Json | null
          id?: string
          persuasion_scores?: Json | null
          sections?: Json | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
          word_count?: number | null
        }
        Update: {
          case_id?: string | null
          content?: string | null
          created_at?: string | null
          custom_sections?: Json | null
          id?: string
          persuasion_scores?: Json | null
          sections?: Json | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "briefs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          case_name: string | null
          case_type: string | null
          client_type: string | null
          constitutional_question: string | null
          created_at: string | null
          current_step: number | null
          id: string
          jurisdiction: string | null
          penalties: string | null
          precedent_target: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          case_name?: string | null
          case_type?: string | null
          client_type?: string | null
          constitutional_question?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          jurisdiction?: string | null
          penalties?: string | null
          precedent_target?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          case_name?: string | null
          case_type?: string | null
          client_type?: string | null
          constitutional_question?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          jurisdiction?: string | null
          penalties?: string | null
          precedent_target?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      citation_relationships: {
        Row: {
          cited_document_id: string | null
          citing_document_id: string | null
          context: string | null
          created_at: string | null
          id: string
          page_number: number | null
          relationship_type: string | null
        }
        Insert: {
          cited_document_id?: string | null
          citing_document_id?: string | null
          context?: string | null
          created_at?: string | null
          id?: string
          page_number?: number | null
          relationship_type?: string | null
        }
        Update: {
          cited_document_id?: string | null
          citing_document_id?: string | null
          context?: string | null
          created_at?: string | null
          id?: string
          page_number?: number | null
          relationship_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citation_relationships_cited_document_id_fkey"
            columns: ["cited_document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citation_relationships_citing_document_id_fkey"
            columns: ["citing_document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_summaries: {
        Row: {
          ai_model: string | null
          ai_summary: string | null
          cited_cases: string[] | null
          confidence_score: number | null
          created_at: string | null
          disposition: string | null
          document_id: string | null
          holding: string | null
          id: string
          key_points: string[] | null
          legal_standard: string | null
          notable_quotes: string[] | null
          precedent_value: string | null
          reasoning: string | null
          summary_type: string
          updated_at: string | null
        }
        Insert: {
          ai_model?: string | null
          ai_summary?: string | null
          cited_cases?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          disposition?: string | null
          document_id?: string | null
          holding?: string | null
          id?: string
          key_points?: string[] | null
          legal_standard?: string | null
          notable_quotes?: string[] | null
          precedent_value?: string | null
          reasoning?: string | null
          summary_type: string
          updated_at?: string | null
        }
        Update: {
          ai_model?: string | null
          ai_summary?: string | null
          cited_cases?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          disposition?: string | null
          document_id?: string | null
          holding?: string | null
          id?: string
          key_points?: string[] | null
          legal_standard?: string | null
          notable_quotes?: string[] | null
          precedent_value?: string | null
          reasoning?: string | null
          summary_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_summaries_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          id: string
          s3_key: string | null
          s3_url: string | null
          upload_status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          s3_key?: string | null
          s3_url?: string | null
          upload_status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          s3_key?: string | null
          s3_url?: string | null
          upload_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      justice_case_analysis: {
        Row: {
          alignment_score: number | null
          case_id: string | null
          confidence_level: string | null
          created_at: string | null
          id: string
          justice_id: string | null
          key_factors: Json | null
          persuasion_entry_points: Json | null
          strategy: Json | null
          updated_at: string | null
        }
        Insert: {
          alignment_score?: number | null
          case_id?: string | null
          confidence_level?: string | null
          created_at?: string | null
          id?: string
          justice_id?: string | null
          key_factors?: Json | null
          persuasion_entry_points?: Json | null
          strategy?: Json | null
          updated_at?: string | null
        }
        Update: {
          alignment_score?: number | null
          case_id?: string | null
          confidence_level?: string | null
          created_at?: string | null
          id?: string
          justice_id?: string | null
          key_factors?: Json | null
          persuasion_entry_points?: Json | null
          strategy?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "justice_case_analysis_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "justice_case_analysis_justice_id_fkey"
            columns: ["justice_id"]
            isOneToOne: false
            referencedRelation: "justice_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      justice_profiles: {
        Row: {
          avoid_triggers: Json | null
          core_values: string[] | null
          created_at: string | null
          id: string
          ideology_scores: Json | null
          justice_name: string
          persuasion_points: Json | null
          updated_at: string | null
        }
        Insert: {
          avoid_triggers?: Json | null
          core_values?: string[] | null
          created_at?: string | null
          id?: string
          ideology_scores?: Json | null
          justice_name: string
          persuasion_points?: Json | null
          updated_at?: string | null
        }
        Update: {
          avoid_triggers?: Json | null
          core_values?: string[] | null
          created_at?: string | null
          id?: string
          ideology_scores?: Json | null
          justice_name?: string
          persuasion_points?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          authors: string[] | null
          case_id: string | null
          case_title: string
          citation: string
          court: string | null
          created_at: string | null
          decision_date: string | null
          docket_number: string | null
          document_type: string
          download_url: string | null
          external_id: string | null
          has_plain_text: boolean | null
          id: string
          is_selected: boolean | null
          legal_issues: string[] | null
          local_file_path: string | null
          page_count: number | null
          parties: Json | null
          relevance_score: number | null
          research_session_id: string | null
          search_query: string | null
          source_system: string
          updated_at: string | null
        }
        Insert: {
          authors?: string[] | null
          case_id?: string | null
          case_title: string
          citation: string
          court?: string | null
          created_at?: string | null
          decision_date?: string | null
          docket_number?: string | null
          document_type: string
          download_url?: string | null
          external_id?: string | null
          has_plain_text?: boolean | null
          id?: string
          is_selected?: boolean | null
          legal_issues?: string[] | null
          local_file_path?: string | null
          page_count?: number | null
          parties?: Json | null
          relevance_score?: number | null
          research_session_id?: string | null
          search_query?: string | null
          source_system: string
          updated_at?: string | null
        }
        Update: {
          authors?: string[] | null
          case_id?: string | null
          case_title?: string
          citation?: string
          court?: string | null
          created_at?: string | null
          decision_date?: string | null
          docket_number?: string | null
          document_type?: string
          download_url?: string | null
          external_id?: string | null
          has_plain_text?: boolean | null
          id?: string
          is_selected?: boolean | null
          legal_issues?: string[] | null
          local_file_path?: string | null
          page_count?: number | null
          parties?: Json | null
          relevance_score?: number | null
          research_session_id?: string | null
          search_query?: string | null
          source_system?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_documents_research_session_id_fkey"
            columns: ["research_session_id"]
            isOneToOne: false
            referencedRelation: "research_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      research_notes: {
        Row: {
          case_id: string | null
          content: string
          created_at: string | null
          document_id: string | null
          id: string
          note_type: string | null
          page_references: string[] | null
          quote_text: string | null
          research_session_id: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          case_id?: string | null
          content: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          note_type?: string | null
          page_references?: string[] | null
          quote_text?: string | null
          research_session_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          case_id?: string | null
          content?: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          note_type?: string | null
          page_references?: string[] | null
          quote_text?: string | null
          research_session_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_notes_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_notes_research_session_id_fkey"
            columns: ["research_session_id"]
            isOneToOne: false
            referencedRelation: "research_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      research_results: {
        Row: {
          case_id: string | null
          created_at: string | null
          id: string
          relevance_scores: Json | null
          result_type: string | null
          results: Json | null
          search_query: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          id?: string
          relevance_scores?: Json | null
          result_type?: string | null
          results?: Json | null
          search_query?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          id?: string
          relevance_scores?: Json | null
          result_type?: string | null
          results?: Json | null
          search_query?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_results_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      research_sessions: {
        Row: {
          case_id: string | null
          created_at: string | null
          description: string | null
          id: string
          session_name: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          session_name?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          session_name?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_sessions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      research_templates: {
        Row: {
          analysis_steps: string[] | null
          case_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          document_types: string[] | null
          id: string
          is_public: boolean | null
          search_queries: string[] | null
          template_name: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          analysis_steps?: string[] | null
          case_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_types?: string[] | null
          id?: string
          is_public?: boolean | null
          search_queries?: string[] | null
          template_name: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          analysis_steps?: string[] | null
          case_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_types?: string[] | null
          id?: string
          is_public?: boolean | null
          search_queries?: string[] | null
          template_name?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "research_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          case_id: string | null
          created_at: string | null
          id: string
          is_favorite: boolean | null
          last_run_at: string | null
          results_count: number | null
          search_name: string
          search_parameters: Json | null
          search_query: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          last_run_at?: string | null
          results_count?: number | null
          search_name: string
          search_parameters?: Json | null
          search_query: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          last_run_at?: string | null
          results_count?: number | null
          search_name?: string
          search_parameters?: Json | null
          search_query?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          credits: number | null
          email: string
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits?: number | null
          email: string
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits?: number | null
          email?: string
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
