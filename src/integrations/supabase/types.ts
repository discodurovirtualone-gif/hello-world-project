export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      registros_basicos: {
        Row: {
          created_at: string
          edad: number | null
          ejercicio: string
          fecha_nacimiento: string | null
          id: string
          id_vaca: string
          lactancia: number
          partos: string
          potencial_vaca: string | null
          raza: string
        }
        Insert: {
          created_at?: string
          edad?: number | null
          ejercicio?: string
          fecha_nacimiento?: string | null
          id?: string
          id_vaca: string
          lactancia: number
          partos?: string
          potencial_vaca?: string | null
          raza?: string
        }
        Update: {
          created_at?: string
          edad?: number | null
          ejercicio?: string
          fecha_nacimiento?: string | null
          id?: string
          id_vaca?: string
          lactancia?: number
          partos?: string
          potencial_vaca?: string | null
          raza?: string
        }
        Relationships: []
      }
      registros_otros: {
        Row: {
          created_at: string
          ejercicio: string
          fac_parto: number | null
          fortaleza_patas: number | null
          id: string
          id_vaca: string
          longevidad: number | null
          mastitis: number | null
          renguera: number | null
        }
        Insert: {
          created_at?: string
          ejercicio?: string
          fac_parto?: number | null
          fortaleza_patas?: number | null
          id?: string
          id_vaca: string
          longevidad?: number | null
          mastitis?: number | null
          renguera?: number | null
        }
        Update: {
          created_at?: string
          ejercicio?: string
          fac_parto?: number | null
          fortaleza_patas?: number | null
          id?: string
          id_vaca?: string
          longevidad?: number | null
          mastitis?: number | null
          renguera?: number | null
        }
        Relationships: []
      }
      registros_productivos: {
        Row: {
          created_at: string
          ejercicio: string
          id: string
          id_vaca: string
          lact1: number | null
          lact2: number | null
          lact3: number | null
          lact4: number | null
          lact5: number | null
          lc305_wood: number | null
          porcentaje_grasa: number | null
          porcentaje_proteina: number | null
          reg_1_dia30: number | null
          reg_2_dia120: number | null
          reg_3_dia210: number | null
          reg_4_dia270: number | null
        }
        Insert: {
          created_at?: string
          ejercicio?: string
          id?: string
          id_vaca: string
          lact1?: number | null
          lact2?: number | null
          lact3?: number | null
          lact4?: number | null
          lact5?: number | null
          lc305_wood?: number | null
          porcentaje_grasa?: number | null
          porcentaje_proteina?: number | null
          reg_1_dia30?: number | null
          reg_2_dia120?: number | null
          reg_3_dia210?: number | null
          reg_4_dia270?: number | null
        }
        Update: {
          created_at?: string
          ejercicio?: string
          id?: string
          id_vaca?: string
          lact1?: number | null
          lact2?: number | null
          lact3?: number | null
          lact4?: number | null
          lact5?: number | null
          lc305_wood?: number | null
          porcentaje_grasa?: number | null
          porcentaje_proteina?: number | null
          reg_1_dia30?: number | null
          reg_2_dia120?: number | null
          reg_3_dia210?: number | null
          reg_4_dia270?: number | null
        }
        Relationships: []
      }
      registros_reproductivos: {
        Row: {
          aborto1: string | null
          aborto2: string | null
          concepcion1: string | null
          created_at: string
          ejercicio: string
          id: string
          id_vaca: string
          iip: number | null
          ipc: number | null
          parto: string | null
          parto1: string | null
          raza: string | null
          serv_conc: number | null
          servicio1: string | null
          servicio2: string | null
          servicio3: string | null
          toro_usado: string | null
        }
        Insert: {
          aborto1?: string | null
          aborto2?: string | null
          concepcion1?: string | null
          created_at?: string
          ejercicio?: string
          id?: string
          id_vaca: string
          iip?: number | null
          ipc?: number | null
          parto?: string | null
          parto1?: string | null
          raza?: string | null
          serv_conc?: number | null
          servicio1?: string | null
          servicio2?: string | null
          servicio3?: string | null
          toro_usado?: string | null
        }
        Update: {
          aborto1?: string | null
          aborto2?: string | null
          concepcion1?: string | null
          created_at?: string
          ejercicio?: string
          id?: string
          id_vaca?: string
          iip?: number | null
          ipc?: number | null
          parto?: string | null
          parto1?: string | null
          raza?: string | null
          serv_conc?: number | null
          servicio1?: string | null
          servicio2?: string | null
          servicio3?: string | null
          toro_usado?: string | null
        }
        Relationships: []
      }
      toros: {
        Row: {
          caracteristicas: string | null
          created_at: string
          dep_grasa: number | null
          dep_leche: number | null
          dep_prot: number | null
          dep_tph: number | null
          id: string
          id_toro: string
          indice_inia: number | null
          indice_rovere: number | null
          nombre: string | null
          precio_dosis: number | null
        }
        Insert: {
          caracteristicas?: string | null
          created_at?: string
          dep_grasa?: number | null
          dep_leche?: number | null
          dep_prot?: number | null
          dep_tph?: number | null
          id?: string
          id_toro: string
          indice_inia?: number | null
          indice_rovere?: number | null
          nombre?: string | null
          precio_dosis?: number | null
        }
        Update: {
          caracteristicas?: string | null
          created_at?: string
          dep_grasa?: number | null
          dep_leche?: number | null
          dep_prot?: number | null
          dep_tph?: number | null
          id?: string
          id_toro?: string
          indice_inia?: number | null
          indice_rovere?: number | null
          nombre?: string | null
          precio_dosis?: number | null
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
