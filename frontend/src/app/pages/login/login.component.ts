import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiError } from '../../models/api.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  loading = false;
  serverMessage = '';
  fieldErrors: Record<string, string> = {};

  submit(): void {
    this.serverMessage = '';
    this.fieldErrors = {};
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: (error: ApiError) => this.showError(error),
      complete: () => { this.loading = false; },
    });
  }

  private showError(error: ApiError): void {
    this.loading = false;
    this.serverMessage = error.message || 'Unable to sign in. Please try again.';
    for (const item of error.errors ?? []) {
      if (item.field) this.fieldErrors[item.field] = item.message;
    }
  }
}
