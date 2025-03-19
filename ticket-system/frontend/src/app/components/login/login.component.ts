import { Component } from "@angular/core"
import { type FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { Router, ActivatedRoute } from "@angular/router"
import type { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  loginForm: FormGroup
  loading = false
  error = ""
  returnUrl: string

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {
    // Redirect if already logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate(["/"])
    }

    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    })

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/"
  }

  get f() {
    return this.loginForm.controls
  }

  onSubmit() {
    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return
    }

    this.loading = true
    this.error = ""

    this.authService
      .login({
        username: this.f["username"].value,
        password: this.f["password"].value,
      })
      .subscribe({
        next: () => {
          this.router.navigate([this.returnUrl])
        },
        error: (error) => {
          this.error = error.error?.detail || "Error al iniciar sesión"
          this.loading = false
        },
      })
  }
}

