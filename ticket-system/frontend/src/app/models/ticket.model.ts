export interface Ticket {
  id: number
  title: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  created_by: number
  created_by_username: string
  assigned_to?: number
  assigned_to_username?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  comments: Comment[]
}

export interface Comment {
  id: number
  ticket: number
  user: number
  user_username: string
  content: string
  created_at: string
}

export interface DashboardStats {
  total_tickets: number
  status_counts: { status: string; count: number }[]
  avg_resolution_time: number
  recent_tickets: number
  employee_performance: {
    id: number
    username: string
    full_name: string
    assigned_count: number
    resolved_count: number
    avg_resolution_time: number
  }[]
}

