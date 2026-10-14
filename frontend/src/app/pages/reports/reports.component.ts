import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { User } from '../../models/api.models';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportComponent implements OnInit {
  user: User | null = null;
  activeTab: 'community' | 'activity' = 'community';
  loading: boolean = true;
  exporting: boolean = false;
  reportData: any = null;

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
      this.fetchReport();
    } else {
      this.authService.restoreSession().subscribe({
        next: (usr) => {
          if (usr) this.user = usr;
          this.fetchReport();
        },
        error: () => {
          this.fetchReport();
        }
      });
    }
  }

  fetchReport(): void {
    this.loading = true;
    this.dashboardService.getMonthlyReport().subscribe({
      next: (res) => {
        this.reportData = res?.data || null;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load report analytics', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get userInitial(): string {
    return this.user?.name ? this.user.name.charAt(0).toUpperCase() : 'S';
  }

  get isOfficial(): boolean {
    return this.user?.role === 'official';
  }

  get petitionPercentages() {
    const byStatus = this.reportData?.petitions?.byStatus;
    const active = byStatus?.active ?? 3;
    const underReview = byStatus?.under_review ?? 0;
    const closed = byStatus?.closed ?? 0;
    const total = active + underReview + closed;

    if (total === 0) return { active: 100, underReview: 0, closed: 0 };
    return {
      active: Math.round((active / total) * 100),
      underReview: Math.round((underReview / total) * 100),
      closed: Math.round((closed / total) * 100)
    };
  }

  get pollPercentages() {
    const byStatus = this.reportData?.polls?.byStatus;
    const active = byStatus?.active ?? 0;
    const closed = byStatus?.closed ?? 0;
    const total = active + closed;

    if (total === 0) return { active: 0, closed: 0, total: 0 };
    return {
      active: Math.round((active / total) * 100),
      closed: Math.round((closed / total) * 100),
      total
    };
  }

  get activeEngagementCount(): number {
    const activePetitions = this.reportData?.petitions?.byStatus?.active ?? 3;
    const activePolls = this.reportData?.polls?.byStatus?.active ?? 0;
    return activePetitions + activePolls;
  }

  exportData(): void {
    this.exporting = true;
    this.dashboardService.exportMonthlyReportCsv().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const now = new Date();
        const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        a.download = `civic-engagement-report-${yearMonth}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exporting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('CSV Export failed', err);
        this.exporting = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

// Export aliases to resolve route configuration naming variants:
export { ReportComponent as Reports };
export { ReportComponent as ReportsComponent };