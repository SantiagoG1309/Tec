import { NgModule } from "@angular/core"
import { RouterModule, type Routes } from "@angular/router"
import { HomeComponent } from "./components/home/home.component"
import { LoginComponent } from "./components/login/login.component"
import { RegisterComponent } from "./components/register/register.component"
import { DashboardComponent } from "./components/dashboard/dashboard.component"
import { TicketListComponent } from "./components/ticket-list/ticket-list.component"
import { TicketDetailComponent } from "./components/ticket-detail/ticket-detail.component"
import { TicketFormComponent } from "./components/ticket-form/ticket-form.component"
import { UserManagementComponent } from "./components/user-management/user-management.component"
import { UnauthorizedComponent } from "./components/unauthorized/unauthorized.component"
import { AuthGuard } from "./guards/auth.guard"

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin", "director"] },
  },
  {
    path: "tickets",
    component: TicketListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "tickets/new",
    component: TicketFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "tickets/:id",
    component: TicketDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "users",
    component: UserManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin", "director"] },
  },
  { path: "unauthorized", component: UnauthorizedComponent },
  { path: "**", redirectTo: "" },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

