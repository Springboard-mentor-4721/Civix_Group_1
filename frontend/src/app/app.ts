import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from './services/auth.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  menuOpen = false;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split('?')[0].split('#')[0])
    ),
    { initialValue: this.router.url.split('?')[0].split('#')[0] }
  );

  readonly showSidebar = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return false;
    const path = this.currentUrl() || '';
    const noSidebarRoutes = ['/', '/login', '/register'];
    return !noSidebarRoutes.includes(path);
  });

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  logoutAndClose(): void {
    this.closeMenu();
    this.logout();
  }
}
