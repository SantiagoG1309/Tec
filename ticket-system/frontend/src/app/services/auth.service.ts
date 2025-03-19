import { Injectable } from "@angular/core"
import type { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable, tap } from "rxjs"
import type { User, LoginRequest, RegisterRequest } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  constructor(private http: HttpClient) {
    this.loadCurrentUser()
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<User>("/api/login/", credentials, { withCredentials: true }).pipe(
      tap((user) => {
        this.currentUserSubject.next(user)
      }),
    )
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>("/api/users/", userData)
  }

  logout(): Observable<any> {
    return this.http.post("/api/logout/", {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUserSubject.next(null)
      }),
    )
  }

  loadCurrentUser(): void {
    this.http.get<User>("/api/current-user/", { withCredentials: true }).subscribe({
      next: (user) => {
        this.currentUserSubject.next(user)
      },
      error: () => {
        this.currentUserSubject.next(null)
      },
    })
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value
  }

  get isAdmin(): boolean {
    return this.currentUserSubject.value?.user_type === "admin"
  }

  get isDirector(): boolean {
    return this.currentUserSubject.value?.user_type === "director"
  }

  get isEmployee(): boolean {
    return this.currentUserSubject.value?.user_type === "employee"
  }

  get isClient(): boolean {
    return this.currentUserSubject.value?.user_type === "client"
  }
}

