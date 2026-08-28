import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({ selector: 'app-profile', standalone: true, templateUrl: './profile.component.html', styleUrl: './profile.component.css' })
export class ProfileComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void { this.auth.logout(); void this.router.navigate(['/login']); }
}
