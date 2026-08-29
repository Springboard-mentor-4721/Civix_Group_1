import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/api.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  loading: boolean = true;
  selectedCategory: string = 'All Categories';

  categories: string[] = [
    'All Categories',
    'Environment',
    'Infrastructure',
    'Education',
    'Public Safety',
    'Transportation',
    'Healthcare',
    'Housing'
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.loading = true;

    this.authService.getCurrentUser().subscribe({
      next: (res: any) => {
        this.user = res?.data?.user || res?.data || res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get isOfficial(): boolean {
    return this.user?.role === 'official';
  }

  get userInitial(): string {
    return this.user?.name
      ? this.user.name.charAt(0).toUpperCase()
      : 'U';
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
  }

  clearFilters(): void {
    this.selectedCategory = 'All Categories';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}