export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  user_type: "client" | "employee" | "director" | "admin"
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
  user_type: "client" | "employee" | "director" | "admin"
}

