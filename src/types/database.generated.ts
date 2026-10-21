export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      anamneses: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          owner_id: string
          patient_id: string
          revision: number
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          owner_id: string
          patient_id: string
          revision?: number
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          owner_id?: string
          patient_id?: string
          revision?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'anamneses_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'anamneses_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'anamneses_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: true
            referencedRelation: 'patients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'anamneses_patient_owner_fk'
            columns: ['patient_id', 'owner_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id', 'owner_id']
          },
        ]
      }
      attachments: {
        Row: {
          author_id: string
          created_at: string
          evolution_id: string | null
          id: string
          mime_type: string
          object_key: string
          original_name: string
          owner_id: string
          patient_id: string
          removed_at: string | null
          revision: number
          size_bytes: number
          status: Database['public']['Enums']['attachment_status']
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          author_id: string
          created_at?: string
          evolution_id?: string | null
          id?: string
          mime_type: string
          object_key: string
          original_name: string
          owner_id: string
          patient_id: string
          removed_at?: string | null
          revision?: number
          size_bytes: number
          status?: Database['public']['Enums']['attachment_status']
          updated_at?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          evolution_id?: string | null
          id?: string
          mime_type?: string
          object_key?: string
          original_name?: string
          owner_id?: string
          patient_id?: string
          removed_at?: string | null
          revision?: number
          size_bytes?: number
          status?: Database['public']['Enums']['attachment_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'attachments_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attachments_evolution_context_fk'
            columns: ['evolution_id', 'patient_id', 'owner_id']
            isOneToOne: false
            referencedRelation: 'evolutions'
            referencedColumns: ['id', 'patient_id', 'owner_id']
          },
          {
            foreignKeyName: 'attachments_evolution_id_fkey'
            columns: ['evolution_id']
            isOneToOne: false
            referencedRelation: 'evolutions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attachments_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attachments_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attachments_patient_owner_fk'
            columns: ['patient_id', 'owner_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id', 'owner_id']
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          current_data: Json | null
          entity_id: string
          entity_type: string
          id: number
          owner_id: string
          patient_id: string | null
          previous_data: Json | null
        }
        ComputedFields: never
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          current_data?: Json | null
          entity_id: string
          entity_type: string
          id?: never
          owner_id: string
          patient_id?: string | null
          previous_data?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          current_data?: Json | null
          entity_id?: string
          entity_type?: string
          id?: never
          owner_id?: string
          patient_id?: string | null
          previous_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'audit_events_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'audit_events_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'audit_events_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          },
        ]
      }
      evolutions: {
        Row: {
          attended_on: string
          author_id: string
          clinical_response: string | null
          created_at: string
          id: string
          intervention: string | null
          next_steps: string | null
          owner_id: string
          patient_id: string
          report: string
          revision: number
          search_vector: unknown
          status: Database['public']['Enums']['evolution_status']
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          attended_on: string
          author_id: string
          clinical_response?: string | null
          created_at?: string
          id?: string
          intervention?: string | null
          next_steps?: string | null
          owner_id: string
          patient_id: string
          report: string
          revision?: number
          search_vector?: never
          status?: Database['public']['Enums']['evolution_status']
          updated_at?: string
        }
        Update: {
          attended_on?: string
          author_id?: string
          clinical_response?: string | null
          created_at?: string
          id?: string
          intervention?: string | null
          next_steps?: string | null
          owner_id?: string
          patient_id?: string
          report?: string
          revision?: number
          search_vector?: never
          status?: Database['public']['Enums']['evolution_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'evolutions_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'evolutions_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'evolutions_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'evolutions_patient_owner_fk'
            columns: ['patient_id', 'owner_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id', 'owner_id']
          },
        ]
      }
      legal_guardians: {
        Row: {
          cpf: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          owner_id: string
          patient_id: string
          phone: string
          relationship: string
          revision: number
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          cpf?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          owner_id: string
          patient_id: string
          phone: string
          relationship: string
          revision?: number
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          owner_id?: string
          patient_id?: string
          phone?: string
          relationship?: string
          revision?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'guardians_patient_owner_fk'
            columns: ['patient_id', 'owner_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id', 'owner_id']
          },
          {
            foreignKeyName: 'legal_guardians_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'legal_guardians_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          },
        ]
      }
      patients: {
        Row: {
          address_complement: string | null
          address_number: string | null
          archived_at: string | null
          birth_date: string
          city: string | null
          cpf: string | null
          created_at: string
          district: string | null
          email: string | null
          emergency_name: string | null
          emergency_phone: string | null
          emergency_relationship: string | null
          full_name: string
          gender_pronouns: string | null
          id: string
          notes: string | null
          occupation_school: string | null
          owner_id: string
          phone: string | null
          postal_code: string | null
          revision: number
          search_text: string | null
          social_name: string | null
          state: string | null
          status: Database['public']['Enums']['patient_status']
          street: string | null
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          address_complement?: string | null
          address_number?: string | null
          archived_at?: string | null
          birth_date: string
          city?: string | null
          cpf?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          emergency_name?: string | null
          emergency_phone?: string | null
          emergency_relationship?: string | null
          full_name: string
          gender_pronouns?: string | null
          id?: string
          notes?: string | null
          occupation_school?: string | null
          owner_id: string
          phone?: string | null
          postal_code?: string | null
          revision?: number
          search_text?: never
          social_name?: string | null
          state?: string | null
          status?: Database['public']['Enums']['patient_status']
          street?: string | null
          updated_at?: string
        }
        Update: {
          address_complement?: string | null
          address_number?: string | null
          archived_at?: string | null
          birth_date?: string
          city?: string | null
          cpf?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          emergency_name?: string | null
          emergency_phone?: string | null
          emergency_relationship?: string | null
          full_name?: string
          gender_pronouns?: string | null
          id?: string
          notes?: string | null
          occupation_school?: string | null
          owner_id?: string
          phone?: string | null
          postal_code?: string | null
          revision?: number
          search_text?: never
          social_name?: string | null
          state?: string | null
          status?: Database['public']['Enums']['patient_status']
          street?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'patients_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          crp_number: string
          crp_state: string
          email: string
          full_name: string
          id: string
          revision: number
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          crp_number: string
          crp_state: string
          email: string
          full_name: string
          id: string
          revision?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          crp_number?: string
          crp_state?: string
          email?: string
          full_name?: string
          id?: string
          revision?: number
          updated_at?: string
        }
        Relationships: []
      }
      therapeutic_plans: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          owner_id: string
          patient_id: string
          revision: number
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          owner_id: string
          patient_id: string
          revision?: number
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          owner_id?: string
          patient_id?: string
          revision?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'therapeutic_plans_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'therapeutic_plans_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'therapeutic_plans_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: true
            referencedRelation: 'patients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'therapeutic_plans_patient_owner_fk'
            columns: ['patient_id', 'owner_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id', 'owner_id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      discard_evolution_draft: { Args: { p_evolution_id: string }; Returns: undefined }
      get_patient_export_snapshot: { Args: { p_patient_id: string }; Returns: Json }
      list_evolutions: {
        Args: {
          p_cursor_date?: string
          p_cursor_id?: string
          p_from?: string
          p_limit?: number
          p_patient_id: string
          p_term?: string
          p_to?: string
        }
        Returns: {
          attended_on: string
          author_id: string
          clinical_response: string | null
          created_at: string
          id: string
          intervention: string | null
          next_steps: string | null
          owner_id: string
          patient_id: string
          report: string
          revision: number
          search_vector: unknown
          status: Database['public']['Enums']['evolution_status']
          updated_at: string
        }[]
        SetofOptions: {
          from: '*'
          to: 'evolutions'
          isOneToOne: false
          isSetofReturn: true
        }
      }
      register_attachment: {
        Args: {
          p_evolution_id: string
          p_mime_type: string
          p_object_key: string
          p_original_name: string
          p_patient_id: string
          p_size_bytes: number
        }
        Returns: {
          author_id: string
          created_at: string
          evolution_id: string | null
          id: string
          mime_type: string
          object_key: string
          original_name: string
          owner_id: string
          patient_id: string
          removed_at: string | null
          revision: number
          size_bytes: number
          status: Database['public']['Enums']['attachment_status']
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'attachments'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_clinical_document: {
        Args: {
          p_content: string
          p_document_type: string
          p_expected_revision?: number
          p_patient_id: string
        }
        Returns: Json
      }
      save_evolution: {
        Args: {
          p_attended_on: string
          p_clinical_response: string
          p_evolution_id: string
          p_expected_revision?: number
          p_intervention: string
          p_next_steps: string
          p_patient_id: string
          p_report: string
          p_status: Database['public']['Enums']['evolution_status']
        }
        Returns: {
          attended_on: string
          author_id: string
          clinical_response: string | null
          created_at: string
          id: string
          intervention: string | null
          next_steps: string | null
          owner_id: string
          patient_id: string
          report: string
          revision: number
          search_vector: unknown
          status: Database['public']['Enums']['evolution_status']
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'evolutions'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_patient_with_guardians: {
        Args: {
          p_duplicate_override?: boolean
          p_expected_revision?: number
          p_guardians: Json
          p_patient: Json
          p_patient_id: string
        }
        Returns: {
          address_complement: string | null
          address_number: string | null
          archived_at: string | null
          birth_date: string
          city: string | null
          cpf: string | null
          created_at: string
          district: string | null
          email: string | null
          emergency_name: string | null
          emergency_phone: string | null
          emergency_relationship: string | null
          full_name: string
          gender_pronouns: string | null
          id: string
          notes: string | null
          occupation_school: string | null
          owner_id: string
          phone: string | null
          postal_code: string | null
          revision: number
          search_text: string | null
          social_name: string | null
          state: string | null
          status: Database['public']['Enums']['patient_status']
          street: string | null
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'patients'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      search_patients: {
        Args: {
          p_cursor?: string
          p_limit?: number
          p_status?: Database['public']['Enums']['patient_status']
          p_term?: string
        }
        Returns: {
          address_complement: string | null
          address_number: string | null
          archived_at: string | null
          birth_date: string
          city: string | null
          cpf: string | null
          created_at: string
          district: string | null
          email: string | null
          emergency_name: string | null
          emergency_phone: string | null
          emergency_relationship: string | null
          full_name: string
          gender_pronouns: string | null
          id: string
          notes: string | null
          occupation_school: string | null
          owner_id: string
          phone: string | null
          postal_code: string | null
          revision: number
          search_text: string | null
          social_name: string | null
          state: string | null
          status: Database['public']['Enums']['patient_status']
          street: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: '*'
          to: 'patients'
          isOneToOne: false
          isSetofReturn: true
        }
      }
      set_attachment_status: {
        Args: {
          p_attachment_id: string
          p_status: Database['public']['Enums']['attachment_status']
        }
        Returns: {
          author_id: string
          created_at: string
          evolution_id: string | null
          id: string
          mime_type: string
          object_key: string
          original_name: string
          owner_id: string
          patient_id: string
          removed_at: string | null
          revision: number
          size_bytes: number
          status: Database['public']['Enums']['attachment_status']
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'attachments'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_patient_status: {
        Args: {
          p_expected_revision: number
          p_patient_id: string
          p_status: Database['public']['Enums']['patient_status']
        }
        Returns: {
          address_complement: string | null
          address_number: string | null
          archived_at: string | null
          birth_date: string
          city: string | null
          cpf: string | null
          created_at: string
          district: string | null
          email: string | null
          emergency_name: string | null
          emergency_phone: string | null
          emergency_relationship: string | null
          full_name: string
          gender_pronouns: string | null
          id: string
          notes: string | null
          occupation_school: string | null
          owner_id: string
          phone: string | null
          postal_code: string | null
          revision: number
          search_text: string | null
          social_name: string | null
          state: string | null
          status: Database['public']['Enums']['patient_status']
          street: string | null
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'patients'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_profile: {
        Args: {
          p_crp_number: string
          p_crp_state: string
          p_expected_revision: number
          p_full_name: string
        }
        Returns: {
          created_at: string
          crp_number: string
          crp_state: string
          email: string
          full_name: string
          id: string
          revision: number
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'profiles'
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      attachment_status: 'available' | 'removing' | 'removed'
      evolution_status: 'draft' | 'finalized'
      patient_status: 'active' | 'archived'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attachment_status: ['available', 'removing', 'removed'],
      evolution_status: ['draft', 'finalized'],
      patient_status: ['active', 'archived'],
    },
  },
} as const
