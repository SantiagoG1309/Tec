import { Injectable } from "@angular/core"
import type { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import type { User, RegisterRequest } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>("/api/users/")
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`/api/users/${id}/`)
  }

  createUser(user: RegisterRequest): Observable<User> {
    return this.http.post<User>("/api/users/", user)
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`/api/users/${id}/`, user)
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`/api/users/${id}/`)
  }
}

