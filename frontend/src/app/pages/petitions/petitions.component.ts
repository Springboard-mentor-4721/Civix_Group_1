import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs';

export interface Petition {
  _id?: string;
  title: string;
  category: string;
  location?: {
    city?: string;
    state?: string;
  };
  status: 'ACTIVE' | 'UNDER REVIEW' | 'CLOSED';
  description: string;
  signaturesCount?: number;
  signatureCount?: number;
  targetSignatures?: number;
  signatures?: number;
  goal?: number;
  createdBy?: any;
  createdDate?: string;
  createdAt?: string;
  hasSigned?: boolean;
}

@Component({
  selector: 'app-petitions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './petitions.component.html',
  styleUrl: './petitions.component.css'
})
export class Petitions implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly apiUrl = 'http://localhost:5000/api/petitions';

  activeTab: 'all' | 'my' | 'signed' = 'all';
  searchText = '';
  selectedCategory = 'All Categories';
  selectedLocation = 'All Locations';
  selectedStatus = 'All';

  loading = false;
  signingId: string | null = null;
  deletingId: string | null = null;
  currentUserId: string | null = null;

  currentPage = 1;
  totalPages = 1;
  totalPetitions = 0;

  showCreateModal = false;
  creating = false;
  modalError = '';

  categories = [
    'All Categories',
    'Infrastructure',
    'Environment',
    'Public Safety',
    'Health',
    'Education',
    'Transportation',
    'Sanitation',
    'Governance',
    'Other'
  ];

  locations = [
    'All Locations',
    'Delhi',
    'Maharashtra',
    'Uttar Pradesh',
    'Karnataka',
    'Tamil Nadu',
    'Gujarat',
    'Telangana',
    'West Bengal',
    'Rajasthan'
  ];

  statesList = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
  ];

  statuses = [
    { label: 'All Statuses', value: 'All' },
    { label: 'ACTIVE', value: 'active' },
    { label: 'UNDER REVIEW', value: 'under review' },
    { label: 'CLOSED', value: 'closed' }
  ];

  newPetition = {
    title: '',
    category: 'Infrastructure',
    description: '',
    targetSignatures: 100,
    city: '',
    state: 'Delhi'
  };

  petitions: Petition[] = [];

  ngOnInit(): void {
    this.extractCurrentUser();
    this.fetchPetitions();
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('token') || '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private extractCurrentUser(): void {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = payload.id || payload._id || null;
      }
    } catch {
      this.currentUserId = null;
    }
  }

  fetchPetitions(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', '6');

    if (this.searchText.trim()) {
      params = params.set('search', this.searchText.trim());
    }
    if (this.selectedCategory !== 'All Categories') {
      params = params.set('category', this.selectedCategory);
    }
    if (this.selectedLocation !== 'All Locations') {
      params = params.set('state', this.selectedLocation);
    }
    if (this.selectedStatus !== 'All') {
      params = params.set('status', this.selectedStatus);
    }

    const endpoint = this.activeTab === 'my'
      ? `${this.apiUrl}/my-petitions`
      : this.apiUrl;

    this.http.get<any>(endpoint, { params, headers: this.getAuthHeaders() })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          const payload = res?.data || res;
          const list = payload?.petitions || payload?.data || [];

          this.petitions = list.map((item: any) => {
            const currentSignatures = Number(
              item.signaturesCount ?? 
              item.signatureCount ?? 
              item.signatures ?? 
              0
            );

            const targetGoal = Number(
              item.targetSignatures ?? 
              item.goal ?? 
              100
            );

            return {
              ...item,
              signatures: currentSignatures,
              goal: targetGoal,
              hasSigned: Boolean(item.hasSigned),
              status: (item.status || 'ACTIVE').toUpperCase(),
              createdDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }) : 'Recently'
            };
          });

          this.totalPages = payload?.pagination?.pages || payload?.totalPages || 1;
          this.totalPetitions = payload?.pagination?.total || payload?.total || this.petitions.length;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to fetch petitions', err);
          this.petitions = [];
          this.cdr.detectChanges();
        }
      });
  }

  get filteredPetitions(): Petition[] {
    if (this.activeTab === 'signed') {
      return this.petitions.filter(p => p.hasSigned);
    }
    return this.petitions;
  }

  setTab(tab: 'all' | 'my' | 'signed'): void {
    this.activeTab = tab;
    this.fetchPetitions(1);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value;
    this.fetchPetitions(1);
  }

  onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedCategory = select.value;
    this.fetchPetitions(1);
  }

  onLocationChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedLocation = select.value;
    this.fetchPetitions(1);
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus = select.value;
    this.fetchPetitions(1);
  }

  getProgress(petition: Petition): number {
    const current = Number(
      petition.signatures ?? 
      petition.signaturesCount ?? 
      petition.signatureCount ?? 
      0
    );
    const target = Number(
      petition.goal ?? 
      petition.targetSignatures ?? 
      100
    );

    if (!target || target <= 0) return 0;
    const pct = Math.round((current / target) * 100);
    return Math.min(Math.max(pct, 0), 100);
  }

  getDisplayLocation(petition: Petition): string {
    if (typeof petition.location === 'string') return petition.location;
    if (petition.location?.city && petition.location?.state) {
      return `${petition.location.city}, ${petition.location.state}`;
    }
    return petition.location?.city || petition.location?.state || 'General';
  }

  isOwner(petition: Petition): boolean {
    if (!this.currentUserId || !petition.createdBy) return false;
    const creatorId = typeof petition.createdBy === 'object' ? petition.createdBy._id : petition.createdBy;
    return String(creatorId) === String(this.currentUserId);
  }

  signPetition(petition: Petition): void {
    if (!petition._id) return;
    this.signingId = petition._id;

    this.http.post<any>(
      `${this.apiUrl}/${petition._id}/sign`,
      {},
      { headers: this.getAuthHeaders() }
    )
    .pipe(
      finalize(() => {
        this.signingId = null;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: () => {
        petition.hasSigned = true;
        petition.signatures = (petition.signatures || 0) + 1;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to sign petition.';
        if (msg.toLowerCase().includes('already signed')) {
          petition.hasSigned = true;
          if (!petition.signatures || petition.signatures === 0) {
            petition.signatures = 1;
          }
        }
        alert(msg);
        this.cdr.detectChanges();
      }
    });
  }

  deletePetition(petition: Petition): void {
    if (!petition._id || !confirm('Are you sure you want to delete this petition?')) return;
    this.deletingId = petition._id;

    this.http.delete<any>(
      `${this.apiUrl}/${petition._id}`,
      { headers: this.getAuthHeaders() }
    )
    .pipe(
      finalize(() => {
        this.deletingId = null;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: () => {
        this.fetchPetitions(this.currentPage);
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to delete petition.');
        this.cdr.detectChanges();
      }
    });
  }

  openCreateModal(): void {
    this.modalError = '';
    this.newPetition = {
      title: '',
      category: 'Infrastructure',
      description: '',
      targetSignatures: 100,
      city: '',
      state: 'Delhi'
    };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  submitNewPetition(): void {
    this.modalError = '';

    const title = this.newPetition.title.trim();
    const description = this.newPetition.description.trim();
    const city = this.newPetition.city.trim();
    const state = this.newPetition.state;
    const target = Number(this.newPetition.targetSignatures);

    if (title.length < 5 || title.length > 200) {
      this.modalError = 'Title must be between 5 and 200 characters.';
      return;
    }

    if (description.length < 20 || description.length > 5000) {
      this.modalError = 'Description must be between 20 and 5000 characters.';
      return;
    }

    if (!city) {
      this.modalError = 'City is mandatory.';
      return;
    }

    if (!state) {
      this.modalError = 'Please select a state.';
      return;
    }

    if (!target || target < 1 || target > 1000000) {
      this.modalError = 'Target signatures must be between 1 and 1,000,000.';
      return;
    }

    this.creating = true;

    const payload = {
      title,
      category: this.newPetition.category,
      description,
      targetSignatures: target,
      location: {
        city,
        state
      }
    };

    this.http.post<any>(this.apiUrl, payload, { headers: this.getAuthHeaders() })
      .pipe(
        finalize(() => {
          this.creating = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.showCreateModal = false;
          this.newPetition = {
            title: '',
            category: 'Infrastructure',
            description: '',
            targetSignatures: 100,
            city: '',
            state: 'Delhi'
          };
          this.cdr.detectChanges();
          this.fetchPetitions(1);
        },
        error: (err) => {
          const backendErrors = err?.error?.errors;
          if (Array.isArray(backendErrors) && backendErrors.length > 0) {
            this.modalError = backendErrors.map((e: any) => e.message || e.msg).join(', ');
          } else {
            this.modalError = err?.error?.message || 'Failed to create petition.';
          }
          this.cdr.detectChanges();
        }
      });
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategory = 'All Categories';
    this.selectedLocation = 'All Locations';
    this.selectedStatus = 'All';
    this.fetchPetitions(1);
  }
}