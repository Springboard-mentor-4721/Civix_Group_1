import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { API_BASE_URL } from '../../services/auth.service';

export interface Official {
  _id?: string;
  name: string;
  role: string;
  department: string;
  location: string;
  email: string;
  phone: string;
  initials: string;
  status: string;
}

@Component({
  selector: 'app-officials',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './officials.html',
  styleUrl: './officials.css'
})
export class Officials implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  searchText = '';
  selectedDepartment = 'All Departments';
  selectedLocation = 'All Locations';
  loading = false;
  errorMessage = '';

  defaultDepartments = [
    'Municipal Corporation',
    'Public Works',
    'Transportation',
    'Education',
    'Health',
    'Environment',
    'Sanitation & Waste Management',
    'Water Supply & Sewage',
    'Urban Development',
    'General Administration'
  ];

  departments = ['All Departments', ...this.defaultDepartments];
  locations = ['All Locations', 'Noida', 'Delhi', 'Mumbai', 'Nagpur', 'Pune'];

  officials: Official[] = [];

  ngOnInit(): void {
    this.loadOfficials();
  }

  loadOfficials(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.http.get<{ success?: boolean; data?: any }>(`${API_BASE_URL}/official`).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        let rawList: any[] = [];
        if (Array.isArray(response?.data)) {
          rawList = response.data;
        } else if (response?.data && Array.isArray((response.data as any).officials)) {
          rawList = (response.data as any).officials;
        } else if (Array.isArray(response)) {
          rawList = response as any[];
        }

        if (rawList.length > 0) {
          this.officials = rawList.map((u) => this.mapUserToOfficial(u));
        } else {
          this.officials = [];
        }
        this.syncFilters();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load registered officials from API:', err);
        this.errorMessage = 'Unable to connect to live officials service. Loaded sample directory.';
        this.officials = this.getFallbackOfficials();
        this.syncFilters();
        this.cdr.markForCheck();
      }
    });
  }

  private getFallbackOfficials(): Official[] {
    return [
      {
        name: 'Aryan Agarwal',
        role: 'Municipal Corporation Officer',
        department: 'Municipal Corporation',
        location: 'Noida, Uttar Pradesh',
        email: 'aryan123@gmail.com',
        phone: '+91 98765 43210',
        initials: 'AA',
        status: 'ACTIVE'
      },
      {
        name: 'Box Officer',
        role: 'Public Works Officer',
        department: 'Public Works',
        location: 'Jurisdiction Assigned',
        email: 'box@gmail.com',
        phone: '+91 98765 43210',
        initials: 'BO',
        status: 'ACTIVE'
      }
    ];
  }

  private mapUserToOfficial(u: any): Official {
    const name = u.name || 'Official';
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'OF';

    const city = u.location?.city || '';
    const state = u.location?.state || '';
    const locationStr = [city, state].filter(Boolean).join(', ') || 'Jurisdiction Assigned';
    const dept = u.department || 'Municipal Corporation';

    return {
      _id: u._id,
      name,
      role: `${dept} Officer`,
      department: dept,
      location: locationStr,
      email: u.email || 'official@civix.org',
      phone: u.phone || '+91 98765 43210',
      initials,
      status: u.verification?.isVerified ? 'VERIFIED' : 'ACTIVE'
    };
  }

  private syncFilters(): void {
    const deptSet = new Set<string>(['All Departments', ...this.defaultDepartments]);
    const locSet = new Set<string>(['All Locations', 'Noida', 'Delhi', 'Mumbai', 'Nagpur', 'Pune']);

    for (const off of this.officials) {
      if (off.department) {
        deptSet.add(off.department);
      }
      if (off.location && off.location !== 'Jurisdiction Assigned') {
        const parts = off.location.split(',').map((p: string) => p.trim());
        for (const p of parts) {
          if (p) locSet.add(p);
        }
      }
    }

    this.departments = Array.from(deptSet);
    this.locations = Array.from(locSet);
  }

  get filteredOfficials(): Official[] {
    const search = this.searchText.toLowerCase().trim();

    return this.officials.filter((official) => {
      const matchesSearch =
        !search ||
        official.name.toLowerCase().includes(search) ||
        official.role.toLowerCase().includes(search) ||
        official.department.toLowerCase().includes(search) ||
        official.location.toLowerCase().includes(search) ||
        official.email.toLowerCase().includes(search);

      const matchesDepartment =
        this.selectedDepartment === 'All Departments' ||
        official.department.toLowerCase() === this.selectedDepartment.toLowerCase();

      const matchesLocation =
        this.selectedLocation === 'All Locations' ||
        official.location.toLowerCase().includes(this.selectedLocation.toLowerCase());

      return matchesSearch && matchesDepartment && matchesLocation;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedDepartment = 'All Departments';
    this.selectedLocation = 'All Locations';
  }
}
