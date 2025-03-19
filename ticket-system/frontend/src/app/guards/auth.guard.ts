import { Injectable } from "@angular/core"
import type { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router"
import type { AuthService } from "../services/auth.service"

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn) {
      // Check if route has data with allowed roles
      if (route.data && route.data["roles"]) {
        const userType = this.authService.currentUser?.user_type
        const allowedRoles = route.data["roles"] as string[]

        if (userType && allowedRoles.includes(userType)) {
          return true
        } else {
          this.router.navigate(["/unauthorized"])
          return false
        }
      }

      return true
    }

    this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
    return false
  }
}

