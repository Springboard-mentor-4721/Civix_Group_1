import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = computed(() => this.auth.currentUser());
  readonly isOfficial = computed(() => this.user()?.role === 'official');
  readonly userInitial = computed(() => {
    const name = this.user()?.name || '';
    return name.trim().charAt(0).toUpperCase() || 'U';
  });

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
