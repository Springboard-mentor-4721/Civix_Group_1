import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats, User } from '../../models/api.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  stats: DashboardStats = {
    myPetitions: 0,
    successfulPetitions: 0,
    pollsParticipated: 0,
    activePetitionsNearYou: 0,
    petitionsPendingReview: 0,
    resolvedGrievances: 0,
    activeMunicipalPolls: 0,
    incomingPetitionsForDepartmentReview: 0
  };
  
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
    private readonly dashboardService: DashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef // Injected to force UI refreshes
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.fetchProfile();
      this.fetchStats();
      return;
    }
    const token = this.authService.getToken();
    if (!token) {
      this.loading = false;
      return;
    }
    this.authService.restoreSession().subscribe({
      next: () => {
        this.fetchProfile();
        this.fetchStats();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchProfile(): void {
    this.loading = true;
    this.authService.getCurrentUser().subscribe({
      next: (res: any) => {
        this.user = res?.data?.user || res?.data || res;
        this.loading = false;
        this.cdr.detectChanges(); // Force screen to update name/role
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        const incomingStats = res?.data?.stats;
        if (incomingStats && typeof incomingStats === 'object') {
          // Update stats and immediately alert Angular to redraw the numbers
          this.stats = { ...this.stats, ...incomingStats };
          this.cdr.detectChanges(); 
        }
      },
      error: () => {
        this.cdr.detectChanges(); 
      }
    });
  }

  get isOfficial(): boolean {
    return this.user?.role === 'official';
  }

  get userInitial(): string {
    return this.user?.name ? this.user.name.charAt(0).toUpperCase() : 'U';
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