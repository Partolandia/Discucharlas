// Generado por scripts/generar-tipos.mjs desde el esquema real. No editar a mano.
// Regenerar con: npm run tipos

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
    admin_audit_log: {
      Row: {
        id: string,
        actor_id: string | null,
        action: string,
        entity_type: string | null,
        entity_id: string | null,
        detail: Json | null,
        created_at: string
      }
      Insert: {
        id?: string,
        actor_id?: string | null,
        action: string,
        entity_type?: string | null,
        entity_id?: string | null,
        detail?: Json | null,
        created_at?: string
      }
      Update: {
        id?: string,
        actor_id?: string | null,
        action?: string,
        entity_type?: string | null,
        entity_id?: string | null,
        detail?: Json | null,
        created_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "admin_audit_log_actor_id_fkey"
          columns: ["actor_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    club_settings: {
      Row: {
        id: boolean,
        timezone: string,
        invitation_expiry_days_before: number,
        invitation_fallback_days: number,
        updated_at: string
      }
      Insert: {
        id?: boolean,
        timezone?: string,
        invitation_expiry_days_before?: number,
        invitation_fallback_days?: number,
        updated_at?: string
      }
      Update: {
        id?: boolean,
        timezone?: string,
        invitation_expiry_days_before?: number,
        invitation_fallback_days?: number,
        updated_at?: string
      }
      Relationships: []
    }
    community_reactions: {
      Row: {
        id: string,
        thread_id: string | null,
        reply_id: string | null,
        user_id: string,
        reaction_type: string,
        created_at: string
      }
      Insert: {
        id?: string,
        thread_id?: string | null,
        reply_id?: string | null,
        user_id: string,
        reaction_type?: string,
        created_at?: string
      }
      Update: {
        id?: string,
        thread_id?: string | null,
        reply_id?: string | null,
        user_id?: string,
        reaction_type?: string,
        created_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "community_reactions_reply_id_fkey"
          columns: ["reply_id"]
          referencedRelation: "community_replies"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "community_reactions_thread_id_fkey"
          columns: ["thread_id"]
          referencedRelation: "community_threads"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "community_reactions_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    community_replies: {
      Row: {
        id: string,
        thread_id: string,
        user_id: string,
        body: string,
        created_at: string,
        updated_at: string,
        deleted_at: string | null
      }
      Insert: {
        id?: string,
        thread_id: string,
        user_id: string,
        body: string,
        created_at?: string,
        updated_at?: string,
        deleted_at?: string | null
      }
      Update: {
        id?: string,
        thread_id?: string,
        user_id?: string,
        body?: string,
        created_at?: string,
        updated_at?: string,
        deleted_at?: string | null
      }
      Relationships: [
        {
          foreignKeyName: "community_replies_thread_id_fkey"
          columns: ["thread_id"]
          referencedRelation: "community_threads"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "community_replies_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    community_threads: {
      Row: {
        id: string,
        user_id: string,
        title: string | null,
        body: string,
        created_at: string,
        updated_at: string,
        deleted_at: string | null
      }
      Insert: {
        id?: string,
        user_id: string,
        title?: string | null,
        body: string,
        created_at?: string,
        updated_at?: string,
        deleted_at?: string | null
      }
      Update: {
        id?: string,
        user_id?: string,
        title?: string | null,
        body?: string,
        created_at?: string,
        updated_at?: string,
        deleted_at?: string | null
      }
      Relationships: [
        {
          foreignKeyName: "community_threads_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    email_deliveries: {
      Row: {
        id: string,
        user_id: string | null,
        recipient_email: string,
        type: string,
        provider_id: string | null,
        status: string,
        error: string | null,
        entity_type: string | null,
        entity_id: string | null,
        sent_at: string | null,
        created_at: string
      }
      Insert: {
        id?: string,
        user_id?: string | null,
        recipient_email: string,
        type: string,
        provider_id?: string | null,
        status?: string,
        error?: string | null,
        entity_type?: string | null,
        entity_id?: string | null,
        sent_at?: string | null,
        created_at?: string
      }
      Update: {
        id?: string,
        user_id?: string | null,
        recipient_email?: string,
        type?: string,
        provider_id?: string | null,
        status?: string,
        error?: string | null,
        entity_type?: string | null,
        entity_id?: string | null,
        sent_at?: string | null,
        created_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "email_deliveries_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    guest_access: {
      Row: {
        id: string,
        code_hash: string,
        label: string | null,
        status: string,
        created_by: string | null,
        created_at: string,
        revoked_at: string | null
      }
      Insert: {
        id?: string,
        code_hash: string,
        label?: string | null,
        status?: string,
        created_by?: string | null,
        created_at?: string,
        revoked_at?: string | null
      }
      Update: {
        id?: string,
        code_hash?: string,
        label?: string | null,
        status?: string,
        created_by?: string | null,
        created_at?: string,
        revoked_at?: string | null
      }
      Relationships: [
        {
          foreignKeyName: "guest_access_created_by_fkey"
          columns: ["created_by"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    guide_sections: {
      Row: {
        id: string,
        key: string,
        title: string,
        body: string,
        sort_order: number,
        updated_by: string | null,
        updated_at: string
      }
      Insert: {
        id?: string,
        key: string,
        title: string,
        body?: string,
        sort_order?: number,
        updated_by?: string | null,
        updated_at?: string
      }
      Update: {
        id?: string,
        key?: string,
        title?: string,
        body?: string,
        sort_order?: number,
        updated_by?: string | null,
        updated_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "guide_sections_updated_by_fkey"
          columns: ["updated_by"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    member_invitations: {
      Row: {
        id: string,
        request_id: string | null,
        invitee_name: string,
        invitee_email: string,
        token_hash: string,
        status: string,
        created_by: string | null,
        used_by: string | null,
        created_at: string,
        used_at: string | null,
        revoked_at: string | null,
        expires_at: string | null
      }
      Insert: {
        id?: string,
        request_id?: string | null,
        invitee_name: string,
        invitee_email: string,
        token_hash: string,
        status?: string,
        created_by?: string | null,
        used_by?: string | null,
        created_at?: string,
        used_at?: string | null,
        revoked_at?: string | null,
        expires_at?: string | null
      }
      Update: {
        id?: string,
        request_id?: string | null,
        invitee_name?: string,
        invitee_email?: string,
        token_hash?: string,
        status?: string,
        created_by?: string | null,
        used_by?: string | null,
        created_at?: string,
        used_at?: string | null,
        revoked_at?: string | null,
        expires_at?: string | null
      }
      Relationships: [
        {
          foreignKeyName: "member_invitations_created_by_fkey"
          columns: ["created_by"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "member_invitations_request_id_fkey"
          columns: ["request_id"]
          referencedRelation: "member_requests"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "member_invitations_used_by_fkey"
          columns: ["used_by"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    member_requests: {
      Row: {
        id: string,
        proposed_by: string | null,
        invitee_name: string,
        invitee_email: string | null,
        note: string | null,
        status: string,
        reviewed_by: string | null,
        reviewed_at: string | null,
        created_at: string
      }
      Insert: {
        id?: string,
        proposed_by?: string | null,
        invitee_name: string,
        invitee_email?: string | null,
        note?: string | null,
        status?: string,
        reviewed_by?: string | null,
        reviewed_at?: string | null,
        created_at?: string
      }
      Update: {
        id?: string,
        proposed_by?: string | null,
        invitee_name?: string,
        invitee_email?: string | null,
        note?: string | null,
        status?: string,
        reviewed_by?: string | null,
        reviewed_at?: string | null,
        created_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "member_requests_proposed_by_fkey"
          columns: ["proposed_by"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "member_requests_reviewed_by_fkey"
          columns: ["reviewed_by"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    notifications: {
      Row: {
        id: string,
        user_id: string,
        type: string,
        title: string,
        body: string | null,
        entity_type: string | null,
        entity_id: string | null,
        read_at: string | null,
        created_at: string
      }
      Insert: {
        id?: string,
        user_id: string,
        type: string,
        title: string,
        body?: string | null,
        entity_type?: string | null,
        entity_id?: string | null,
        read_at?: string | null,
        created_at?: string
      }
      Update: {
        id?: string,
        user_id?: string,
        type?: string,
        title?: string,
        body?: string | null,
        entity_type?: string | null,
        entity_id?: string | null,
        read_at?: string | null,
        created_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "notifications_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    podcast_proposals: {
      Row: {
        id: string,
        proposed_by: string | null,
        episode_title: string,
        podcast_name: string,
        episode_url: string | null,
        duration: string | null,
        description: string | null,
        image_path: string | null,
        status: string,
        created_at: string,
        updated_at: string
      }
      Insert: {
        id?: string,
        proposed_by?: string | null,
        episode_title: string,
        podcast_name: string,
        episode_url?: string | null,
        duration?: string | null,
        description?: string | null,
        image_path?: string | null,
        status?: string,
        created_at?: string,
        updated_at?: string
      }
      Update: {
        id?: string,
        proposed_by?: string | null,
        episode_title?: string,
        podcast_name?: string,
        episode_url?: string | null,
        duration?: string | null,
        description?: string | null,
        image_path?: string | null,
        status?: string,
        created_at?: string,
        updated_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "podcast_proposals_proposed_by_fkey"
          columns: ["proposed_by"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    profiles: {
      Row: {
        id: string,
        first_name: string,
        last_name: string,
        email: string,
        phone: string | null,
        birthday_day: number | null,
        birthday_month: number | null,
        bio: string | null,
        interests: string | null,
        avatar_path: string | null,
        role: string,
        status: string,
        email_notifications: boolean,
        created_at: string,
        updated_at: string,
        is_owner: boolean
      }
      Insert: {
        id: string,
        first_name: string,
        last_name?: string,
        email: string,
        phone?: string | null,
        birthday_day?: number | null,
        birthday_month?: number | null,
        bio?: string | null,
        interests?: string | null,
        avatar_path?: string | null,
        role?: string,
        status?: string,
        email_notifications?: boolean,
        created_at?: string,
        updated_at?: string,
        is_owner?: boolean
      }
      Update: {
        id?: string,
        first_name?: string,
        last_name?: string,
        email?: string,
        phone?: string | null,
        birthday_day?: number | null,
        birthday_month?: number | null,
        bio?: string | null,
        interests?: string | null,
        avatar_path?: string | null,
        role?: string,
        status?: string,
        email_notifications?: boolean,
        created_at?: string,
        updated_at?: string,
        is_owner?: boolean
      }
      Relationships: [
        {
          foreignKeyName: "profiles_id_fkey"
          columns: ["id"]
          referencedRelation: "users"
          referencedColumns: ["id"]
        }
      ]
    }
    session_attendance: {
      Row: {
        session_id: string,
        user_id: string,
        present: boolean,
        recorded_by: string | null,
        updated_at: string
      }
      Insert: {
        session_id: string,
        user_id: string,
        present?: boolean,
        recorded_by?: string | null,
        updated_at?: string
      }
      Update: {
        session_id?: string,
        user_id?: string,
        present?: boolean,
        recorded_by?: string | null,
        updated_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "session_attendance_recorded_by_fkey"
          columns: ["recorded_by"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "session_attendance_session_id_fkey"
          columns: ["session_id"]
          referencedRelation: "sessions"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "session_attendance_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    session_bring_selections: {
      Row: {
        id: string,
        session_id: string,
        user_id: string,
        category: string,
        detail: string | null,
        created_at: string,
        updated_at: string
      }
      Insert: {
        id?: string,
        session_id: string,
        user_id: string,
        category: string,
        detail?: string | null,
        created_at?: string,
        updated_at?: string
      }
      Update: {
        id?: string,
        session_id?: string,
        user_id?: string,
        category?: string,
        detail?: string | null,
        created_at?: string,
        updated_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "session_bring_selections_session_id_fkey"
          columns: ["session_id"]
          referencedRelation: "sessions"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "session_bring_selections_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    session_comments: {
      Row: {
        id: string,
        session_id: string,
        user_id: string,
        body: string,
        created_at: string,
        updated_at: string,
        deleted_at: string | null
      }
      Insert: {
        id?: string,
        session_id: string,
        user_id: string,
        body: string,
        created_at?: string,
        updated_at?: string,
        deleted_at?: string | null
      }
      Update: {
        id?: string,
        session_id?: string,
        user_id?: string,
        body?: string,
        created_at?: string,
        updated_at?: string,
        deleted_at?: string | null
      }
      Relationships: [
        {
          foreignKeyName: "session_comments_session_id_fkey"
          columns: ["session_id"]
          referencedRelation: "sessions"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "session_comments_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    session_materials: {
      Row: {
        id: string,
        session_id: string,
        user_id: string,
        type: string,
        title: string,
        url_or_path: string,
        mime_type: string | null,
        created_at: string
      }
      Insert: {
        id?: string,
        session_id: string,
        user_id: string,
        type: string,
        title: string,
        url_or_path: string,
        mime_type?: string | null,
        created_at?: string
      }
      Update: {
        id?: string,
        session_id?: string,
        user_id?: string,
        type?: string,
        title?: string,
        url_or_path?: string,
        mime_type?: string | null,
        created_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "session_materials_session_id_fkey"
          columns: ["session_id"]
          referencedRelation: "sessions"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "session_materials_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    session_private_notes: {
      Row: {
        session_id: string,
        user_id: string,
        note: string,
        updated_at: string
      }
      Insert: {
        session_id: string,
        user_id: string,
        note?: string,
        updated_at?: string
      }
      Update: {
        session_id?: string,
        user_id?: string,
        note?: string,
        updated_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "session_private_notes_session_id_fkey"
          columns: ["session_id"]
          referencedRelation: "sessions"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "session_private_notes_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    session_ratings: {
      Row: {
        session_id: string,
        user_id: string,
        rating: number,
        updated_at: string
      }
      Insert: {
        session_id: string,
        user_id: string,
        rating: number,
        updated_at?: string
      }
      Update: {
        session_id?: string,
        user_id?: string,
        rating?: number,
        updated_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "session_ratings_session_id_fkey"
          columns: ["session_id"]
          referencedRelation: "sessions"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "session_ratings_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    session_rsvps: {
      Row: {
        session_id: string,
        user_id: string,
        response: string,
        updated_at: string
      }
      Insert: {
        session_id: string,
        user_id: string,
        response: string,
        updated_at?: string
      }
      Update: {
        session_id?: string,
        user_id?: string,
        response?: string,
        updated_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "session_rsvps_session_id_fkey"
          columns: ["session_id"]
          referencedRelation: "sessions"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "session_rsvps_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    sessions: {
      Row: {
        id: string,
        human_id: string,
        episode_title: string,
        podcast_name: string,
        episode_url: string | null,
        image_path: string | null,
        date: string | null,
        start_time: string | null,
        end_time: string | null,
        place: string | null,
        status: string,
        summary: string | null,
        created_by: string | null,
        created_at: string,
        updated_at: string
      }
      Insert: {
        id?: string,
        human_id?: string,
        episode_title: string,
        podcast_name: string,
        episode_url?: string | null,
        image_path?: string | null,
        date?: string | null,
        start_time?: string | null,
        end_time?: string | null,
        place?: string | null,
        status?: string,
        summary?: string | null,
        created_by?: string | null,
        created_at?: string,
        updated_at?: string
      }
      Update: {
        id?: string,
        human_id?: string,
        episode_title?: string,
        podcast_name?: string,
        episode_url?: string | null,
        image_path?: string | null,
        date?: string | null,
        start_time?: string | null,
        end_time?: string | null,
        place?: string | null,
        status?: string,
        summary?: string | null,
        created_by?: string | null,
        created_at?: string,
        updated_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "sessions_created_by_fkey"
          columns: ["created_by"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]
    }
    votes: {
      Row: {
        voting_round_id: string,
        proposal_id: string,
        user_id: string,
        created_at: string
      }
      Insert: {
        voting_round_id: string,
        proposal_id: string,
        user_id: string,
        created_at?: string
      }
      Update: {
        voting_round_id?: string,
        proposal_id?: string,
        user_id?: string,
        created_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "votes_proposal_id_fkey"
          columns: ["proposal_id"]
          referencedRelation: "podcast_proposals"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "votes_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "votes_voting_round_id_fkey"
          columns: ["voting_round_id"]
          referencedRelation: "voting_rounds"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "votes_voting_round_id_proposal_id_fkey"
          columns: ["voting_round_id", "proposal_id"]
          referencedRelation: "voting_candidates"
          referencedColumns: ["voting_round_id", "proposal_id"]
        }
      ]
    }
    voting_candidates: {
      Row: {
        voting_round_id: string,
        proposal_id: string,
        added_by: string | null,
        created_at: string
      }
      Insert: {
        voting_round_id: string,
        proposal_id: string,
        added_by?: string | null,
        created_at?: string
      }
      Update: {
        voting_round_id?: string,
        proposal_id?: string,
        added_by?: string | null,
        created_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "voting_candidates_added_by_fkey"
          columns: ["added_by"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "voting_candidates_proposal_id_fkey"
          columns: ["proposal_id"]
          referencedRelation: "podcast_proposals"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "voting_candidates_voting_round_id_fkey"
          columns: ["voting_round_id"]
          referencedRelation: "voting_rounds"
          referencedColumns: ["id"]
        }
      ]
    }
    voting_rounds: {
      Row: {
        id: string,
        title: string | null,
        status: string,
        opened_by: string | null,
        opened_at: string | null,
        closes_at: string | null,
        closed_at: string | null,
        closed_by: string | null,
        winning_proposal_id: string | null,
        override_by: string | null,
        override_note: string | null,
        created_at: string,
        updated_at: string
      }
      Insert: {
        id?: string,
        title?: string | null,
        status?: string,
        opened_by?: string | null,
        opened_at?: string | null,
        closes_at?: string | null,
        closed_at?: string | null,
        closed_by?: string | null,
        winning_proposal_id?: string | null,
        override_by?: string | null,
        override_note?: string | null,
        created_at?: string,
        updated_at?: string
      }
      Update: {
        id?: string,
        title?: string | null,
        status?: string,
        opened_by?: string | null,
        opened_at?: string | null,
        closes_at?: string | null,
        closed_at?: string | null,
        closed_by?: string | null,
        winning_proposal_id?: string | null,
        override_by?: string | null,
        override_note?: string | null,
        created_at?: string,
        updated_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "voting_rounds_closed_by_fkey"
          columns: ["closed_by"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "voting_rounds_opened_by_fkey"
          columns: ["opened_by"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "voting_rounds_override_by_fkey"
          columns: ["override_by"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "voting_rounds_winning_proposal_id_fkey"
          columns: ["winning_proposal_id"]
          referencedRelation: "podcast_proposals"
          referencedColumns: ["id"]
        }
      ]
    }
    }
    Views: {
    invitation_status: {
      Row: {
        id: string | null,
        request_id: string | null,
        invitee_name: string | null,
        invitee_email: string | null,
        token_hash: string | null,
        status: string | null,
        created_by: string | null,
        used_by: string | null,
        created_at: string | null,
        used_at: string | null,
        revoked_at: string | null,
        expires_at: string | null,
        effective_status: string | null
      }
      Relationships: []
    }
    member_directory: {
      Row: {
        id: string | null,
        first_name: string | null,
        last_name: string | null,
        bio: string | null,
        interests: string | null,
        avatar_path: string | null,
        role: string | null,
        status: string | null,
        birthday_day: number | null,
        birthday_month: number | null,
        created_at: string | null
      }
      Relationships: []
    }
    session_stats: {
      Row: {
        session_id: string | null,
        average_rating: number | null,
        rating_count: number | null,
        comment_count: number | null,
        attendee_count: number | null,
        rsvp_yes_count: number | null
      }
      Relationships: []
    }
    voting_results: {
      Row: {
        voting_round_id: string | null,
        proposal_id: string | null,
        vote_count: number | null
      }
      Relationships: []
    }
    }
    Functions: {
    activate_session: {
      Args: {
        p_session_id: string
      }
      Returns: undefined
    }
    active_admin_count: {
      Args: Record<PropertyKey, never>
      Returns: number
    }
    close_voting_round: {
      Args: {
        p_round_id: string
        p_override_proposal_id?: string
        p_override_note?: string
      }
      Returns: string
    }
    default_invitation_expiry: {
      Args: Record<PropertyKey, never>
      Returns: string
    }
    is_active_member: {
      Args: Record<PropertyKey, never>
      Returns: boolean
    }
    is_admin: {
      Args: Record<PropertyKey, never>
      Returns: boolean
    }
    is_owner: {
      Args: Record<PropertyKey, never>
      Returns: boolean
    }
    notify_all_members: {
      Args: {
        p_type: string
        p_title: string
        p_body: string
        p_entity_type?: string
        p_entity_id?: string
        p_exclude?: string
      }
      Returns: number
    }
    open_voting_round: {
      Args: {
        p_round_id: string
        p_closes_at?: string
      }
      Returns: undefined
    }
    set_member_role: {
      Args: {
        target_id: string
        new_role: string
      }
      Returns: undefined
    }
    set_member_status: {
      Args: {
        target_id: string
        new_status: string
      }
      Returns: undefined
    }
    transfer_ownership: {
      Args: {
        target_id: string
      }
      Returns: undefined
    }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type Publico = Database["public"]

export type Tabla<N extends keyof Publico["Tables"]> = Publico["Tables"][N]["Row"]
export type Insertar<N extends keyof Publico["Tables"]> = Publico["Tables"][N]["Insert"]
export type Actualizar<N extends keyof Publico["Tables"]> = Publico["Tables"][N]["Update"]
export type Vista<N extends keyof Publico["Views"]> = Publico["Views"][N]["Row"]
