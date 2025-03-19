import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { HttpClientModule } from "@angular/common/http"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { NgChartsModule } from "ng2-charts"

import { AppRoutingModule } from "./app-routing.module"
import { AppComponent } from "./app.component"
import { HomeComponent } from "./components/home/home.component"
import { LoginComponent } from "./components/login/login.component"
import { RegisterComponent } from "./components/register/register.component"
import { DashboardComponent } from "./components/dashboard/dashboard.component"
import { TicketListComponent } from "./components/ticket-list/ticket-list.component"
import { TicketDetailComponent } from "./components/ticket-detail/ticket-detail.component"
import { TicketFormComponent } from "./components/ticket-form/ticket-form.component"
import { UserManagementComponent } from "./components/user-management/user-management.component"
import { NavbarComponent } from "./components/navbar/navbar.component"
import { UnauthorizedComponent } from "./components/unauthorized/unauthorized.component"
import { CommentFormComponent } from "./components/comment-form/comment-form.component"

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    TicketListComponent,
    TicketDetailComponent,
    TicketFormComponent,
    UserManagementComponent,
    NavbarComponent,
    UnauthorizedComponent,
    CommentFormComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule, ReactiveFormsModule, NgChartsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

