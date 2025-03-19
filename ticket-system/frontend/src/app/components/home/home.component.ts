import { Component } from "@angular/core"
import type { Router } from "@angular/router"
import type { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent {
  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  navigateToLogin(): void {
    this.router.navigate(["/login"])
  }

  navigateToRegister(): void {
    this.router.navigate(["/register"])
  }
}

