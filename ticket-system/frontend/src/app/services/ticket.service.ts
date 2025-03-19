import { Injectable } from "@angular/core"
import type { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import type { Ticket, Comment, DashboardStats } from "../models/ticket.model"

@Injectable({
  providedIn: "root",
})
export class TicketService {
  constructor(private http: HttpClient) {}

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>("/api/tickets/")
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`/api/tickets/${id}/`)
  }

  createTicket(ticket: Partial<Ticket>): Observable<Ticket> {
    return this.http.post<Ticket>("/api/tickets/", ticket)
  }

  updateTicket(id: number, ticket: Partial<Ticket>): Observable<Ticket> {
    return this.http.patch<Ticket>(`/api/tickets/${id}/`, ticket)
  }

  deleteTicket(id: number): Observable<any> {
    return this.http.delete(`/api/tickets/${id}/`)
  }

  addComment(ticketId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`/api/tickets/${ticketId}/comments/`, { content })
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>("/api/tickets/dashboard_stats/")
  }
}

