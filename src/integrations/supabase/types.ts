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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          platform: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          user_id?: string
        }
        Relationships: []
      }
      application_documents: {
        Row: {
          ai_analysis: Json | null
          application_id: string | null
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          uploaded_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          application_id?: string | null
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          uploaded_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          application_id?: string | null
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "provider_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      aroma_attendance: {
        Row: {
          break_end: string | null
          break_start: string | null
          clock_in: string | null
          clock_out: string | null
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          overtime_hours: number | null
          status: string | null
          total_hours: number | null
          updated_at: string
          work_date: string
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string
          work_date: string
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "aroma_attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "aroma_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      aroma_customers: {
        Row: {
          address: Json | null
          business_name: string | null
          business_type: string | null
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          default_price_type: string | null
          id: string
          is_active: boolean | null
          last_order_date: string | null
          notes: string | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          default_price_type?: string | null
          id?: string
          is_active?: boolean | null
          last_order_date?: string | null
          notes?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          default_price_type?: string | null
          id?: string
          is_active?: boolean | null
          last_order_date?: string | null
          notes?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      aroma_employees: {
        Row: {
          address: Json | null
          bank_details: Json | null
          created_at: string
          date_of_birth: string | null
          department: string
          email: string | null
          emergency_contact: Json | null
          employee_code: string
          employment_type: string | null
          first_name: string
          gender: string | null
          hire_date: string
          hourly_rate: number | null
          id: string
          last_name: string
          manager_id: string | null
          national_id: string | null
          notes: string | null
          phone: string | null
          position: string
          profile_image_url: string | null
          salary: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          bank_details?: Json | null
          created_at?: string
          date_of_birth?: string | null
          department: string
          email?: string | null
          emergency_contact?: Json | null
          employee_code: string
          employment_type?: string | null
          first_name: string
          gender?: string | null
          hire_date?: string
          hourly_rate?: number | null
          id?: string
          last_name: string
          manager_id?: string | null
          national_id?: string | null
          notes?: string | null
          phone?: string | null
          position: string
          profile_image_url?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          bank_details?: Json | null
          created_at?: string
          date_of_birth?: string | null
          department?: string
          email?: string | null
          emergency_contact?: Json | null
          employee_code?: string
          employment_type?: string | null
          first_name?: string
          gender?: string | null
          hire_date?: string
          hourly_rate?: number | null
          id?: string
          last_name?: string
          manager_id?: string | null
          national_id?: string | null
          notes?: string | null
          phone?: string | null
          position?: string
          profile_image_url?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aroma_employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "aroma_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      aroma_leaves: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          notes: string | null
          reason: string | null
          start_date: string
          status: string | null
          total_days: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id: string
          end_date: string
          id?: string
          leave_type: string
          notes?: string | null
          reason?: string | null
          start_date: string
          status?: string | null
          total_days: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          notes?: string | null
          reason?: string | null
          start_date?: string
          status?: string | null
          total_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aroma_leaves_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "aroma_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aroma_leaves_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "aroma_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      aroma_order_items: {
        Row: {
          created_at: string
          discount_amount: number | null
          id: string
          order_id: string
          price_type: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          id?: string
          order_id: string
          price_type?: string
          product_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          id?: string
          order_id?: string
          price_type?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "aroma_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "aroma_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aroma_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "aroma_products"
            referencedColumns: ["id"]
          },
        ]
      }
      aroma_orders: {
        Row: {
          created_at: string
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          delivery_address: string | null
          delivery_date: string | null
          discount_amount: number | null
          employee_id: string | null
          id: string
          notes: string | null
          order_date: string
          order_reference: string
          payment_method: string | null
          payment_status: string | null
          status: string
          subtotal: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          discount_amount?: number | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_reference: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          discount_amount?: number | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_reference?: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aroma_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "aroma_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aroma_orders_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "aroma_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      aroma_payroll: {
        Row: {
          basic_salary: number
          bonuses: number | null
          created_at: string
          deductions: number | null
          employee_id: string
          gross_pay: number
          id: string
          insurance_deduction: number | null
          net_pay: number
          notes: string | null
          overtime_pay: number | null
          pay_period_end: string
          pay_period_start: string
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          tax_deduction: number | null
          updated_at: string
        }
        Insert: {
          basic_salary?: number
          bonuses?: number | null
          created_at?: string
          deductions?: number | null
          employee_id: string
          gross_pay: number
          id?: string
          insurance_deduction?: number | null
          net_pay: number
          notes?: string | null
          overtime_pay?: number | null
          pay_period_end: string
          pay_period_start: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          tax_deduction?: number | null
          updated_at?: string
        }
        Update: {
          basic_salary?: number
          bonuses?: number | null
          created_at?: string
          deductions?: number | null
          employee_id?: string
          gross_pay?: number
          id?: string
          insurance_deduction?: number | null
          net_pay?: number
          notes?: string | null
          overtime_pay?: number | null
          pay_period_end?: string
          pay_period_start?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          tax_deduction?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aroma_payroll_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "aroma_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      aroma_products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          description_ar: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          min_stock: number | null
          name: string
          name_ar: string
          old_price: number | null
          price: number
          retail_price: number | null
          sku: string
          sort_order: number | null
          stock: number
          super_wholesale_price: number | null
          updated_at: string
          weight: string | null
          wholesale_price: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          min_stock?: number | null
          name: string
          name_ar: string
          old_price?: number | null
          price?: number
          retail_price?: number | null
          sku: string
          sort_order?: number | null
          stock?: number
          super_wholesale_price?: number | null
          updated_at?: string
          weight?: string | null
          wholesale_price?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          min_stock?: number | null
          name?: string
          name_ar?: string
          old_price?: number | null
          price?: number
          retail_price?: number | null
          sku?: string
          sort_order?: number | null
          stock?: number
          super_wholesale_price?: number | null
          updated_at?: string
          weight?: string | null
          wholesale_price?: number | null
        }
        Relationships: []
      }
      aroma_shifts: {
        Row: {
          break_duration: number | null
          created_at: string
          end_time: string
          id: string
          is_active: boolean | null
          name: string
          start_time: string
          updated_at: string
        }
        Insert: {
          break_duration?: number | null
          created_at?: string
          end_time: string
          id?: string
          is_active?: boolean | null
          name: string
          start_time: string
          updated_at?: string
        }
        Update: {
          break_duration?: number | null
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean | null
          name?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      aroma_work_schedules: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          shift_id: string
          status: string | null
          updated_at: string
          work_date: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          shift_id: string
          status?: string | null
          updated_at?: string
          work_date: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          shift_id?: string
          status?: string | null
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "aroma_work_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "aroma_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aroma_work_schedules_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "aroma_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_reply_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          platform: string
          reply_message: string
          reply_type: string
          trigger_keywords: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform: string
          reply_message: string
          reply_type: string
          trigger_keywords?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          reply_message?: string
          reply_type?: string
          trigger_keywords?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          description_ar: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          name_ar: string
          parent_id: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          name_ar: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          name_ar?: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string
          metadata: Json | null
          session_id: string
          severity: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type: string
          metadata?: Json | null
          session_id: string
          severity?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          session_id?: string
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          session_name: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          session_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          session_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      classified_messages: {
        Row: {
          auto_response_sent: boolean | null
          classification_type: string
          confidence_score: number | null
          created_at: string
          human_review_required: boolean | null
          id: string
          original_message: string
          processed_at: string | null
          sender_id: string
          translated_message: string | null
        }
        Insert: {
          auto_response_sent?: boolean | null
          classification_type: string
          confidence_score?: number | null
          created_at?: string
          human_review_required?: boolean | null
          id?: string
          original_message: string
          processed_at?: string | null
          sender_id: string
          translated_message?: string | null
        }
        Update: {
          auto_response_sent?: boolean | null
          classification_type?: string
          confidence_score?: number | null
          created_at?: string
          human_review_required?: boolean | null
          id?: string
          original_message?: string
          processed_at?: string | null
          sender_id?: string
          translated_message?: string | null
        }
        Relationships: []
      }
      clipdrop_accounts: {
        Row: {
          api_key_confirmed: boolean | null
          clipdrop_api_key: string | null
          clipdrop_token: string | null
          created_at: string
          email: string
          extracted_link: string | null
          id: string
          password: string
          remaining_credits: number | null
          updated_at: string
        }
        Insert: {
          api_key_confirmed?: boolean | null
          clipdrop_api_key?: string | null
          clipdrop_token?: string | null
          created_at?: string
          email: string
          extracted_link?: string | null
          id?: string
          password: string
          remaining_credits?: number | null
          updated_at?: string
        }
        Update: {
          api_key_confirmed?: boolean | null
          clipdrop_api_key?: string | null
          clipdrop_token?: string | null
          created_at?: string
          email?: string
          extracted_link?: string | null
          id?: string
          password?: string
          remaining_credits?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          comment_id: string
          commenter_id: string
          commenter_name: string | null
          content: string
          id: string
          platform: string
          post_id: string
          received_at: string
          replied: boolean | null
          replied_at: string | null
          reply_message: string | null
          user_id: string
        }
        Insert: {
          comment_id: string
          commenter_id: string
          commenter_name?: string | null
          content: string
          id?: string
          platform: string
          post_id: string
          received_at?: string
          replied?: boolean | null
          replied_at?: string | null
          reply_message?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string
          commenter_id?: string
          commenter_name?: string | null
          content?: string
          id?: string
          platform?: string
          post_id?: string
          received_at?: string
          replied?: boolean | null
          replied_at?: string | null
          reply_message?: string | null
          user_id?: string
        }
        Relationships: []
      }
      connected_accounts: {
        Row: {
          access_token: string
          account_id: string
          account_name: string
          connected_at: string
          id: string
          is_active: boolean | null
          page_id: string | null
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_id: string
          account_name: string
          connected_at?: string
          id?: string
          is_active?: boolean | null
          page_id?: string | null
          platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_id?: string
          account_name?: string
          connected_at?: string
          id?: string
          is_active?: boolean | null
          page_id?: string | null
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: Json | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string
          gender: string | null
          id: string
          is_active: boolean | null
          last_name: string
          last_purchase_date: string | null
          loyalty_points: number | null
          phone: string | null
          total_spent: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_name: string
          last_purchase_date?: string | null
          loyalty_points?: number | null
          phone?: string | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string
          last_purchase_date?: string | null
          loyalty_points?: number | null
          phone?: string | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      daily_sales: {
        Row: {
          created_at: string
          date: string
          efficiency_percentage: number | null
          id: string
          notes: string | null
          orders_count: number | null
          target_amount: number | null
          total_amount: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          efficiency_percentage?: number | null
          id?: string
          notes?: string | null
          orders_count?: number | null
          target_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          efficiency_percentage?: number | null
          id?: string
          notes?: string | null
          orders_count?: number | null
          target_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          admin_notes: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          bio: string | null
          consultation_fee: number | null
          created_at: string
          full_name: string
          id: string
          is_available: boolean | null
          license_number: string | null
          phone_number: string | null
          specialization: string
          updated_at: string
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          admin_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          full_name: string
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          phone_number?: string | null
          specialization: string
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          admin_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          full_name?: string
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          phone_number?: string | null
          specialization?: string
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      domains: {
        Row: {
          created_at: string
          description: string | null
          domain_name: string
          id: string
          is_active: boolean
          is_default: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain_name: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain_name?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          bio: string | null
          created_at: string
          full_name: string
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          license_number: string | null
          phone_number: string | null
          profile_image_url: string | null
          rating: number | null
          service_area: Json | null
          total_reviews: number | null
          updated_at: string
          user_id: string | null
          vehicle_model: string | null
          vehicle_type: string | null
          vehicle_year: number | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          created_at?: string
          full_name: string
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          rating?: number | null
          service_area?: Json | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          vehicle_model?: string | null
          vehicle_type?: string | null
          vehicle_year?: number | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          rating?: number | null
          service_area?: Json | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          vehicle_model?: string | null
          vehicle_type?: string | null
          vehicle_year?: number | null
        }
        Relationships: []
      }
      dz_dictionary: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          updated_at: string
          word_meaning: string
          word_original: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
          word_meaning: string
          word_original: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
          word_meaning?: string
          word_original?: string
        }
        Relationships: []
      }
      employee_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          name_ar: string
          permissions: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_ar: string
          permissions?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_ar?: string
          permissions?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          user_name: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          user_name: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          age: number | null
          allergies: string[] | null
          created_at: string
          created_by: string | null
          current_medications: string[] | null
          gender: string | null
          health_goals: string[] | null
          height: number | null
          id: string
          is_active: boolean
          medical_conditions: string[] | null
          notes: string | null
          patient_name: string
          symptoms: string[] | null
          updated_at: string
          user_identifier: string
          version: number
          weight: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string[] | null
          created_at?: string
          created_by?: string | null
          current_medications?: string[] | null
          gender?: string | null
          health_goals?: string[] | null
          height?: number | null
          id?: string
          is_active?: boolean
          medical_conditions?: string[] | null
          notes?: string | null
          patient_name: string
          symptoms?: string[] | null
          updated_at?: string
          user_identifier: string
          version?: number
          weight?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string[] | null
          created_at?: string
          created_by?: string | null
          current_medications?: string[] | null
          gender?: string | null
          health_goals?: string[] | null
          height?: number | null
          id?: string
          is_active?: boolean
          medical_conditions?: string[] | null
          notes?: string | null
          patient_name?: string
          symptoms?: string[] | null
          updated_at?: string
          user_identifier?: string
          version?: number
          weight?: number | null
        }
        Relationships: []
      }
      hero_settings: {
        Row: {
          created_at: string
          hero_subtitle: string
          hero_title: string
          id: string
          is_active: boolean
          phone_number: string
          selected_products: Json
          show_logo: boolean
          show_phone: boolean
          updated_at: string
          website_url: string
        }
        Insert: {
          created_at?: string
          hero_subtitle?: string
          hero_title?: string
          id?: string
          is_active?: boolean
          phone_number?: string
          selected_products?: Json
          show_logo?: boolean
          show_phone?: boolean
          updated_at?: string
          website_url?: string
        }
        Update: {
          created_at?: string
          hero_subtitle?: string
          hero_title?: string
          id?: string
          is_active?: boolean
          phone_number?: string
          selected_products?: Json
          show_logo?: boolean
          show_phone?: boolean
          updated_at?: string
          website_url?: string
        }
        Relationships: []
      }
      image_analysis: {
        Row: {
          analysis_results: Json
          analysis_type: string
          confidence_score: number | null
          created_at: string
          detected_elements: string[] | null
          id: string
          object_detections: Json | null
          operation_id: string | null
          segmentation_masks: Json | null
        }
        Insert: {
          analysis_results?: Json
          analysis_type: string
          confidence_score?: number | null
          created_at?: string
          detected_elements?: string[] | null
          id?: string
          object_detections?: Json | null
          operation_id?: string | null
          segmentation_masks?: Json | null
        }
        Update: {
          analysis_results?: Json
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string
          detected_elements?: string[] | null
          id?: string
          object_detections?: Json | null
          operation_id?: string | null
          segmentation_masks?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "image_analysis_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "image_operations"
            referencedColumns: ["id"]
          },
        ]
      }
      image_operations: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          operation_settings: Json | null
          operation_type: string
          original_image_url: string | null
          processed_image_url: string | null
          processing_time: number | null
          project_id: string | null
          prompt_text: string | null
          status: string
          translated_prompt: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          operation_settings?: Json | null
          operation_type: string
          original_image_url?: string | null
          processed_image_url?: string | null
          processing_time?: number | null
          project_id?: string | null
          prompt_text?: string | null
          status?: string
          translated_prompt?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          operation_settings?: Json | null
          operation_type?: string
          original_image_url?: string | null
          processed_image_url?: string | null
          processing_time?: number | null
          project_id?: string | null
          prompt_text?: string | null
          status?: string
          translated_prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_operations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "image_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      image_projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          project_type: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          project_type: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          project_type?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      instagram_comment_replies: {
        Row: {
          comment_id: string
          created_at: string
          domain_name: string | null
          id: string
          post_id: string | null
          replied_at: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          domain_name?: string | null
          id?: string
          post_id?: string | null
          replied_at?: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          domain_name?: string | null
          id?: string
          post_id?: string | null
          replied_at?: string
        }
        Relationships: []
      }
      instagram_comment_replies_dz: {
        Row: {
          comment_id: string
          created_at: string
          domain_name: string | null
          id: string
          post_id: string | null
          replied_at: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          domain_name?: string | null
          id?: string
          post_id?: string | null
          replied_at?: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          domain_name?: string | null
          id?: string
          post_id?: string | null
          replied_at?: string
        }
        Relationships: []
      }
      medical_consultations: {
        Row: {
          ai_diagnosis: string | null
          consultation_type: string | null
          created_at: string
          doctor_notes: string | null
          id: string
          patient_age: number | null
          patient_name: string
          scheduled_at: string | null
          status: string | null
          symptoms: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_diagnosis?: string | null
          consultation_type?: string | null
          created_at?: string
          doctor_notes?: string | null
          id?: string
          patient_age?: number | null
          patient_name: string
          scheduled_at?: string | null
          status?: string | null
          symptoms: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_diagnosis?: string | null
          consultation_type?: string | null
          created_at?: string
          doctor_notes?: string | null
          id?: string
          patient_age?: number | null
          patient_name?: string
          scheduled_at?: string | null
          status?: string | null
          symptoms?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      medical_service_requests: {
        Row: {
          accepted_at: string | null
          assigned_provider_id: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          diagnosis: string | null
          estimated_duration: number | null
          id: string
          notes: string | null
          patient_age: number | null
          patient_id: string | null
          patient_location: Json
          patient_name: string
          patient_phone: string
          payment_method: string | null
          payment_status: string | null
          preferred_time: string | null
          prescription: string | null
          provider_notes: string | null
          provider_type: string
          rating: number | null
          review_comment: string | null
          scheduled_at: string | null
          service_fee: number | null
          service_type: string
          started_at: string | null
          status: string | null
          symptoms: string | null
          total_amount: number | null
          transport_fee: number | null
          updated_at: string
          urgency_level: string | null
        }
        Insert: {
          accepted_at?: string | null
          assigned_provider_id?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          diagnosis?: string | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          patient_age?: number | null
          patient_id?: string | null
          patient_location: Json
          patient_name: string
          patient_phone: string
          payment_method?: string | null
          payment_status?: string | null
          preferred_time?: string | null
          prescription?: string | null
          provider_notes?: string | null
          provider_type: string
          rating?: number | null
          review_comment?: string | null
          scheduled_at?: string | null
          service_fee?: number | null
          service_type: string
          started_at?: string | null
          status?: string | null
          symptoms?: string | null
          total_amount?: number | null
          transport_fee?: number | null
          updated_at?: string
          urgency_level?: string | null
        }
        Update: {
          accepted_at?: string | null
          assigned_provider_id?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          diagnosis?: string | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          patient_age?: number | null
          patient_id?: string | null
          patient_location?: Json
          patient_name?: string
          patient_phone?: string
          payment_method?: string | null
          payment_status?: string | null
          preferred_time?: string | null
          prescription?: string | null
          provider_notes?: string | null
          provider_type?: string
          rating?: number | null
          review_comment?: string | null
          scheduled_at?: string | null
          service_fee?: number | null
          service_type?: string
          started_at?: string | null
          status?: string | null
          symptoms?: string | null
          total_amount?: number | null
          transport_fee?: number | null
          updated_at?: string
          urgency_level?: string | null
        }
        Relationships: []
      }
      message_classifications: {
        Row: {
          auto_response: boolean | null
          classification_type: string
          created_at: string
          id: string
          keywords: Json | null
          priority_level: number | null
          response_template: string | null
          updated_at: string
        }
        Insert: {
          auto_response?: boolean | null
          classification_type: string
          created_at?: string
          id?: string
          keywords?: Json | null
          priority_level?: number | null
          response_template?: string | null
          updated_at?: string
        }
        Update: {
          auto_response?: boolean | null
          classification_type?: string
          created_at?: string
          id?: string
          keywords?: Json | null
          priority_level?: number | null
          response_template?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          id: string
          message_id: string
          platform: string
          received_at: string
          replied: boolean | null
          replied_at: string | null
          reply_message: string | null
          sender_id: string
          sender_name: string | null
          user_id: string
        }
        Insert: {
          content: string
          id?: string
          message_id: string
          platform: string
          received_at?: string
          replied?: boolean | null
          replied_at?: string | null
          reply_message?: string | null
          sender_id: string
          sender_name?: string | null
          user_id: string
        }
        Update: {
          content?: string
          id?: string
          message_id?: string
          platform?: string
          received_at?: string
          replied?: boolean | null
          replied_at?: string | null
          reply_message?: string | null
          sender_id?: string
          sender_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          notification_type: string
          title: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          notification_type: string
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          notification_type?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      nurses: {
        Row: {
          admin_notes: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          bio: string | null
          created_at: string
          current_location: Json | null
          full_name: string
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          license_number: string | null
          phone_number: string | null
          profile_image_url: string | null
          rating: number | null
          service_radius: number | null
          specialization: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          admin_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          created_at?: string
          current_location?: Json | null
          full_name: string
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          rating?: number | null
          service_radius?: number | null
          specialization?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          admin_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          created_at?: string
          current_location?: Json | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          rating?: number | null
          service_radius?: number | null
          specialization?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          discount_amount: number | null
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_sku?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "supermarket_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "supermarket_products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          created_at: string
          id: string
          modified_by_name: string | null
          modified_by_username: string | null
          order_id: string
          order_reference: string
          previous_status: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          modified_by_name?: string | null
          modified_by_username?: string | null
          order_id: string
          order_reference: string
          previous_status?: string | null
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          modified_by_name?: string | null
          modified_by_username?: string | null
          order_id?: string
          order_reference?: string
          previous_status?: string | null
          status?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          discount_amount: number | null
          discount_percentage: number | null
          full_address: string | null
          full_name: string
          id: string
          modified_by_name: string | null
          modified_by_username: string | null
          notes: string | null
          order_reference: string | null
          original_amount: number | null
          phone_number: string
          product_id: string
          product_price: string
          product_title: string
          promo_code: string | null
          province: string
          quantity: number
          shipping_cost: number | null
          status: string | null
          telegram_message_id: number | null
          telegram_sent: boolean | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          full_address?: string | null
          full_name: string
          id?: string
          modified_by_name?: string | null
          modified_by_username?: string | null
          notes?: string | null
          order_reference?: string | null
          original_amount?: number | null
          phone_number: string
          product_id: string
          product_price: string
          product_title: string
          promo_code?: string | null
          province: string
          quantity?: number
          shipping_cost?: number | null
          status?: string | null
          telegram_message_id?: number | null
          telegram_sent?: boolean | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          full_address?: string | null
          full_name?: string
          id?: string
          modified_by_name?: string | null
          modified_by_username?: string | null
          notes?: string | null
          order_reference?: string | null
          original_amount?: number | null
          phone_number?: string
          product_id?: string
          product_price?: string
          product_title?: string
          promo_code?: string | null
          province?: string
          quantity?: number
          shipping_cost?: number | null
          status?: string | null
          telegram_message_id?: number | null
          telegram_sent?: boolean | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          allergies: string | null
          blood_type: string | null
          created_at: string
          current_medications: string | null
          date_of_birth: string | null
          default_location: Json | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          gender: string | null
          id: string
          insurance_info: Json | null
          medical_history: string | null
          phone_number: string | null
          profile_image_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          allergies?: string | null
          blood_type?: string | null
          created_at?: string
          current_medications?: string | null
          date_of_birth?: string | null
          default_location?: Json | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          gender?: string | null
          id?: string
          insurance_info?: Json | null
          medical_history?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          allergies?: string | null
          blood_type?: string | null
          created_at?: string
          current_medications?: string | null
          date_of_birth?: string | null
          default_location?: Json | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          insurance_info?: Json | null
          medical_history?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pending_edits: {
        Row: {
          chat_id: number
          created_at: string | null
          edit_message_id: number | null
          field: string
          field_name: string
          id: string
          order_id: string
          order_reference: string
          original_message_id: number | null
          updated_at: string | null
          user_id: number
        }
        Insert: {
          chat_id: number
          created_at?: string | null
          edit_message_id?: number | null
          field: string
          field_name: string
          id?: string
          order_id: string
          order_reference: string
          original_message_id?: number | null
          updated_at?: string | null
          user_id: number
        }
        Update: {
          chat_id?: number
          created_at?: string | null
          edit_message_id?: number | null
          field?: string
          field_name?: string
          id?: string
          order_id?: string
          order_reference?: string
          original_message_id?: number | null
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "pending_edits_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active_ingredients: Json | null
          brand: string | null
          category: string | null
          contraindications: string | null
          created_at: string
          description: string | null
          dosage: string | null
          flavor: string | null
          form: string | null
          gallery_images: Json | null
          health_benefits: Json | null
          health_category: string | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          indications: string | null
          key_benefits: string | null
          long_description: string | null
          main_image_url: string | null
          name: string | null
          nutrient_amounts: Json | null
          nutrients: Json | null
          price: string | null
          product_url: string | null
          scraped_at: string
          seo_keywords: Json | null
          short_description: string | null
          source_url: string | null
          stock: number | null
          sub_category: string | null
          tags: Json | null
          target_age_range: string | null
          target_audience: string | null
          target_gender: string | null
          target_symptoms: Json | null
          title: string
          updated_at: string
          user_id: string
          videos: Json | null
          warnings: string | null
        }
        Insert: {
          active_ingredients?: Json | null
          brand?: string | null
          category?: string | null
          contraindications?: string | null
          created_at?: string
          description?: string | null
          dosage?: string | null
          flavor?: string | null
          form?: string | null
          gallery_images?: Json | null
          health_benefits?: Json | null
          health_category?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          indications?: string | null
          key_benefits?: string | null
          long_description?: string | null
          main_image_url?: string | null
          name?: string | null
          nutrient_amounts?: Json | null
          nutrients?: Json | null
          price?: string | null
          product_url?: string | null
          scraped_at?: string
          seo_keywords?: Json | null
          short_description?: string | null
          source_url?: string | null
          stock?: number | null
          sub_category?: string | null
          tags?: Json | null
          target_age_range?: string | null
          target_audience?: string | null
          target_gender?: string | null
          target_symptoms?: Json | null
          title: string
          updated_at?: string
          user_id: string
          videos?: Json | null
          warnings?: string | null
        }
        Update: {
          active_ingredients?: Json | null
          brand?: string | null
          category?: string | null
          contraindications?: string | null
          created_at?: string
          description?: string | null
          dosage?: string | null
          flavor?: string | null
          form?: string | null
          gallery_images?: Json | null
          health_benefits?: Json | null
          health_category?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          indications?: string | null
          key_benefits?: string | null
          long_description?: string | null
          main_image_url?: string | null
          name?: string | null
          nutrient_amounts?: Json | null
          nutrients?: Json | null
          price?: string | null
          product_url?: string | null
          scraped_at?: string
          seo_keywords?: Json | null
          short_description?: string | null
          source_url?: string | null
          stock?: number | null
          sub_category?: string | null
          tags?: Json | null
          target_age_range?: string | null
          target_audience?: string | null
          target_gender?: string | null
          target_symptoms?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
          videos?: Json | null
          warnings?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: Json | null
          avatar_url: string | null
          created_at: string
          department: string | null
          employee_role_id: string | null
          full_name: string
          hire_date: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          role: string | null
          salary: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          employee_role_id?: string | null
          full_name: string
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: string | null
          salary?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          employee_role_id?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: string | null
          salary?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_employee_role_id_fkey"
            columns: ["employee_role_id"]
            isOneToOne: false
            referencedRelation: "employee_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          current_users: number
          discount_percentage: number
          expires_at: string
          featured_product_id: string | null
          id: string
          is_active: boolean
          max_users: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_users?: number
          discount_percentage: number
          expires_at: string
          featured_product_id?: string | null
          id?: string
          is_active?: boolean
          max_users?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_users?: number
          discount_percentage?: number
          expires_at?: string
          featured_product_id?: string | null
          id?: string
          is_active?: boolean
          max_users?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_featured_product_id_fkey"
            columns: ["featured_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_products: {
        Row: {
          created_at: string
          id: string
          product_id: string
          promo_code_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          promo_code_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          promo_code_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_promo_products_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_promo_products_promo_code"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_applications: {
        Row: {
          admin_notes: string | null
          ai_summary: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          license_number: string | null
          phone_number: string
          provider_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          specialization: string | null
          status: string | null
          updated_at: string
          user_id: string | null
          vehicle_info: Json | null
          years_experience: number | null
        }
        Insert: {
          admin_notes?: string | null
          ai_summary?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          license_number?: string | null
          phone_number: string
          provider_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialization?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          vehicle_info?: Json | null
          years_experience?: number | null
        }
        Update: {
          admin_notes?: string | null
          ai_summary?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          license_number?: string | null
          phone_number?: string
          provider_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialization?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          vehicle_info?: Json | null
          years_experience?: number | null
        }
        Relationships: []
      }
      provider_earnings: {
        Row: {
          amount: number
          commission_rate: number | null
          earned_at: string
          id: string
          net_amount: number
          paid_at: string | null
          payment_status: string | null
          provider_id: string
          provider_type: string
          service_request_id: string | null
        }
        Insert: {
          amount: number
          commission_rate?: number | null
          earned_at?: string
          id?: string
          net_amount: number
          paid_at?: string | null
          payment_status?: string | null
          provider_id: string
          provider_type: string
          service_request_id?: string | null
        }
        Update: {
          amount?: number
          commission_rate?: number | null
          earned_at?: string
          id?: string
          net_amount?: number
          paid_at?: string | null
          payment_status?: string | null
          provider_id?: string
          provider_type?: string
          service_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_earnings_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "medical_service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_locations: {
        Row: {
          current_location: Json
          id: string
          is_busy: boolean | null
          is_online: boolean | null
          last_update: string
          provider_id: string
          provider_type: string
        }
        Insert: {
          current_location: Json
          id?: string
          is_busy?: boolean | null
          is_online?: boolean | null
          last_update?: string
          provider_id: string
          provider_type: string
        }
        Update: {
          current_location?: Json
          id?: string
          is_busy?: boolean | null
          is_online?: boolean | null
          last_update?: string
          provider_id?: string
          provider_type?: string
        }
        Relationships: []
      }
      ready_products: {
        Row: {
          active_ingredients: Json | null
          brand: string | null
          category: string | null
          contraindications: string | null
          created_at: string
          description: string | null
          dosage: string | null
          flavor: string | null
          form: string | null
          gallery_images: Json | null
          health_benefits: Json | null
          health_category: string | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          indications: string | null
          key_benefits: string | null
          long_description: string | null
          main_image_url: string | null
          nutrient_amounts: Json | null
          nutrients: Json | null
          price: string
          product_url: string | null
          scheduled_product_id: string | null
          seo_keywords: Json | null
          short_description: string | null
          source_url: string | null
          status: string | null
          stock: number | null
          sub_category: string | null
          tags: Json | null
          target_age_range: string | null
          target_audience: string | null
          target_gender: string | null
          target_symptoms: Json | null
          title: string
          updated_at: string
          user_id: string | null
          videos: Json | null
          warnings: string | null
        }
        Insert: {
          active_ingredients?: Json | null
          brand?: string | null
          category?: string | null
          contraindications?: string | null
          created_at?: string
          description?: string | null
          dosage?: string | null
          flavor?: string | null
          form?: string | null
          gallery_images?: Json | null
          health_benefits?: Json | null
          health_category?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          indications?: string | null
          key_benefits?: string | null
          long_description?: string | null
          main_image_url?: string | null
          nutrient_amounts?: Json | null
          nutrients?: Json | null
          price: string
          product_url?: string | null
          scheduled_product_id?: string | null
          seo_keywords?: Json | null
          short_description?: string | null
          source_url?: string | null
          status?: string | null
          stock?: number | null
          sub_category?: string | null
          tags?: Json | null
          target_age_range?: string | null
          target_audience?: string | null
          target_gender?: string | null
          target_symptoms?: Json | null
          title: string
          updated_at?: string
          user_id?: string | null
          videos?: Json | null
          warnings?: string | null
        }
        Update: {
          active_ingredients?: Json | null
          brand?: string | null
          category?: string | null
          contraindications?: string | null
          created_at?: string
          description?: string | null
          dosage?: string | null
          flavor?: string | null
          form?: string | null
          gallery_images?: Json | null
          health_benefits?: Json | null
          health_category?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          indications?: string | null
          key_benefits?: string | null
          long_description?: string | null
          main_image_url?: string | null
          nutrient_amounts?: Json | null
          nutrients?: Json | null
          price?: string
          product_url?: string | null
          scheduled_product_id?: string | null
          seo_keywords?: Json | null
          short_description?: string | null
          source_url?: string | null
          status?: string | null
          stock?: number | null
          sub_category?: string | null
          tags?: Json | null
          target_age_range?: string | null
          target_audience?: string | null
          target_gender?: string | null
          target_symptoms?: Json | null
          title?: string
          updated_at?: string
          user_id?: string | null
          videos?: Json | null
          warnings?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_scheduled_product"
            columns: ["scheduled_product_id"]
            isOneToOne: false
            referencedRelation: "scheduled_products"
            referencedColumns: ["id"]
          },
        ]
      }
      request_messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string | null
          request_id: string | null
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          request_id?: string | null
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          request_id?: string | null
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "medical_service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_products: {
        Row: {
          created_at: string
          id: string
          image_url: string
          price: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          price: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          price?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      shipping: {
        Row: {
          assigned_to: string | null
          confirmed_by_name: string | null
          confirmed_by_username: string | null
          created_at: string
          id: string
          order_id: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          confirmed_by_name?: string | null
          confirmed_by_username?: string | null
          created_at?: string
          id?: string
          order_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          confirmed_by_name?: string | null
          confirmed_by_username?: string | null
          created_at?: string
          id?: string
          order_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      supermarket_orders: {
        Row: {
          created_at: string
          customer_address: Json | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          delivery_date: string | null
          delivery_fee: number | null
          delivery_time_slot: string | null
          discount_amount: number
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string
          processed_by: string | null
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_address?: Json | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          delivery_date?: string | null
          delivery_fee?: number | null
          delivery_time_slot?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string
          processed_by?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_address?: Json | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_date?: string | null
          delivery_fee?: number | null
          delivery_time_slot?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string
          processed_by?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supermarket_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      supermarket_products: {
        Row: {
          allergens: string[] | null
          barcode: string | null
          brand: string | null
          brand_ar: string | null
          category_id: string | null
          cost_price: number | null
          country_of_origin: string | null
          country_of_origin_ar: string | null
          created_at: string
          description: string | null
          description_ar: string | null
          discount_percentage: number | null
          expiry_date: string | null
          gallery_images: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          max_stock_level: number | null
          min_stock_level: number | null
          name: string
          name_ar: string
          nutritional_info: Json | null
          price: number
          sku: string
          stock_quantity: number
          storage_instructions: string | null
          storage_instructions_ar: string | null
          tax_rate: number | null
          unit: string
          unit_ar: string
          updated_at: string
          volume: number | null
          weight: number | null
        }
        Insert: {
          allergens?: string[] | null
          barcode?: string | null
          brand?: string | null
          brand_ar?: string | null
          category_id?: string | null
          cost_price?: number | null
          country_of_origin?: string | null
          country_of_origin_ar?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          discount_percentage?: number | null
          expiry_date?: string | null
          gallery_images?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          name: string
          name_ar: string
          nutritional_info?: Json | null
          price: number
          sku: string
          stock_quantity?: number
          storage_instructions?: string | null
          storage_instructions_ar?: string | null
          tax_rate?: number | null
          unit?: string
          unit_ar?: string
          updated_at?: string
          volume?: number | null
          weight?: number | null
        }
        Update: {
          allergens?: string[] | null
          barcode?: string | null
          brand?: string | null
          brand_ar?: string | null
          category_id?: string | null
          cost_price?: number | null
          country_of_origin?: string | null
          country_of_origin_ar?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          discount_percentage?: number | null
          expiry_date?: string | null
          gallery_images?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          name?: string
          name_ar?: string
          nutritional_info?: Json | null
          price?: number
          sku?: string
          stock_quantity?: number
          storage_instructions?: string | null
          storage_instructions_ar?: string | null
          tax_rate?: number | null
          unit?: string
          unit_ar?: string
          updated_at?: string
          volume?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supermarket_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          name_ar: string
          payment_terms: string | null
          phone: string | null
          rating: number | null
          tax_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_ar: string
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          tax_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_ar?: string
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          tax_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      targets: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean | null
          role_id: string | null
          start_date: string
          target_type: string
          target_unit: string | null
          target_value: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: string | null
          start_date: string
          target_type?: string
          target_unit?: string | null
          target_value: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: string | null
          start_date?: string
          target_type?: string
          target_unit?: string | null
          target_value?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "targets_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "employee_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_brands: {
        Row: {
          category: string | null
          country: string | null
          created_at: string
          description: string | null
          display_order: number | null
          founded_year: number | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          founded_year?: number | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          founded_year?: number | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_health_profiles: {
        Row: {
          age: number | null
          created_at: string
          extra_notes: string | null
          gender: string | null
          goal: string | null
          height: number | null
          id: string
          questionnaire_completed: boolean | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          extra_notes?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          questionnaire_completed?: boolean | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string
          extra_notes?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          questionnaire_completed?: boolean | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_image_preferences: {
        Row: {
          auto_translate: boolean | null
          created_at: string
          default_image_style: string | null
          id: string
          preferred_language: string | null
          quality_settings: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          auto_translate?: boolean | null
          created_at?: string
          default_image_style?: string | null
          id?: string
          preferred_language?: string | null
          quality_settings?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          auto_translate?: boolean | null
          created_at?: string
          default_image_style?: string | null
          id?: string
          preferred_language?: string | null
          quality_settings?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          instagram_url: string
          is_active: boolean
          likes: number
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          instagram_url: string
          is_active?: boolean
          likes?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          instagram_url?: string
          is_active?: boolean
          likes?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhook_settings: {
        Row: {
          created_at: string
          description: string | null
          domain_id: string | null
          id: string
          is_active: boolean
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain_id?: string | null
          id?: string
          is_active?: boolean
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain_id?: string | null
          id?: string
          is_active?: boolean
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_settings_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_settings_dz: {
        Row: {
          created_at: string
          domain_id: string | null
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain_id?: string | null
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain_id?: string | null
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_settings_dz_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_delivery_date: {
        Args: { order_date?: string }
        Returns: string
      }
      calculate_provider_earnings: {
        Args: {
          p_period?: string
          p_provider_id: string
          p_provider_type: string
        }
        Returns: {
          paid_amount: number
          pending_amount: number
          total_earnings: number
          total_services: number
        }[]
      }
      cleanup_old_pending_edits: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_image_project: {
        Args: {
          p_description?: string
          p_project_type?: string
          p_title: string
        }
        Returns: string
      }
      generate_aroma_employee_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_aroma_order_reference: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_order_reference: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_sm_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_health_record: {
        Args: { p_user_identifier: string }
        Returns: {
          age: number
          allergies: string[]
          created_at: string
          current_medications: string[]
          gender: string
          health_goals: string[]
          height: number
          id: string
          medical_conditions: string[]
          notes: string
          patient_name: string
          symptoms: string[]
          version: number
          weight: number
        }[]
      }
      get_working_image_editor_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      log_image_operation: {
        Args: {
          p_operation_settings?: Json
          p_operation_type: string
          p_original_image_url?: string
          p_project_id: string
          p_prompt_text?: string
        }
        Returns: string
      }
      save_image_analysis: {
        Args: {
          p_analysis_results: Json
          p_analysis_type: string
          p_confidence_score?: number
          p_detected_elements?: string[]
          p_operation_id: string
        }
        Returns: string
      }
      update_operation_status: {
        Args: {
          p_error_message?: string
          p_operation_id: string
          p_processed_image_url?: string
          p_status: string
        }
        Returns: undefined
      }
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
