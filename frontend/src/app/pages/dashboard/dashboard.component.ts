import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats, User } from '../../models/api.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

  feedPetitions: any[] = [];
  selectedPetitionForResponse: any = null;
  responsePayload = {
    status: 'under_review' as 'under_review' | 'closed' | 'active',
    comment: ''
  };
  submittingResponse: boolean = false;
  modalError: string = '';

  constructor(
    public authService: AuthService,
    private readonly dashboardService: DashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.user = currentUser;
      this.fetchProfile();
      this.fetchStats();
      this.fetchFeed();
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      this.loading = false;
      return;
    }

    this.authService.restoreSession().subscribe({
      next: (usr) => {
        if (usr) this.user = usr;
        this.fetchProfile();
        this.fetchStats();
        this.fetchFeed();
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
        this.fetchFeed();
        this.cdr.detectChanges();
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
          this.stats = { ...this.stats, ...incomingStats };
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  fetchFeed(): void {
    const query = {
      category: this.selectedCategory !== 'All Categories' ? this.selectedCategory : undefined
    };

    if (this.isOfficial) {
      this.dashboardService.getLocalityPetitions(query).subscribe({
        next: (res) => {
          this.feedPetitions = res?.data?.petitions || res?.petitions || [];
          this.cdr.detectChanges();
        },
        error: () => {
          this.feedPetitions = [];
          this.cdr.detectChanges();
        }
      });
    } else {
      this.dashboardService.getPetitions(query).subscribe({
        next: (res) => {
          this.feedPetitions = res?.data?.petitions || res?.petitions || [];
          this.cdr.detectChanges();
        },
        error: () => {
          this.feedPetitions = [];
          this.cdr.detectChanges();
        }
      });
    }
  }

  get isOfficial(): boolean {
    return this.user?.role === 'official';
  }

  get userInitial(): string {
    return this.user?.name ? this.user.name.charAt(0).toUpperCase() : 'U';
  }

  get displayLocation(): string {
    const city = (this.user?.location?.city || '').trim();
    const state = (this.user?.location?.state || '').trim();
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
    return 'All Jurisdictions';
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
    this.fetchFeed();
  }

  clearFilters(): void {
    this.selectedCategory = 'All Categories';
    this.fetchFeed();
  }

  openResponseModal(petition: any): void {
    this.modalError = '';
    this.selectedPetitionForResponse = petition;
    this.responsePayload = {
      status: petition.status === 'active' ? 'under_review' : petition.status,
      comment: ''
    };
  }

  closeResponseModal(): void {
    this.selectedPetitionForResponse = null;
    this.modalError = '';
  }

  submitOfficialAction(): void {
    if (!this.selectedPetitionForResponse) return;
    const comment = this.responsePayload.comment.trim();
    if (!comment) {
      this.modalError = 'Official comment cannot be empty.';
      return;
    }

    this.modalError = '';
    this.submittingResponse = true;
    this.dashboardService
      .respondToPetition(this.selectedPetitionForResponse._id, {
        comment,
        status: this.responsePayload.status
      })
      .subscribe({
        next: () => {
          this.selectedPetitionForResponse.status = this.responsePayload.status;
          this.submittingResponse = false;
          this.closeResponseModal();
          this.fetchStats();
          this.fetchFeed();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to submit official response:', err);
          this.modalError = err?.error?.message || 'Failed to submit official response.';
          this.submittingResponse = false;
          this.cdr.detectChanges();
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}